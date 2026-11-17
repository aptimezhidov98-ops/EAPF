import { aceInhibitors } from './ace-inhibitors'

export type Drug = { name: string; className: string; status: string; note: string }

// The UI catalogue is derived from the structured ACE-inhibitor registry.
// Product availability and clinical details are deliberately not inferred here.
export const drugs: Drug[] = aceInhibitors.map(drug => ({
  name: drug.inn,
  className: 'иАПФ',
  status: drug.estoniaAvailability === 'not_checked'
    ? 'Регистрация и актуальная инструкция в Эстонии не проверены'
    : 'Требует проверки',
  note: drug.note,
}))

export const sections = [
  'Препараты',
  'Диагнозы',
  'Лаборатория',
  'Клинические рекомендации РФ',
  'Международные рекомендации',
  'Источники и инструкции',
  'Исследования',
]
