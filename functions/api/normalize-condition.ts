type Env = {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  EAPF_AI_ENABLED?: string
}

type PagesContext = {
  request: Request
  env: Env
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  })

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (env.EAPF_AI_ENABLED !== "true") {
    return json({ error: "ИИ-модуль пока не активирован администратором." }, 503)
  }

  if (request.headers.get("Origin") && request.headers.get("Origin") !== new URL(request.url).origin) {
    return json({ error: "Недопустимый источник запроса." }, 403)
  }

  if (!env.OPENAI_API_KEY || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Серверная конфигурация ИИ не завершена." }, 503)
  }

  const authorization = request.headers.get("Authorization") || ""
  if (!authorization.startsWith("Bearer ")) {
    return json({ error: "Требуется вход в EAPF." }, 401)
  }

  // Validate the Supabase access token server-side; never trust a token supplied by the browser alone.
  const authResponse = await fetch(new URL("/auth/v1/user", env.SUPABASE_URL), {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: authorization,
    },
  })
  if (!authResponse.ok) return json({ error: "Сеанс истёк. Войдите в EAPF повторно." }, 401)

  let body: { term?: unknown }
  try {
    body = await request.json() as { term?: unknown }
  } catch {
    return json({ error: "Некорректный формат запроса." }, 400)
  }

  if (typeof body.term !== "string" || body.term.trim().length < 2 || body.term.trim().length > 500) {
    return json({ error: "Введите формулировку длиной от 2 до 500 символов." }, 400)
  }

  const term = body.term.trim()
  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      store: false,
      max_output_tokens: 350,
      instructions: [
        "Ты выполняешь только лингвистическую нормализацию медицинской формулировки для справочной системы EAPF.",
        "Не ставь диагноз пациенту, не оценивай лечение и не давай клинических рекомендаций.",
        "Не додумывай отсутствующие сведения. Если формулировка неоднозначна, укажи это и предложи осторожную нейтральную нормализацию.",
        "Код ICD-10 указывай только если он однозначно соответствует формулировке; иначе code=null и coding_system='Не определена'.",
        "Всегда выставляй needs_clinician_review=true. Уверенность оценивает только качество сопоставления формулировки, а не истинность диагноза.",
        "Не запрашивай и не выводи персональные данные."
      ].join(" "),
      input: "Нормализуй только эту формулировку. Не добавляй сведения о пациенте: " + term,
      text: {
        format: {
          type: "json_schema",
          name: "condition_normalization",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              normalized_term: { type: "string" },
              explanation: { type: "string" },
              coding_system: { type: "string" },
              code: { type: ["string", "null"] },
              confidence: { type: "string", enum: ["high", "medium", "low"] },
              needs_clinician_review: { type: "boolean" }
            },
            required: ["normalized_term", "explanation", "coding_system", "code", "confidence", "needs_clinician_review"]
          }
        }
      }
    })
  })

  if (!aiResponse.ok) {
    return json({ error: "Сервис ИИ временно недоступен. Попробуйте позже." }, 502)
  }

  const payload = await aiResponse.json() as {
    output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>
  }
  const outputText = payload.output
    ?.flatMap(item => item.content || [])
    .find(item => item.type === "output_text")?.text

  if (!outputText) return json({ error: "ИИ не вернул распознанную формулировку." }, 502)

  try {
    const result = JSON.parse(outputText) as {
      normalized_term: string
      explanation: string
      coding_system: string
      code: string | null
      confidence: "high" | "medium" | "low"
      needs_clinician_review: boolean
    }
    result.needs_clinician_review = true
    return json(result)
  } catch {
    return json({ error: "Не удалось проверить формат ответа ИИ." }, 502)
  }
}
