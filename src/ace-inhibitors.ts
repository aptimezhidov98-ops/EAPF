/**
 * EAPF — стартовый справочник ингибиторов АПФ.
 *
 * ВАЖНО:
 * - Каталог перечисляет международно известные действующие вещества, а не подтверждает
 *   их текущую регистрацию или доступность в Эстонии.
 * - Дозировки, показания, противопоказания, коррекция по СКФ и взаимодействия
 *   намеренно не заполнены до проверки актуальных SmPC конкретных препаратов.
 * - Любое клиническое утверждение должно иметь ссылку на источник, дату проверки,
 *   версию и статус экспертного утверждения.
 */

export type ReviewStatus = 'not_reviewed' | 'source_checked' | 'expert_approved'

export type AceInhibitor = {
  id: string
  inn: string
  atc: 'C09AA'
  className: 'Ингибитор ангиотензинпревращающего фермента'
  activation: string
  elimination: string
  estoniaAvailability: 'not_checked'
  reviewStatus: ReviewStatus
  note: string
  clinicalFields: {
    indications: null
    adultDosing: null
    renalAdjustment: null
    contraindications: null
    interactions: null
    monitoring: null
    pregnancy: null
  }
}

const pendingClinicalFields = {
  indications: null,
  adultDosing: null,
  renalAdjustment: null,
  contraindications: null,
  interactions: null,
  monitoring: null,
  pregnancy: null,
} as const

const pendingNote = 'Карточка ожидает проверки актуальной инструкции (SmPC), регистрации и доступности в Эстонии.'

export const aceInhibitors: AceInhibitor[] = [
  { id: 'ramipril', inn: 'Рамиприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — рамиприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Пролекарство; активный метаболит — рамиприлат.', clinicalFields: pendingClinicalFields },
  { id: 'perindopril', inn: 'Периндоприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — периндоприлат', elimination: 'Требует проверки по актуальной SmPC; учитывать конкретную соль и форму', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Пролекарство; существуют разные соли и лекарственные формы.', clinicalFields: pendingClinicalFields },
  { id: 'enalapril', inn: 'Эналаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — эналаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Пролекарство; активный метаболит — эналаприлат.', clinicalFields: pendingClinicalFields },
  { id: 'lisinopril', inn: 'Лизиноприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Активное вещество; метаболическая активация не требуется', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Активное вещество, не требует метаболической активации.', clinicalFields: pendingClinicalFields },
  { id: 'captopril', inn: 'Каптоприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Активное вещество', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Короткодействующий представитель класса.', clinicalFields: pendingClinicalFields },
  { id: 'fosinopril', inn: 'Фозиноприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — фозиноприлат', elimination: 'Почечный и печёночный пути выведения; клинические детали требуют проверки SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Пути выведения включают почечный и печёночный компоненты.', clinicalFields: pendingClinicalFields },
  { id: 'trandolapril', inn: 'Трандолаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — трандолаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Пролекарство; активный метаболит — трандолаприлат.', clinicalFields: pendingClinicalFields },
  { id: 'zofenopril', inn: 'Зофеноприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — зофеноприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: 'Сульфгидрильный представитель класса.', clinicalFields: pendingClinicalFields },
  { id: 'benazepril', inn: 'Беназеприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — беназеприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'quinapril', inn: 'Квинаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — квинаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'cilazapril', inn: 'Цилазаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — цилазаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'moexipril', inn: 'Моэксиприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — моэксиприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'imidapril', inn: 'Имидаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — имидаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'temocapril', inn: 'Темокаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — темокаприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'delapril', inn: 'Делаприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активные метаболиты требуют проверки источника', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'spirapril', inn: 'Спираприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит — спираприлат', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
  { id: 'alacepril', inn: 'Алацеприл', atc: 'C09AA', className: 'Ингибитор ангиотензинпревращающего фермента', activation: 'Пролекарство; активный метаболит требует проверки источника', elimination: 'Требует проверки по актуальной SmPC', estoniaAvailability: 'not_checked', reviewStatus: 'not_reviewed', note: pendingNote, clinicalFields: pendingClinicalFields },
]

export const aceInhibitorSources = [
  {
    id: 'kdigo-2024-ckd',
    title: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease',
    organization: 'KDIGO',
    year: 2024,
    url: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
    scope: 'РААС-блокада при ХБП, мониторинг АД, креатинина и калия, применение при альбуминурии',
    status: 'bibliographic_source_added_content_requires_review',
  },
  {
    id: 'esc-2024-hypertension',
    title: '2024 ESC Guidelines for the management of elevated blood pressure and hypertension',
    organization: 'European Society of Cardiology',
    year: 2024,
    doi: '10.1093/eurheartj/ehae178',
    url: 'https://academic.oup.com/eurheartj/article/45/38/3912/7741010',
    scope: 'Место иАПФ среди антигипертензивных препаратов и общая стратегия лечения',
    status: 'bibliographic_source_added_license_and_content_review_required',
  },
  {
    id: 'estonia-ravimiregister',
    title: 'Ravimiregister — Estonian Register of Medicinal Products',
    organization: 'Estonian State Agency of Medicines',
    url: 'https://www.ravimiregister.ee/',
    scope: 'Проверка действующих регистраций, упаковок и актуальных SmPC/PIL в Эстонии',
    status: 'registry_source_added_individual_products_not_yet_checked',
  },
] as const

export const aceInhibitorDataPolicy = {
  contentVersion: '0.1.0-draft',
  lastReviewed: null,
  approvedByClinician: false,
  clinicalUseAllowed: false,
  rule: 'Нельзя использовать для назначения или изменения терапии до проверки первоисточников и экспертного утверждения.',
  requiredForEachClinicalClaim: ['source', 'sourceDate', 'checkedAt', 'reviewer', 'reviewStatus'],
} as const
