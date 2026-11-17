import { useMemo, useState, type FormEvent } from 'react'
import { Activity, BookOpen, FlaskConical, Search, ShieldCheck, Pill, FileText, Menu, Plus, X, Stethoscope, Sparkles, CheckCircle2 } from 'lucide-react'
import { drugs, sections } from './data'
import { russianClinicalRecommendations, primarySources } from './recommendations'
import { buildAceInhibitorComparison } from './clinical-matching'
import { buildEapfAceRecommendations, aceEvidenceStudies, aceDrugEvidence, evidenceMethods } from './ace-inhibitor-evidence'
import { buildAntihypertensivePlan, antihypertensiveDrugProfiles } from './antihypertensive-evidence'
import { allAntihypertensiveStudies, buildAntihypertensiveRankings } from './antihypertensive-ranking'
import { doseGuides, fixedCombinations } from './antihypertensive-dosing'

const conditionGroups = [
 { title: 'Сердечно-сосудистые заболевания', items: ['Артериальная гипертензия','Хроническая сердечная недостаточность','Сердечная недостаточность со сниженной ФВ','Ишемическая болезнь сердца','Состояние после инфаркта миокарда','Острый инфаркт миокарда (первые 24 часа)','Стабильная стенокардия','Фибрилляция предсердий','Перенесённый инсульт / ТИА','Заболевание периферических артерий'] },
 { title: 'Почки и обмен веществ', items: ['Хроническая болезнь почек','Альбуминурия / протеинурия','Сахарный диабет 1 типа','Сахарный диабет 2 типа','Метаболический синдром','Дислипидемия','Гиперкалиемия','Программный гемодиализ'] },
 { title: 'Другие состояния и факторы риска', items: ['Ожирение','Подагра / гиперурикемия','Беременность или её планирование','Пожилой возраст / старческая астения','Ортостатическая гипотензия','Обезвоживание / гиповолемия','Ангионевротический отёк в анамнезе','Двусторонний стеноз почечных артерий / стеноз артерии единственной почки','Грудное вскармливание'] },
 { title: 'Симптомы и непереносимость', items: ['Сухой кашель на фоне ранее назначенного иАПФ','Головокружение при вставании','Обмороки / предобморочные состояния','Одышка при нагрузке','Ортопноэ / ночные приступы удушья','Отёки нижних конечностей','Боль в груди в настоящее время','Одышка в покое','Резистентная артериальная гипертензия','Бронхиальная астма','Брадикардия / AV-блокада','Острая декомпенсация сердечной недостаточности'] }
]

export default function App() {
 const [query, setQuery] = useState('')
 const [active, setActive] = useState('Клинический помощник')
 const [recommendationTab, setRecommendationTab] = useState<'eapf' | 'ru'>('eapf')
 const [selected, setSelected] = useState<string[]>([])
 const [customText, setCustomText] = useState('')
 const [customConditions, setCustomConditions] = useState<string[]>(() => {
  try { return JSON.parse(localStorage.getItem('eapf-custom-conditions') || '[]') as string[] } catch { return [] }
 })
 const [suggested, setSuggested] = useState('')
 const [notice, setNotice] = useState('')
 const [mobileNavOpen, setMobileNavOpen] = useState(false)
 const [normalizing, setNormalizing] = useState(false)
 const [preparedData, setPreparedData] = useState<Record<string, string> | null>(null)
 const prepareData = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const values: Record<string, string> = {}
  new FormData(event.currentTarget).forEach((value, key) => {
   if (typeof value === 'string') values[key] = value
  })
  setPreparedData(values)
 }
 const [normalization, setNormalization] = useState<{ normalized_term: string; explanation: string; coding_system: string; code: string | null; confidence: 'high' | 'medium' | 'low'; needs_clinician_review: boolean } | null>(null)
 const filtered = useMemo(() => drugs.filter(d => d.name.toLowerCase().includes(query.toLowerCase())), [query])
 const toggle = (item: string) => setSelected(old => old.includes(item) ? old.filter(x => x !== item) : [...old, item])
 const addCustom = async () => {
  const value = customText.trim()
  if (!value || normalizing) return
  setSuggested(value)
  setNormalization(null)
  setNotice('Можно подтвердить формулировку вручную. ИИ включится после настройки защищённого входа и серверного доступа.')
  setNormalizing(true)
  try {
   const token = sessionStorage.getItem('eapf_access_token')
   if (!token) return
   const response = await fetch('/api/normalize-condition', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ term: value }) })
   const result = await response.json()
   if (!response.ok) throw new Error(result.error || 'Не удалось обработать формулировку')
   setNormalization(result)
   setSuggested(result.normalized_term || value)
   setNotice('ИИ предложил стандартизированную формулировку. Проверьте её и подтвердите вручную.')
  } catch (error) {
   setNotice(error instanceof Error ? error.message : 'ИИ-нормализация сейчас недоступна. Можно продолжить вручную.')
  } finally { setNormalizing(false) }
 }
 const confirmCustom = () => {
  const value = suggested.trim()
  if (!value) return
  const next = [...new Set([...customConditions, value])]
  setCustomConditions(next)
  localStorage.setItem('eapf-custom-conditions', JSON.stringify(next))
  setSelected(old => old.includes(value) ? old : [...old, value])
  setCustomText('')
  setSuggested('')
  setNormalization(null)
  setNotice('Состояние добавлено в личный список на этом устройстве со статусом «не проверено».')
 }
 const patientRecommendations = russianClinicalRecommendations.filter(item => item.appliesTo.some(condition => selected.includes(condition)))
 const aceComparison = useMemo(() => buildAceInhibitorComparison(selected, preparedData || {}), [selected, preparedData])
 const eapfAceRecommendations = useMemo(() => buildEapfAceRecommendations(selected, preparedData || {}), [selected, preparedData])
 const antihypertensivePlan = useMemo(() => buildAntihypertensivePlan(selected, preparedData || {}), [selected, preparedData])
 const antihypertensiveRankings = useMemo(() => buildAntihypertensiveRankings(selected, preparedData || {}), [selected, preparedData])
 const classOutcomeEvidence = aceEvidenceStudies.find(study => study.id === 'ace-cv-class-meta-2026')
 const adverseEvidence = aceEvidenceStudies.find(study => study.id === 'ace-adverse-meta-2022')
 const comparativeEvidence = aceEvidenceStudies.find(study => study.id === 'ace-comparative-cohort-2018')
 const coughEvidence = aceEvidenceStudies.find(study => study.id === 'ace-cough-meta-2023')
 const networkEvidence = aceEvidenceStudies.find(study => study.id === 'ace-hf-network-2016')
 const cadthEvidence = aceEvidenceStudies.find(study => study.id === 'cadth-ace-comparative-2008')
 const postMiComparativeEvidence = aceEvidenceStudies.find(study => study.id === 'ace-postmi-cohort-2004')
 const anbp2Evidence = aceEvidenceStudies.find(study => study.id === 'anbp2-2003')
 const combinedVascularEvidence = aceEvidenceStudies.find(study => study.id === 'hope-europa-peace-combined-2006')
 const stableCadReview = aceEvidenceStudies.find(study => study.id === 'stable-cad-ras-meta-2017')
 const nav = ['Клинический помощник', ...sections]
 return <div className="app-shell">
  <aside className={mobileNavOpen?'sidebar mobile-open':'sidebar'}><div className="brand"><div className="brand-mark">E</div><div><b>EAPF</b><small>Medical reference</small></div></div>
   <div className="side-label">РАЗДЕЛЫ</div>{nav.map((s,i)=><button key={s} className={active===s?'nav-item active':'nav-item'} onClick={()=>{setActive(s);setMobileNavOpen(false)}}>{i===0?<Stethoscope size={18}/>:i===1?<Pill size={18}/>:i===2?<Activity size={18}/>:i===3?<FlaskConical size={18}/>:i===4?<BookOpen size={18}/>:i===5?<FileText size={18}/>:<ShieldCheck size={18}/>}{s}</button>)}
   <div className="sidebar-foot">Экспертная медицинская платформа<br/><span>Версия 0.2 · демонстрационный режим</span></div>
  </aside>
  <main className="main"><header className="topbar"><button className="mobile-menu" aria-label="Меню" aria-expanded={mobileNavOpen} onClick={()=>setMobileNavOpen(v=>!v)}><Menu/></button><span>EAPF · КЛИНИЧЕСКИЙ ПОМОЩНИК</span><span className="top-status"><i/> База: антигипертензивная терапия</span></header>
   {active==='Клинический помощник'?<section className="clinical"><form className="clinical-form" onSubmit={prepareData}>
    <div className="workspace-brand"><div className="workspace-brand-mark"><Plus size={25}/></div><div className="workspace-brand-copy"><b>Медбаза</b><span>МЕДИЦИНСКАЯ СИСТЕМА ПОДДЕРЖКИ РЕШЕНИЙ</span></div><span className="workspace-brand-tag">EAPF</span></div><div className="clinical-intro"><div className="eyebrow">КЛИНИЧЕСКИЙ СЛУЧАЙ</div><h1>Подбор терапии</h1><p>Создайте клинический случай, чтобы подобрать обоснованные варианты лечения с учётом индивидуальных особенностей пациента.</p></div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">01</span><h2>Данные пациента</h2></div><span className="optional">Без персональных идентификаторов</span></div>
     <div className="patient-grid"><label>Возраст, лет<input name="age" type="number" min="0" placeholder="Например, 64"/></label><label>Пол<select name="sex" defaultValue=""><option value="" disabled>Выберите</option><option>Женский</option><option>Мужской</option><option>Не указан</option></select></label><label>Юрисдикция<select name="jurisdiction" defaultValue="RU"><option value="RU">Российская Федерация</option><option value="EE">Эстония</option><option value="INT">Международная / другая</option></select></label><label>Рост, см<input name="height" type="number" placeholder="Например, 172"/></label><label>Вес, кг<input name="weight" type="number" placeholder="Например, 82"/></label><label>АД, мм рт. ст.<input name="blood_pressure" placeholder="Например, 145/90"/></label><label>ЧСС, уд/мин<input name="heart_rate" type="number" placeholder="Например, 76"/></label><label>ФВ ЛЖ, %<input name="lvef" type="number" min="5" max="85" placeholder="Например, 35"/></label></div>
    </div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">02</span><h2>Диагнозы и заболевания</h2></div><span className="optional">Можно выбрать несколько</span></div>
     <div className="selected-line"><b>Выбрано: {selected.length}</b>{selected.length>0&&<button type="button" className="text-button" onClick={()=>setSelected([])}>Очистить выбор</button>}</div>
     {conditionGroups.map(group=><div className="condition-group" key={group.title}><h3>{group.title}</h3><div className="condition-options">{group.items.map(item=><button type="button" key={item} className={selected.includes(item)?'condition-chip chosen':'condition-chip'} onClick={()=>toggle(item)}><span className="check">{selected.includes(item)?'✓':'+'}</span>{item}</button>)}</div></div>)}
     {customConditions.length>0&&<div className="condition-group"><h3>Мои добавленные состояния</h3><div className="condition-options">{customConditions.map(item=><button type="button" key={item} className={selected.includes(item)?'condition-chip chosen':'condition-chip'} onClick={()=>toggle(item)}><span className="check">{selected.includes(item)?'✓':'+'}</span>{item}<span className="unverified-tag">не проверено</span></button>)}</div></div>}
     <div className="custom-entry"><div className="custom-heading"><Sparkles size={17}/><b>Нет нужного диагноза или состояния?</b></div><p>ИИ может предложить стандартную формулировку и возможный код классификатора. Это не подтверждение диагноза: каждое предложение требует проверки врачом. В запрос отправляется только введённая формулировка, без данных пациента.</p><div className="custom-row"><input value={customText} onChange={e=>{setCustomText(e.target.value);setSuggested('');setNotice('')}} onKeyDown={e=>{if(e.key==='Enter')addCustom()}} placeholder="Например: перенесённый эпизод острого повреждения почек"/><button type="button" onClick={addCustom} disabled={!customText.trim()||normalizing}>{normalizing?'Обработка…':<><Sparkles size={16}/> Предложить формулировку</>}</button></div>
      {suggested&&<div className="suggestion"><div><span className="suggestion-label">Предложение · требует проверки врачом</span><b>{suggested}</b>{normalization&&<><span className="suggestion-meta">{normalization.explanation}</span><span className="suggestion-meta">Классификация: {normalization.coding_system}{normalization.code?` · ${normalization.code}`:''} · уверенность: {normalization.confidence==='high'?'высокая':normalization.confidence==='medium'?'средняя':'низкая'}</span></>}</div><div className="suggestion-actions"><button type="button" className="confirm-button" onClick={confirmCustom}><CheckCircle2 size={15}/> Добавить в мой список</button><button type="button" className="icon-button" onClick={()=>{setSuggested('');setNormalization(null)}} aria-label="Отменить"><X size={16}/></button></div></div>}
      {notice&&<div className="inline-notice">{notice}</div>}
     </div>
    </div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">03</span><h2>Анализы, обследования и терапия</h2></div><span className="optional">Можно заполнить позже</span></div><div className="patient-grid"><label>Креатинин, мкмоль/л<input name="creatinine" type="number" placeholder="Значение"/></label><label>рСКФ, мл/мин/1,73 м²<input name="egfr" type="number" placeholder="Значение"/></label><label>Калий, ммоль/л<input name="potassium" type="number" step="0.1" placeholder="Значение"/></label><label>Натрий, ммоль/л<input name="sodium" type="number" placeholder="Значение"/></label><label>Альбуминурия / ACR<input name="acr" placeholder="Значение и единицы"/></label><label>Протеинурия за 24 часа, г/сут<input name="proteinuria24h" type="number" step="0.1" placeholder="Например, 3,2"/></label><label>Текущие препараты<input name="medications" placeholder="Перечислите препараты"/></label><label>Время от начала острого ИМ, часов<input name="mi_hours" type="number" min="0" placeholder="Если ИМ произошёл недавно"/></label></div></div>
    <div className="clinical-footer"><p><ShieldCheck size={17}/> Результат будет носить справочный характер и не заменит клиническое решение врача.</p><button type="submit" className="analyze-button">Подготовить данные к анализу <span>→</span></button></div>
    {preparedData&&<div className="patient-panel analysis-preview"><div className="panel-title"><div><span className="step">04</span><h2>Данные подготовлены</h2></div><span className="optional">Только на этом устройстве</span></div><p>Ниже собраны введённые значения и выбранные состояния. Ниже показано пилотное сопоставление иАПФ с выбранными состояниями и данными. Оно основано на ограниченном наборе вручную привязанных источников и не является назначением или валидированным клиническим алгоритмом.</p><div className="patient-grid">{Object.entries(preparedData).filter(([,value])=>value.trim()).map(([key,value])=><div className="prepared-item" key={key}><small>{{age:'Возраст',sex:'Пол',jurisdiction:'Юрисдикция рекомендаций',mi_hours:'Часы от начала острого ИМ',height:'Рост',weight:'Вес',blood_pressure:'Артериальное давление',heart_rate:'Частота сердечных сокращений',lvef:'Фракция выброса ЛЖ',creatinine:'Креатинин',egfr:'рСКФ',potassium:'Калий',sodium:'Натрий',acr:'Альбуминурия / ACR',proteinuria24h:'Суточная протеинурия, г/сут',medications:'Текущие препараты'}[key]||key}</small><b>{value}</b></div>)}</div><div className="condition-group"><h3>Выбранные состояния ({selected.length})</h3><p>{selected.length?selected.join(' · '):'Состояния не выбраны'}</p></div><div className="patient-recommendations">
      <div className="recommendation-tabs" role="tablist" aria-label="Варианты рекомендаций">
       <button type="button" role="tab" aria-selected={recommendationTab==='eapf'} className={recommendationTab==='eapf'?'recommendation-tab active':'recommendation-tab'} onClick={()=>setRecommendationTab('eapf')}>Рекомендации EAPF</button>
       <button type="button" role="tab" aria-selected={recommendationTab==='ru'} className={recommendationTab==='ru'?'recommendation-tab active':'recommendation-tab'} onClick={()=>setRecommendationTab('ru')}>Клинические рекомендации РФ</button>
      </div>
      <div className="match-summary"><b>Клинический профиль:</b> {aceComparison.summary.length ? aceComparison.summary.join(' · ') : 'не сформирован — выберите состояния выше'}{aceComparison.bmi!==null&&<> · ИМТ: {aceComparison.bmi} кг/м²</>}{aceComparison.acrCategory&&<> · ACR: категория {aceComparison.acrCategory} по KDIGO</>}{aceComparison.egfrCategory&&<> · рСКФ: категория {aceComparison.egfrCategory}</>}<p>{aceComparison.limitation}</p>{aceComparison.renalMonitoring&&<p className="renal-monitoring">{aceComparison.renalMonitoring} <a href="https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf" target="_blank" rel="noreferrer">KDIGO 2024 ↗</a></p>}{aceComparison.acrNeedsCkdConfirmation&&<p className="renal-monitoring">ACR соответствует категории {aceComparison.acrCategory}, но лабораторное значение само по себе не устанавливает диагноз ХБП. Требуются клиническая оценка и подтверждение стойкости изменения.</p>}</div>
      {aceComparison.urgentSymptom&&<div className="match-alert danger"><b>Требуется срочная клиническая оценка.</b> Отмечены боль в груди в настоящее время или одышка в покое. Алгоритм подбора препарата остановлен.</div>}
      {aceComparison.hardStop&&<div className="match-alert danger"><b>Автоматическое сопоставление остановлено.</b> Введён критический фактор: беременность/планирование, ангионевротический отёк в анамнезе, двусторонний стеноз почечных артерий/стеноз артерии единственной почки либо калий ≥5,5 ммоль/л либо одновременный приём сакубитрила/валсартана. В этой ситуации система не ранжирует иАПФ. Детский возраст также не обрабатывается этим взрослым модулем.</div>}
      {aceComparison.caution.map((item, index)=><div className="match-alert" key={index}>{item}</div>)}
      {recommendationTab==='eapf'?<div className="eapf-recommendation-view">
       <div className="eapf-intro"><b>Рекомендации EAPF</b><p>Препараты упорядочены по соответствию имеющимся клиническим доказательствам для выбранного профиля. Одинаковый уровень означает равную позицию; это не доказательство превосходства одного препарата.</p></div>
       {antihypertensivePlan.warnings.map((warning,index)=><div className="match-alert" key={'ah-warning-'+index}>{warning}</div>)}
       
        {(antihypertensivePlan.items.length>0||antihypertensivePlan.hasHypertension)&&<section className="clinical-plan combination-first">
         <div className="clinical-plan-heading"><div><span className="plan-kicker">ОСНОВНОЙ РЕЗУЛЬТАТ ПОДБОРА</span><h3>Рекомендуемые комбинации препаратов</h3><p>{antihypertensivePlan.summary}</p></div></div>
         {antihypertensivePlan.items.map((item,index)=>{
          const profiles=item.drugIds.map(id=>antihypertensiveDrugProfiles.find(drug=>drug.id===id)).filter((drug):drug is typeof antihypertensiveDrugProfiles[number]=>Boolean(drug));
          const grouped=new Map<string,typeof profiles>();
          profiles.forEach(drug=>grouped.set(drug.group,[...(grouped.get(drug.group)||[]),drug]));
          const combinationLinks=fixedCombinations.filter(combo=>{
           const ids=profiles.map(drug=>drug.id);
           const rasChoice=item.drugIds.some(id=>/ACEI|иАПФ|ARB|БРА|блокатор РААС/i.test(id));
           return (combo.name==='Exforge'&&ids.includes('amlodipine')&&(ids.includes('valsartan')||rasChoice))||
            (combo.name==='Twynsta'&&ids.includes('amlodipine')&&(ids.includes('telmisartan')||rasChoice))||
            (combo.name==='Hyzaar'&&ids.includes('hydrochlorothiazide')&&(ids.includes('losartan')||rasChoice))||
            (combo.name==='MicardisPlus'&&ids.includes('hydrochlorothiazide')&&(ids.includes('telmisartan')||rasChoice))||
            (combo.name==='Exforge HCT'&&ids.includes('amlodipine')&&ids.includes('hydrochlorothiazide')&&rasChoice);
          });
          const sourceStudies=item.sources.map(id=>allAntihypertensiveStudies.find(study=>study.id===id)).filter((study):study is typeof allAntihypertensiveStudies[number]=>Boolean(study));
          const rasChoice=item.drugIds.some(id=>/ACEI|иАПФ|ARB|БРА|блокатор РААС/i.test(id));
          const hasDhp=profiles.some(drug=>drug.group==='Блокаторы кальциевых каналов' && ['amlodipine','nifedipine-er','felodipine'].includes(drug.id));
          const hasThiazide=profiles.some(drug=>drug.group==='Тиазидные и тиазидоподобные диуретики');
          const hasLoop=profiles.some(drug=>drug.group==='Петлевые диуретики');
          const hasBeta=profiles.some(drug=>drug.group==='Бета-блокаторы');
          const hasMra=profiles.some(drug=>drug.group==='Антагонисты минералокортикоидных рецепторов');
          const hasHfrEF=selected.includes('Сердечная недостаточность со сниженной ФВ') || (selected.includes('Хроническая сердечная недостаточность') && Number(preparedData?.lvef||0)>0 && Number(preparedData?.lvef)<=40);
          const hasCkdAlbuminuria=selected.includes('Хроническая болезнь почек') && selected.includes('Альбуминурия / протеинурия');
          const hasDiabetes=selected.includes('Сахарный диабет 1 типа')||selected.includes('Сахарный диабет 2 типа');
          const hasCongestion=selected.includes('Отёки нижних конечностей')||selected.includes('Ортопноэ / ночные приступы удушья')||selected.includes('Одышка в покое')||selected.includes('Острая декомпенсация сердечной недостаточности');
          const resistantCase=selected.includes('Резистентная артериальная гипертензия');
          const bpParts=(preparedData?.blood_pressure||'').split(/[\\/]/).map(value=>Number(value.trim()));
          const diastolicPredominant=bpParts.length===2&&Number.isFinite(bpParts[0])&&Number.isFinite(bpParts[1])&&bpParts[1]>=90&&bpParts[0]<140;
          const displayTitle=hasHfrEF
            ? (hasLoop?'Блокада РААС + бета-блокатор + диуретик':hasMra?'Блокада РААС + бета-блокатор + антагонист минералокортикоидных рецепторов':'Блокада РААС + бета-блокатор')
            : rasChoice&&hasDhp?'Блокатор РААС + блокатор кальциевых каналов'
            : rasChoice&&(hasThiazide||hasLoop)?'Блокатор РААС + диуретик'
            : hasDhp&&hasThiazide?'Блокатор кальциевых каналов + диуретик'
            : hasBeta&&hasMra?'Бета-блокатор + антагонист минералокортикоидных рецепторов'
            : item.title;
          let clinicalWhy=item.reason;
          let mechanism='';
          if(hasHfrEF){
            clinicalWhy='При сердечной недостаточности со сниженной ФВ приоритет определяется не только уровнем АД, но и влиянием на прогноз. Блокада РААС/ARNI и бета-блокатор с доказательствами при ХСНнФВ воздействуют на патологическую нейрогуморальную активацию и ремоделирование миокарда. '+(hasCongestion?'Отмеченные признаки возможного застоя требуют отдельной оценки объёмного статуса; петлевой диуретик нужен для устранения подтверждённой перегрузки жидкостью, но сам по себе не считается доказанным средством снижения смертности.':'При отсутствии признаков застоя петлевой диуретик не добавляется автоматически: его назначение определяется клиническим объёмным статусом.');
            mechanism='Блокатор РААС уменьшает эффекты ангиотензина II и альдостерона, снижая вазоконстрикцию, задержку натрия и неблагоприятное ремоделирование. Бета-блокатор снижает хроническую симпатическую стимуляцию, ЧСС и риск аритмий, а при ХСНнФВ улучшает клинические исходы. Диуретик при застое уменьшает внутрисосудистый/интерстициальный избыток жидкости и давление наполнения, облегчая отёки и одышку; это симптоматическая, а не самостоятельная прогностическая роль.';
          } else if(hasCkdAlbuminuria){
            clinicalWhy='При сочетании ХБП и альбуминурии блокатор РААС имеет приоритет из-за нефропротективного эффекта: он снижает внутриклубочковое давление и альбуминурию. Если требуется дополнительное снижение АД, второй компонент выбирается по уровню АД, рСКФ, калию и объёмному статусу. '+(hasDiabetes?'При сопутствующем сахарном диабете особенно важна оценка альбуминурии и риска прогрессирования диабетической болезни почек.':'');
            mechanism='Блокада ангиотензина II расширяет выносящую артериолу клубочка, уменьшает внутриклубочковое давление и утечку альбумина. Дигидропиридиновый БКК снижает периферическое сосудистое сопротивление; диуретик уменьшает натрий- и водозависимый компонент АД, если он присутствует.';
          } else if(rasChoice&&hasDhp){
            clinicalWhy='При артериальной гипертензии без установленного специального показания к диуретику сочетание одного блокатора РААС с длительно действующим дигидропиридиновым БКК обеспечивает два взаимодополняющих механизма снижения АД. Если есть альбуминурия, ХБП или другое показание к блокаде РААС, это дополнительно влияет на выбор первого компонента.';
            mechanism='Дигидропиридиновый БКК блокирует L-типа кальциевые каналы в гладкой мускулатуре артериол и снижает периферическое сопротивление. Блокатор РААС подавляет ангиотензин-зависимую вазоконстрикцию и нейрогуморальную компенсацию. Комбинация воздействует на сосудистый тонус разными путями; амлодипин-ассоциированные периферические отёки требуют отдельной оценки.';
          } else if(rasChoice&&(hasThiazide||hasLoop)){
            clinicalWhy='При АГ сочетание блокатора РААС с диуретиком оправдано, когда требуется дополнительное снижение АД и/или есть натрий- и водозависимый компонент. Тиазидный/тиазидоподобный препарат обычно используется для длительного контроля АД; петлевой диуретик рассматривают прежде всего при застое или отдельных ситуациях выраженного снижения рСКФ. '+(hasCongestion?'Отмеченные отёки/одышка усиливают необходимость проверить наличие застоя, но сами по себе не доказывают сердечную недостаточность.':'При отсутствии клинического застоя диуретик не следует трактовать как обязательное средство удаления жидкости; выбор зависит от АД, рСКФ и электролитов.');
            mechanism='Диуретик усиливает выведение натрия и воды, снижая объёмную составляющую АД и сосудистую реактивность. Блокатор РААС ограничивает ангиотензин-зависимую вазоконстрикцию и альдостерон-зависимую задержку натрия. Сочетание воздействует на объёмный и нейрогуморальный компоненты, но требует контроля креатинина, рСКФ, натрия и калия.';
          } else if(resistantCase&&hasMra){
            clinicalWhy='При истинной резистентной АГ антагонист минералокортикоидных рецепторов может быть эффективным дополнительным компонентом после подтверждения приверженности, адекватных доз базовой тройной терапии и исключения вторичных причин. Это не стартовая комбинация для обычной АГ.';
            mechanism='При резистентной АГ нередко сохраняется альдостерон-зависимая задержка натрия. Спиронолактон блокирует минералокортикоидный рецептор и уменьшает этот механизм; одновременно возрастает риск гиперкалиемии и ухудшения функции почек.';
          } else if(hasDhp){
            clinicalWhy='Дигидропиридиновый БКК снижает АД за счёт уменьшения периферического сосудистого сопротивления. При преимущественном повышении диастолического давления это физиологически релевантный механизм, однако один показатель диастолического АД сам по себе не доказывает преимущество БКК над другими препаратами первой линии.';
            mechanism='Блокада L-типа кальциевых каналов в артериолах вызывает вазодилатацию и снижает общее периферическое сопротивление. При изолированном повышении диастолического АД нужно подтвердить измерения, оценить возраст, систолическое АД и общий сердечно-сосудистый риск.';
          }
          const combinationLinks=fixedCombinations.filter(combo=>{
           const ids=profiles.map(drug=>drug.id);
           return (combo.name==='Exforge'&&ids.includes('amlodipine')&&(ids.includes('valsartan')||rasChoice))||
            (combo.name==='Twynsta'&&ids.includes('amlodipine')&&(ids.includes('telmisartan')||rasChoice))||
            (combo.name==='Hyzaar'&&ids.includes('hydrochlorothiazide')&&(ids.includes('losartan')||rasChoice))||
            (combo.name==='MicardisPlus'&&ids.includes('hydrochlorothiazide')&&(ids.includes('telmisartan')||rasChoice))||
            (combo.name==='Exforge HCT'&&ids.includes('amlodipine')&&ids.includes('hydrochlorothiazide')&&rasChoice);
          });
          const aliases:Record<string,string[]>={'RU-АГ-2024':['esc-htn-2024'],'ESC-2024':['esc-htn-2024'],'PATHWAY-2':['pathway2'],'ACCOMPLISH':['accomplish'],'ALLHAT':['allhat'],'SHEP':['shep'],'HYVET':['hyvet'],'IDNT':['idnt-irbesartan'],'RENAAL':['renaal-losartan'],'CIBIS-II':['cibis2'],'MERIT-HF':['merit-hf'],'COPERNICUS':['copernicus'],'RALES':['rales'],'EPHESUS':['ephesus'],'CHARM-Alternative':['charm-alt'],'VALIANT':['valiant-valsartan'],'ASCOT':['ascot'],'SYST-EUR':['syst-eur'],'DCP':['dcp'],'CLICK':['click']};
          const wantedStudyIds=item.sources.flatMap(source=>aliases[source]||[source.toLowerCase()]);
          const sourceStudies=allAntihypertensiveStudies.filter(study=>wantedStudyIds.includes(study.id));
          const combinationSpecific=sourceStudies.filter(study=>study.id==='accomplish');
          const strategyStudies=sourceStudies.filter(study=>['ascot','hyvet','syst-eur','allhat'].includes(study.id));
          const componentStudies=sourceStudies.filter(study=>!combinationSpecific.includes(study)&&!strategyStudies.includes(study));
          return <details className="strategy-card combination-card combination-details" key={item.title}>
           <summary className="combination-summary"><span className="strategy-priority">{'Приоритет '+item.priority}</span><span className="combination-summary-title">{displayTitle}</span><span className="combination-chevron">⌄</span></summary>
           <div className="combination-expanded">
            <div className="combination-drug-columns">
             {rasChoice&&<div className="combination-drug-column">
              <h4>Блокатор РААС</h4><p className="combination-column-hint">Выбрать один препарат: иАПФ ИЛИ сартан</p>
              {antihypertensiveDrugProfiles.filter(drug=>drug.group==='Сартаны').map(drug=>{
               const guide=doseGuides[drug.id];
               return <details className="combination-drug-item" key={drug.id}>
                <summary>{drug.name}</summary>
                <div className="combination-drug-info"><p>{drug.rationale}</p><p><b>Доза:</b> {guide?('Старт '+guide.start+'; обычная '+guide.usual+'; максимум '+guide.maximum):drug.dose}</p>{guide&&<><p><b>Титрация:</b> {guide.titration}; интервал {guide.interval}</p><p className="dose-caveat">{guide.context}</p></>}<div className="combination-drug-links"><a href={drug.instructionUrl} target="_blank" rel="noreferrer">Инструкция ↗</a>{drug.studies.map(study=><a key={study.id} href={study.url} target="_blank" rel="noreferrer">{study.title} ↗</a>)}</div></div>
               </details>
              })}
              {aceDrugEvidence.map(drug=><details className="combination-drug-item" key={drug.id}>
               <summary>{drug.inn}</summary><div className="combination-drug-info"><p><b>Доза при АГ:</b> {drug.hypertensionDose}</p><div className="combination-drug-links"><a href={drug.doseSource} target="_blank" rel="noreferrer">Инструкция / источник дозы ↗</a>{drug.studies.slice(0,3).map(study=><a key={study.id} href={study.url} target="_blank" rel="noreferrer">{study.title} ↗</a>)}</div></div>
              </details>)}
             </div>}
             {[...grouped.entries()].filter(([group])=>!(rasChoice&&group==='Сартаны')).map(([group,drugs])=><div className="combination-drug-column" key={group}>
              <h4>{group}</h4><p className="combination-column-hint">{drugs.length>1?'Выбрать один препарат из этой группы':'Препарат этой группы'}</p>
              {drugs.map(drug=>{
               const guide=doseGuides[drug.id];
               return <details className="combination-drug-item" key={drug.id}>
                <summary>{drug.name}</summary>
                <div className="combination-drug-info"><p>{drug.rationale}</p><p><b>Доза:</b> {guide?('Старт '+guide.start+'; обычная '+guide.usual+'; максимум '+guide.maximum):drug.dose}</p>{guide&&<><p><b>Титрация:</b> {guide.titration}; интервал {guide.interval}</p><p className="dose-caveat">{guide.context}</p></>}<div className="combination-drug-links"><a href={drug.instructionUrl} target="_blank" rel="noreferrer">Инструкция ↗</a>{drug.studies.map(study=><a key={study.id} href={study.url} target="_blank" rel="noreferrer">{study.title} ↗</a>)}</div></div>
               </details>
              })}
             </div>)}
            </div>
            {item.drugIds.filter(id=>!antihypertensiveDrugProfiles.some(drug=>drug.id===id)&&! /ACEI|иАПФ|ARB|БРА|блокатор РААС/i.test(id)).map(id=><div className="combination-unresolved" key={id}>{id}</div>)}
            <details className="combination-more-details">
             <summary>Почему эта комбинация обоснована в данном случае</summary>
             <div className="combination-more-content"><p>{clinicalWhy}</p><p><b>Механизм действия:</b> {mechanism}</p></div>
            </details>
            <details className="combination-more-details">
             <summary>Кратко об исследованиях</summary>
             <div className="combination-more-content">
              {combinationSpecific.length>0&&<div className="study-scope-label">Прямое исследование комбинации</div>}
              {combinationSpecific.map(study=><div className="combination-study-summary" key={study.id}><b>{study.title} ({study.year})</b><p>{study.result}</p><p className="dose-caveat">Ограничение: {study.limits}</p><a href={study.url} target="_blank" rel="noreferrer">Публикация ↗</a></div>)}
              {strategyStudies.length>0&&<div className="study-scope-label">Данные стратегии лечения</div>}
              {strategyStudies.map(study=><div className="combination-study-summary" key={study.id}><b>{study.title} ({study.year})</b><p>{study.result}</p><p className="dose-caveat">Ограничение: {study.limits}</p><a href={study.url} target="_blank" rel="noreferrer">Публикация ↗</a></div>)}
              {componentStudies.length>0&&<div className="combination-study-summary"><b>Доказательства отдельных компонентов / класса</b><p>Эти данные поддерживают применение компонентов в изученных популяциях, но не доказывают преимущество именно этой комбинации.</p>{componentStudies.map(study=><div key={study.id}><b>{study.title} ({study.year})</b><p>{study.result}</p><p className="dose-caveat">Ограничение: {study.limits}</p><a href={study.url} target="_blank" rel="noreferrer">Публикация ↗</a></div>)}</div>}
              {sourceStudies.length===0&&<p className="dose-caveat">Для этой схемы нет привязанного исследования комбинации. Нельзя переносить результаты отдельных компонентов на комбинацию целиком.</p>}
             </div>
            </details>
            {combinationLinks.length>0&&<details className="combination-more-details"><summary>Примеры фиксированных комбинаций</summary><div className="combination-more-content fixed-combination-list">{combinationLinks.map(combo=><div key={combo.name}><span><b>{combo.name}</b> · {combo.ingredients} · {combo.strengths.join('; ')} мг</span><small>{combo.jurisdiction}. {combo.note}</small><a href={combo.source} target="_blank" rel="noreferrer">Официальная инструкция ↗</a></div>)}</div></details>}
            {item.restriction&&<p className="strategy-restriction">{item.restriction}</p>}
           </div>
          </details>
         {!antihypertensivePlan.hasHypertension&&<p className="strategy-restriction">Отдельные блоки могут относиться к ХСН, ИБС, ФП или постинфарктному состоянию. Для общего подбора АГ выберите диагноз «Артериальная гипертензия».</p>}
        </section>}
        {antihypertensiveRankings.options.length>0&&<section className="eapf-context antihypertensive-ranked-view">
         <div className="eapf-context-heading"><div><h3>Отдельные препараты и альтернативы</h3><p>{antihypertensiveRankings.summary}</p></div></div>
         <div className="ranked-drug-list">{antihypertensiveRankings.options.map((option,index)=>{
          const equal=antihypertensiveRankings.options.filter(item=>item.rank===option.rank).length>1;
          const profileNames=option.drugIds.map(id=>antihypertensiveDrugProfiles.find(drug=>drug.id===id)).filter((drug):drug is typeof antihypertensiveDrugProfiles[number]=>Boolean(drug));
          return <article className="ranked-drug" key={option.title+'-'+index}>
           <div className="ranked-drug-top"><span className="rank-number">{'Место '+option.rank+(equal?' · равный приоритет':'')}</span><span className="rank-level">{option.group}</span></div>
           <h4>{option.title}</h4>
           <div className="strategy-medicines">{profileNames.map(drug=><span className="strategy-medicine" key={drug.id}>{drug.name}</span>)}{option.additionalNames?.map(name=><span className="strategy-medicine muted" key={name}>{name}</span>)}</div>
           <p>{option.rationale}</p>
           {option.caution&&<p className="strategy-restriction">{option.caution}</p>}
           <div className="drug-source-links">{profileNames.map(drug=><a key={drug.id} href={drug.instructionUrl} target="_blank" rel="noreferrer">Инструкция: {drug.name} ↗</a>)}</div>
          </article>
         })}</div>
        </section>}
        {antihypertensiveRankings.notes.map((note,index)=><div className="match-alert" key={'ranking-note-'+index}>{note}</div>)}
{!aceComparison.hasAceIndication&&antihypertensiveRankings.options.length===0&&<div className="match-alert">По выбранным данным пока не установлено показание для сравнения иАПФ. Сначала подтвердите диагноз или синдром.</div>}
       {aceComparison.hasAceIndication&&!aceComparison.canCompare&&<div className="match-alert danger">Ранжирование остановлено из-за критического фактора безопасности. Требуется клиническая оценка.</div>}
       {aceComparison.canCompare&&eapfAceRecommendations.length===0&&<div className="match-alert">Для этой комбинации пока недостаточно проверенных данных, чтобы сформировать рейтинг препаратов.</div>}
       {aceComparison.canCompare&&(()=>{
        const merged=new Map<string,any>();
        eapfAceRecommendations.forEach(recommendation=>recommendation.candidates.forEach(drug=>{
         const existing=merged.get(drug.id);
         if(existing){existing.contexts.push(recommendation.heading);existing.studies=[...new Map([...existing.studies,...drug.studies].map(study=>[study.id,study])).values()]}
         else merged.set(drug.id,{...drug,contexts:[recommendation.heading]});
        }));
        const scored=[...merged.values()].map(drug=>({...drug,rankScore:Math.max(0,...drug.studies.map((study:any)=>study.relevance==='high'?3:study.relevance==='moderate'?2:study.relevance==='limited'?1:0))})).sort((a,b)=>b.rankScore-a.rankScore);
        const groups=[...new Set(scored.map(item=>item.rankScore))];
        return <section className="eapf-context"><div className="eapf-context-heading"><div><h3>Сопоставление конкретных иАПФ</h3><p>Повторяющиеся препараты объединены. Рейтинг отражает уровень и прямоту доказательств, а не гарантирует индивидуальную эффективность.</p></div></div>
         {scored.length?<div className="ranked-drug-list">{scored.map(drug=>{
          const rank=groups.indexOf(drug.rankScore)+1;const same=scored.filter(item=>item.rankScore===drug.rankScore).length>1;
          return <article className="ranked-drug" key={drug.id}><div className="ranked-drug-top"><span className="rank-number">{'Место '+rank+(same?' · совместно':'')}</span><span className="rank-level">{drug.rankScore===3?'Высокая доказательная поддержка':drug.rankScore===2?'Умеренная поддержка':drug.rankScore===1?'Ограниченные данные':'Данные не установлены'}</span></div>
           <h4>{drug.inn}</h4><p>{drug.shortConclusion}</p><p className="rank-context">Релевантные профили: {drug.contexts.join(' · ')}</p>
           <div className="drug-source-links"><a href={drug.doseSource} target="_blank" rel="noreferrer">Инструкция ↗</a></div></article>
         })}</div>:<p className="reference-empty">Для этого профиля нет отдельных молекул, которые можно обоснованно ранжировать.</p>}
         {eapfAceRecommendations.map(recommendation=><p className="eapf-interpretation" key={recommendation.heading}>{recommendation.interpretation}</p>)}
        </section>;
       })()}
      </div>:<div className="russian-recommendation-view">
       <div className="reference-intro"><b>Лекарственные классы и препараты по клинической ситуации</b><p>Краткий перечень по применимым положениям российских клинических рекомендаций. Это список вариантов, а не индивидуальное назначение.</p></div>
       {antihypertensivePlan.russianItems.length?<ul className="ru-medication-list">{antihypertensivePlan.russianItems.map((line,index)=><li key={index}>{line}</li>)}</ul>:<p className="reference-empty">Для выбранного профиля пока нет сформированного перечня препаратов по российским клиническим рекомендациям. Требуется сверка конкретной клинической ситуации с актуальной редакцией профильной рекомендации.</p>}

      </div>}
      <p className="reference-disclaimer">Материалы EAPF — исследовательский синтез опубликованных доказательств, а не утверждённая клиническая рекомендация и не автоматическое назначение. «Сильные данные» означают наличие подходящих РКИ по конкретному профилю, но не обязательно превосходство над другой молекулой. Дозировки и фармакокинетика из зарубежных SmPC/инструкций должны быть перепроверены по конкретному препарату и юрисдикции. Не использовать на реальных пациентах до экспертной проверки.</p>
     </div><button type="button" className="text-button" onClick={()=>setPreparedData(null)}>Скрыть сводку</button></div>}
   </form></section>:<section className="content"><div className="section-heading"><div><div className="eyebrow">БАЗА ЗНАНИЙ EAPF</div><h2>{active}</h2></div>{active==='Препараты'&&<div className="searchbox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию препарата"/></div>}</div>
   {active==='Препараты'?<><div className="class-banner"><div className="class-icon"><Pill/></div><div><b>Ингибиторы АПФ (иАПФ)</b><small>Первый фармакологический модуль · {drugs.length} молекул в начальном каталоге</small></div><span className="draft">В разработке</span></div><div className="drug-grid">{filtered.map(d=><article className="drug-card" key={d.name}><div className="drug-card-top"><span>{d.className}</span><span className="dot-status">●</span></div><h3>{d.name}</h3><p>{d.note}</p><small>{d.status}</small></article>)}</div>{filtered.length===0&&<p className="empty">Ничего не найдено.</p>}</>:active==='Клинические рекомендации РФ'?<div className="reference-list"><div className="reference-intro"><b>Российские клинические рекомендации Минздрава РФ</b><p>Отдельный раздел для российских клинических ситуаций. Перед применением проверяйте действующий статус и актуальную редакцию в официальном рубрикаторе.</p></div>{russianClinicalRecommendations.map(item=><article className="reference-card" key={item.id}><div className="reference-card-top"><span>РОССИЙСКАЯ ФЕДЕРАЦИЯ · {item.year}</span><span className={item.status==='active'?'ref-status active':'ref-status pending'}>{item.status==='active'?'Действует в реестре':'Требует перепроверки'}</span></div><h3>{item.title}</h3><p className="reference-publisher">{item.publisher} · {item.version}</p><p>{item.summary}</p><div className="reference-meta"><span>Состояния: {item.appliesTo.join(' · ')}</span><span>Проверено: {item.checkedAt}</span></div><a href={item.url} target="_blank" rel="noreferrer">Открыть первоисточник ↗</a></article>)}</div>:active==='Доказательная база иАПФ'?<div className="reference-list"><div className="reference-intro"><b>Научные публикации, РКИ и сравнительные исследования</b><p>Здесь собраны исследования по отдельным молекулам. Внутри каждой карточки — популяция, режим, результат и ограничения. Косвенные сравнения не считаются доказательством превосходства.</p></div>{aceDrugEvidence.map(drug=><details className="eapf-drug-card evidence-library-drug" key={drug.id}><summary><span className="eapf-drug-title"><b>{drug.inn}</b><small>{drug.evidenceTier}</small></span><span className="expand-label">Исследования и фармакология</span></summary><div className="eapf-drug-content"><div className="drug-conclusion"><b>Краткий вывод</b><p>{drug.shortConclusion}</p></div><h4>Механизм и фармакокинетика</h4><p>{drug.mechanism}</p><p>{drug.pharmacokinetics}</p><p><b>Период полувыведения:</b> {drug.halfLife}</p><h4>Дозирование при АГ — справочная схема</h4><p>{drug.hypertensionDose}</p>{drug.specialDosing&&<><h4>Отдельная схема при остром ИМ</h4><p>{drug.specialDosing}</p></>}<p className="dose-caveat">{drug.doseCaveat}</p><a className="evidence-link" href={drug.doseSource} target="_blank" rel="noreferrer">Открыть инструкцию ↗</a><h4>Ключевые исследования</h4>{drug.studies.map(study=><details className="evidence-study" key={study.id}><summary>{study.title} · {study.year} <span>{study.design}</span></summary><div><p><b>Популяция:</b> {study.population}</p><p><b>Вмешательство:</b> {study.intervention}</p><p><b>Результат:</b> {study.finding}</p><p className="dose-caveat"><b>Ограничения:</b> {study.limitations}</p><a className="evidence-link" href={study.url} target="_blank" rel="noreferrer">Открыть публикацию ↗</a></div></details>)}</div></details>)}<h3>Общие и сравнительные обзоры класса</h3>{aceEvidenceStudies.filter(study=>study.id.startsWith('ace-')).map(study=><details className="evidence-study" key={study.id}><summary>{study.title} · {study.year} <span>{study.design}</span></summary><div><p>{study.population}</p><p>{study.finding}</p><p className="dose-caveat">{study.limitations}</p><a className="evidence-link" href={study.url} target="_blank" rel="noreferrer">Открыть исследование ↗</a></div></details>)}<div className="eapf-method"><b>{evidenceMethods.title}</b><ul>{evidenceMethods.principles.map(item=><li key={item}>{item}</li>)}</ul></div></div>:active==='Доказательная база АГП'?<div className="reference-list">
    <div className="reference-intro"><b>Доказательная база основных антигипертензивных классов</b><p>Профили препаратов, фармакокинетика, справочные взрослые дозовые диапазоны, ключевые РКИ и ограничения переноса результатов. Прямые сравнения стратегий не превращаются в универсальный рейтинг молекул.</p></div>
    {antihypertensiveDrugProfiles.map(drug=><details className="eapf-drug-card evidence-library-drug" key={drug.id}>
     <summary><span className="eapf-drug-title"><b>{drug.name}</b><small>{drug.group} · {drug.role}</small></span><span className="expand-label">Профиль, дозы и источники</span></summary>
     <div className="eapf-drug-content"><div className="drug-conclusion"><b>Клиническая позиция</b><p>{drug.rationale}</p></div>
      <h4>Справочная доза для взрослых</h4><p>{drug.dose}</p><p className="dose-caveat">Доза не является персональной рекомендацией; сверить конкретный препарат, форму, показание и национальную инструкцию.</p>
      <h4>Фармакокинетика и выведение</h4><p>{drug.pharmacokinetics}</p><p><b>Период полувыведения:</b> {drug.halfLife}</p>
      <h4>Ограничения и мониторинг</h4><p>{drug.cautions}</p>
      <a className="evidence-link" href={drug.instructionUrl} target="_blank" rel="noreferrer">Открыть инструкцию / SmPC ↗</a>
      {drug.studies.length>0&&<><h4>Ключевые исследования</h4>{drug.studies.map(study=><details className="evidence-study" key={study.id}><summary>{study.title} · {study.year}</summary><div><p>{study.result}</p><p className="dose-caveat">{study.limits}</p><a className="evidence-link" href={study.url} target="_blank" rel="noreferrer">Открыть публикацию ↗</a></div></details>)}</>}
     </div>
    </details>)}
    <h3>Общие исследования классов и комбинаций</h3>
    {allAntihypertensiveStudies.map(study=><details className="evidence-study" key={study.id}><summary>{study.title} · {study.year}</summary><div><p>{study.result}</p><p className="dose-caveat">{study.limits}</p><a className="evidence-link" href={study.url} target="_blank" rel="noreferrer">Открыть публикацию ↗</a></div></details>)}
    <div className="reference-disclaimer">Эта база является предварительно структурированным обзором исследований, а не систематическим обзором с формальной оценкой риска смещения. Дозы и регистрационный статус необходимо проверять по действующей национальной инструкции. Прямые данные разных популяций и конечных точек не позволяют ранжировать все молекулы между собой.</div>
   </div>:active==='Источники и инструкции'?<div className="reference-list"><div className="reference-intro"><b>Реестры, инструкции и первоисточники</b><p>Каждое клиническое положение должно быть связано с источником, датой проверки и статусом экспертного утверждения.</p></div>{primarySources.map(item=><article className="reference-card" key={item.id}><h3>{item.title}</h3><p className="reference-publisher">{item.publisher}</p><p>{item.purpose}</p><div className="reference-meta"><span>Проверено: {item.checkedAt}</span></div><a href={item.url} target="_blank" rel="noreferrer">Открыть источник ↗</a></article>)}</div>:<div className="placeholder"><BookOpen size={28}/><h3>Раздел подготовлен к наполнению</h3><p>Структура платформы расширяется: здесь появятся проверенные материалы и ссылки на первоисточники.</p></div>}
   <div className="notice"><ShieldCheck size={20}/><p><b>Важно:</b> содержимое этой версии — демонстрационная структура, а не клиническая рекомендация. Дозировки, показания и противопоказания будут добавляться только после проверки источников и экспертного утверждения.</p></div></section>}
   <footer>© 2026 EAPF · Проект медицинской справочной платформы</footer>
  </main>
 </div>
}
