import { useMemo, useState, type FormEvent } from 'react'
import { Activity, BookOpen, FlaskConical, Search, ShieldCheck, Pill, FileText, Menu, Plus, X, Stethoscope, Sparkles, CheckCircle2 } from 'lucide-react'
import { drugs, sections } from './data'

const conditionGroups = [
 { title: 'Сердечно-сосудистые заболевания', items: ['Артериальная гипертензия','Хроническая сердечная недостаточность','Сердечная недостаточность со сниженной ФВ','Ишемическая болезнь сердца','Состояние после инфаркта миокарда','Стабильная стенокардия','Фибрилляция предсердий','Перенесённый инсульт / ТИА','Заболевание периферических артерий'] },
 { title: 'Почки и обмен веществ', items: ['Хроническая болезнь почек','Альбуминурия / протеинурия','Сахарный диабет 1 типа','Сахарный диабет 2 типа','Метаболический синдром','Дислипидемия','Гиперкалиемия'] },
 { title: 'Другие состояния и факторы риска', items: ['Ожирение','Подагра / гиперурикемия','Беременность или её планирование','Пожилой возраст / старческая астения','Ортостатическая гипотензия','Обезвоживание / гиповолемия','Ангионевротический отёк в анамнезе'] }
]

export default function App() {
 const [query, setQuery] = useState('')
 const [active, setActive] = useState('Клинический помощник')
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
 const nav = ['Клинический помощник', ...sections]
 return <div className="app-shell">
  <aside className={mobileNavOpen?'sidebar mobile-open':'sidebar'}><div className="brand"><div className="brand-mark">E</div><div><b>EAPF</b><small>Medical reference</small></div></div>
   <div className="side-label">РАЗДЕЛЫ</div>{nav.map((s,i)=><button key={s} className={active===s?'nav-item active':'nav-item'} onClick={()=>{setActive(s);setMobileNavOpen(false)}}>{i===0?<Stethoscope size={18}/>:i===1?<Pill size={18}/>:i===2?<Activity size={18}/>:i===3?<FlaskConical size={18}/>:i===4?<BookOpen size={18}/>:i===5?<FileText size={18}/>:<ShieldCheck size={18}/>}{s}</button>)}
   <div className="sidebar-foot">Экспертная медицинская платформа<br/><span>Версия 0.2 · демонстрационный режим</span></div>
  </aside>
  <main className="main"><header className="topbar"><button className="mobile-menu" aria-label="Меню" aria-expanded={mobileNavOpen} onClick={()=>setMobileNavOpen(v=>!v)}><Menu/></button><span>EAPF · КЛИНИЧЕСКИЙ ПОМОЩНИК</span><span className="top-status"><i/> Основа: иАПФ</span></header>
   {active==='Клинический помощник'?<section className="clinical"><form className="clinical-form" onSubmit={prepareData}>
    <div className="clinical-intro"><div className="eyebrow">EAPF · CLINICAL WORKSPACE</div><h1>Клинический помощник</h1><p>Введите данные пациента и отметьте сопутствующие состояния. Система поможет структурировать клиническую информацию и подготовить варианты для врачебной оценки.</p></div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">01</span><h2>Данные пациента</h2></div><span className="optional">Без персональных идентификаторов</span></div>
     <div className="patient-grid"><label>Возраст, лет<input name="age" type="number" min="0" placeholder="Например, 64"/></label><label>Пол<select name="sex" defaultValue=""><option value="" disabled>Выберите</option><option>Женский</option><option>Мужской</option><option>Не указан</option></select></label><label>Рост, см<input name="height" type="number" placeholder="Например, 172"/></label><label>Вес, кг<input name="weight" type="number" placeholder="Например, 82"/></label><label>АД, мм рт. ст.<input name="blood_pressure" placeholder="Например, 145/90"/></label><label>ЧСС, уд/мин<input name="heart_rate" type="number" placeholder="Например, 76"/></label></div>
    </div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">02</span><h2>Состояния и диагнозы</h2></div><span className="optional">Можно выбрать несколько</span></div>
     <div className="selected-line"><b>Выбрано: {selected.length}</b>{selected.length>0&&<button type="button" className="text-button" onClick={()=>setSelected([])}>Очистить выбор</button>}</div>
     {conditionGroups.map(group=><div className="condition-group" key={group.title}><h3>{group.title}</h3><div className="condition-options">{group.items.map(item=><button type="button" key={item} className={selected.includes(item)?'condition-chip chosen':'condition-chip'} onClick={()=>toggle(item)}><span className="check">{selected.includes(item)?'✓':'+'}</span>{item}</button>)}</div></div>)}
     {customConditions.length>0&&<div className="condition-group"><h3>Мои добавленные состояния</h3><div className="condition-options">{customConditions.map(item=><button type="button" key={item} className={selected.includes(item)?'condition-chip chosen':'condition-chip'} onClick={()=>toggle(item)}><span className="check">{selected.includes(item)?'✓':'+'}</span>{item}<span className="unverified-tag">не проверено</span></button>)}</div></div>}
     <div className="custom-entry"><div className="custom-heading"><Sparkles size={17}/><b>Нет нужного диагноза или состояния?</b></div><p>ИИ может предложить стандартную формулировку и возможный код классификатора. Это не подтверждение диагноза: каждое предложение требует проверки врачом. В запрос отправляется только введённая формулировка, без данных пациента.</p><div className="custom-row"><input value={customText} onChange={e=>{setCustomText(e.target.value);setSuggested('');setNotice('')}} onKeyDown={e=>{if(e.key==='Enter')addCustom()}} placeholder="Например: перенесённый эпизод острого повреждения почек"/><button type="button" onClick={addCustom} disabled={!customText.trim()||normalizing}>{normalizing?'Обработка…':<><Sparkles size={16}/> Предложить формулировку</>}</button></div>
      {suggested&&<div className="suggestion"><div><span className="suggestion-label">Предложение · требует проверки врачом</span><b>{suggested}</b>{normalization&&<><span className="suggestion-meta">{normalization.explanation}</span><span className="suggestion-meta">Классификация: {normalization.coding_system}{normalization.code?` · ${normalization.code}`:''} · уверенность: {normalization.confidence==='high'?'высокая':normalization.confidence==='medium'?'средняя':'низкая'}</span></>}</div><div className="suggestion-actions"><button type="button" className="confirm-button" onClick={confirmCustom}><CheckCircle2 size={15}/> Добавить в мой список</button><button type="button" className="icon-button" onClick={()=>{setSuggested('');setNormalization(null)}} aria-label="Отменить"><X size={16}/></button></div></div>}
      {notice&&<div className="inline-notice">{notice}</div>}
     </div>
    </div>
    <div className="patient-panel"><div className="panel-title"><div><span className="step">03</span><h2>Лабораторные показатели и препараты</h2></div><span className="optional">Можно заполнить позже</span></div><div className="patient-grid"><label>Креатинин, мкмоль/л<input name="creatinine" type="number" placeholder="Значение"/></label><label>рСКФ, мл/мин/1,73 м²<input name="egfr" type="number" placeholder="Значение"/></label><label>Калий, ммоль/л<input name="potassium" type="number" step="0.1" placeholder="Значение"/></label><label>Натрий, ммоль/л<input name="sodium" type="number" placeholder="Значение"/></label><label>Альбуминурия / ACR<input name="acr" placeholder="Значение и единицы"/></label><label>Текущие препараты<input name="medications" placeholder="Перечислите препараты"/></label></div></div>
    <div className="clinical-footer"><p><ShieldCheck size={17}/> Результат будет носить справочный характер и не заменит клиническое решение врача.</p><button type="submit" className="analyze-button">Подготовить данные к анализу <span>→</span></button></div>
    {preparedData&&<div className="patient-panel analysis-preview"><div className="panel-title"><div><span className="step">04</span><h2>Данные подготовлены</h2></div><span className="optional">Только на этом устройстве</span></div><p>Ниже собраны введённые значения и выбранные состояния. На данном этапе это структурированная сводка, а не автоматический клинический анализ или рекомендация по лечению.</p><div className="patient-grid">{Object.entries(preparedData).filter(([,value])=>value.trim()).map(([key,value])=><div className="prepared-item" key={key}><small>{{age:'Возраст',sex:'Пол',height:'Рост',weight:'Вес',blood_pressure:'Артериальное давление',heart_rate:'Частота сердечных сокращений',creatinine:'Креатинин',egfr:'рСКФ',potassium:'Калий',sodium:'Натрий',acr:'Альбуминурия / ACR',medications:'Текущие препараты'}[key]||key}</small><b>{value}</b></div>)}</div><div className="condition-group"><h3>Выбранные состояния ({selected.length})</h3><p>{selected.length?selected.join(' · '):'Состояния не выбраны'}</p></div><button type="button" className="text-button" onClick={()=>setPreparedData(null)}>Скрыть сводку</button></div>}
   </form></section>:<section className="content"><div className="section-heading"><div><div className="eyebrow">БАЗА ЗНАНИЙ EAPF</div><h2>{active}</h2></div>{active==='Препараты'&&<div className="searchbox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию препарата"/></div>}</div>
   {active==='Препараты'?<><div className="class-banner"><div className="class-icon"><Pill/></div><div><b>Ингибиторы АПФ (иАПФ)</b><small>Первый фармакологический модуль · {drugs.length} молекул в начальном каталоге</small></div><span className="draft">В разработке</span></div><div className="drug-grid">{filtered.map(d=><article className="drug-card" key={d.name}><div className="drug-card-top"><span>{d.className}</span><span className="dot-status">●</span></div><h3>{d.name}</h3><p>{d.note}</p><small>{d.status}</small></article>)}</div>{filtered.length===0&&<p className="empty">Ничего не найдено.</p>}</>:<div className="placeholder"><BookOpen size={28}/><h3>Раздел подготовлен к наполнению</h3><p>Структура платформы расширяется: здесь появятся проверенные материалы и ссылки на первоисточники.</p></div>}
   <div className="notice"><ShieldCheck size={20}/><p><b>Важно:</b> содержимое этой версии — демонстрационная структура, а не клиническая рекомендация. Дозировки, показания и противопоказания будут добавляться только после проверки источников и экспертного утверждения.</p></div></section>}
   <footer>© 2026 EAPF · Проект медицинской справочной платформы</footer>
  </main>
 </div>
}
