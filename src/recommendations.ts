export type RecommendationSource = {
  id: string
  title: string
  publisher: string
  year: number
  version?: string
  jurisdiction: 'RU' | 'INT'
  status: 'active' | 'draft' | 'check_before_use'
  url: string
  appliesTo: string[]
  summary: string
  checkedAt: string
  sourceType: 'official_registry' | 'society_guideline' | 'primary_guideline'
}

export const russianClinicalRecommendations: RecommendationSource[] = [
  {
    id: 'ru-ah-2024-62-3',
    title: 'Артериальная гипертензия у взрослых',
    publisher: 'Минздрав России; Российское кардиологическое общество; РНМОТ',
    year: 2024,
    version: 'ID 62_3',
    jurisdiction: 'RU',
    status: 'active',
    url: 'https://cr.minzdrav.gov.ru/preview-cr/62_3',
    appliesTo: ['Артериальная гипертензия'],
    summary: 'Действующая версия в официальном рубрикаторе на дату проверки; пересмотр не позднее 2026 года. Применимость и конкретные лекарственные позиции следует сверять с полным текстом и алгоритмом.',
    checkedAt: '2026-11-17',
    sourceType: 'official_registry',
  },
  {
    id: 'ru-ckd-2024-469-3',
    title: 'Хроническая болезнь почек (ХБП)',
    publisher: 'Минздрав России; Национальная ассоциация нефрологов',
    year: 2024,
    version: 'ID 469_3',
    jurisdiction: 'RU',
    status: 'active',
    url: 'https://cr.minzdrav.gov.ru/preview-cr/469_3',
    appliesTo: ['Хроническая болезнь почек', 'Альбуминурия / протеинурия'],
    summary: 'В официальном рубрикаторе указаны статус «Действует» и применение; пересмотр не позднее 2026 года. Перед использованием открыть актуальную редакцию и проверить конкретный раздел терапии.',
    checkedAt: '2026-11-17',
    sourceType: 'official_registry',
  },
  {
    id: 'ru-chf-2024-156-2',
    title: 'Хроническая сердечная недостаточность',
    publisher: 'Минздрав России; Российское кардиологическое общество и профильные общества',
    year: 2024,
    version: 'ID 156; редакция 2024 (точный суффикс сверить в рубрикаторе)',
    jurisdiction: 'RU',
    status: 'check_before_use',
    url: 'https://cr.minzdrav.gov.ru/',
    appliesTo: ['Хроническая сердечная недостаточность', 'Сердечная недостаточность со сниженной ФВ'],
    summary: 'В доступной публикации версии 2024 года иАПФ рассматриваются в терапии ХСНнФВ; требуется сверить точную действующую редакцию и лекарственные положения непосредственно в официальном рубрикаторе.',
    checkedAt: '2026-11-17',
    sourceType: 'official_registry',
  },
  {
    id: 'ru-ihd-2024-155-2',
    title: 'Стабильная ишемическая болезнь сердца',
    publisher: 'Минздрав России; Российское кардиологическое общество и профильные общества',
    year: 2024,
    version: 'ID 155_2',
    jurisdiction: 'RU',
    status: 'active',
    url: 'https://cr.minzdrav.gov.ru/view-cr/155_2',
    appliesTo: ['Ишемическая болезнь сердца', 'Стабильная стенокардия'],
    summary: 'Официальная карточка Минздрава; учитывать иАПФ только при соответствующих клинических показаниях и с учётом полного текста рекомендации.',
    checkedAt: '2026-11-17',
    sourceType: 'official_registry',
  },
]

export const internationalRecommendations: RecommendationSource[] = [
  {
    id: 'esc-ckd-2026',
    title: '2026 ESC Guidelines for cardiovascular disease and chronic kidney disease',
    publisher: 'European Society of Cardiology / European Renal Association',
    year: 2026,
    version: 'DOI 10.1093/eurheartj/ehag098',
    jurisdiction: 'INT',
    status: 'active',
    url: 'https://doi.org/10.1093/eurheartj/ehag098',
    appliesTo: ['Хроническая болезнь почек', 'Альбуминурия / протеинурия'],
    summary: 'Новая рекомендация ESC 2026. В разделе ХБП рекомендуется максимально переносимая доза иАПФ или БРА в соответствующей популяции для контроля АД и снижения почечного и сердечно-сосудистого риска.',
    checkedAt: '2026-11-17',
    sourceType: 'primary_guideline',
  },
  {
    id: 'aha-htn-2025',
    title: '2025 AHA/ACC Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults',
    publisher: 'AHA / ACC и партнёрские профессиональные организации',
    year: 2025,
    jurisdiction: 'INT',
    status: 'active',
    url: 'https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline/',
    appliesTo: ['Артериальная гипертензия'],
    summary: 'Обновление 2025 года заменило американское руководство 2017 года; использовать как дополнительный международный источник, не вместо российских КР.',
    checkedAt: '2026-11-17',
    sourceType: 'society_guideline',
  },
  {
    id: 'kdigo-ckd-2024',
    title: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD',
    publisher: 'KDIGO',
    year: 2024,
    jurisdiction: 'INT',
    status: 'active',
    url: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
    appliesTo: ['Хроническая болезнь почек', 'Альбуминурия / протеинурия'],
    summary: 'Действующее опубликованное руководство KDIGO по ХБП. Используется как международный дополнительный источник; проверять разделы о РААС-блокаде и мониторинге.',
    checkedAt: '2026-11-17',
    sourceType: 'primary_guideline',
  },
  {
    id: 'kdigo-ckd-2027-draft',
    title: 'KDIGO 2027 CKD Guideline Focused Update — public review draft',
    publisher: 'KDIGO',
    year: 2026,
    version: 'Проект для общественного обсуждения, не финальная рекомендация',
    jurisdiction: 'INT',
    status: 'draft',
    url: 'https://kdigo.org/guidelines/',
    appliesTo: ['Хроническая болезнь почек'],
    summary: 'Не использовать как утверждённую клиническую рекомендацию. Проект обновления главы по медикаментозной терапии находился на общественном обсуждении; финальная версия на дату проверки не опубликована.',
    checkedAt: '2026-11-17',
    sourceType: 'primary_guideline',
  },
]

export const primarySources = [
  {
    id: 'ru-drug-registry',
    title: 'Государственный реестр лекарственных средств РФ (ГРЛС)',
    publisher: 'Минздрав России',
    url: 'https://grls.rosminzdrav.ru/',
    purpose: 'Проверка действующей инструкции по медицинскому применению конкретного зарегистрированного препарата в РФ.',
    checkedAt: '2026-11-17',
  },
  {
    id: 'ru-cr-rubricator',
    title: 'Рубрикатор клинических рекомендаций Минздрава России',
    publisher: 'Минздрав России',
    url: 'https://cr.minzdrav.gov.ru/',
    purpose: 'Главный источник для проверки действующей редакции российских клинических рекомендаций, статуса и даты утверждения.',
    checkedAt: '2026-11-17',
  },
  {
    id: 'esc-ckd-doi',
    title: 'ESC 2026 cardiovascular disease and CKD guideline',
    publisher: 'ESC / ERA',
    url: 'https://doi.org/10.1093/eurheartj/ehag098',
    purpose: 'Международный источник по сердечно-сосудистому риску и ХБП.',
    checkedAt: '2026-11-17',
  },
  {
    id: 'kdigo-2024',
    title: 'KDIGO 2024 CKD Guideline',
    publisher: 'KDIGO',
    url: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
    purpose: 'Международное руководство по диагностике и ведению ХБП.',
    checkedAt: '2026-11-17',
  },
]
