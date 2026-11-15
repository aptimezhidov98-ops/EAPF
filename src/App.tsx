import { useMemo, useState } from 'react'
import { Activity, BookOpen, FlaskConical, Search, ShieldCheck, Pill, FileText, Menu } from 'lucide-react'
import { drugs, sections } from './data'
export default function App() {
 const [query, setQuery] = useState('')
 const [active, setActive] = useState('Препараты')
 const filtered = useMemo(() => drugs.filter(d => d.name.toLowerCase().includes(query.toLowerCase())), [query])
 return <div className="app-shell">
  <aside className="sidebar"><div className="brand"><div className="brand-mark">E</div><div><b>EAPF</b><small>Medical reference</small></div></div>
   <div className="side-label">РАЗДЕЛЫ</div>{sections.map((s,i)=><button key={s} className={active===s?'nav-item active':'nav-item'} onClick={()=>setActive(s)}>{[Pill,Activity,FlaskConical,BookOpen,FileText,ShieldCheck].map((I,j)=>i===j?<I size={18} key={j}/>:null)}{s}</button>)}
   <div className="sidebar-foot">Экспертная медицинская платформа<br/><span>Версия 0.1 · демонстрационный режим</span></div>
  </aside>
  <main className="main"><header className="topbar"><button className="mobile-menu" aria-label="Меню"><Menu/></button><span>МЕДИЦИНСКАЯ БАЗА ЗНАНИЙ</span><span className="top-status"><i/> Структура проекта</span></header>
   <section className="hero"><div className="eyebrow">EXPERT MEDICAL REFERENCE PLATFORM</div><h1>Клинические знания.<br/><em>Структурированно и доказательно.</em></h1><p>Справочная платформа для профессиональной работы с лекарственными препаратами, диагнозами и клиническими доказательствами.</p><div className="hero-tags"><span>Проверяемые источники</span><span>История версий</span><span>Экспертная модерация</span></div></section>
   <section className="content"><div className="section-heading"><div><div className="eyebrow">БАЗА ПРЕПАРАТОВ</div><h2>{active}</h2></div><div className="searchbox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию препарата"/></div></div>
   {active==='Препараты'?<><div className="class-banner"><div className="class-icon"><Pill/></div><div><b>Ингибиторы АПФ (иАПФ)</b><small>Первый фармакологический модуль · {drugs.length} молекул в начальном каталоге</small></div><span className="draft">В разработке</span></div><div className="drug-grid">{filtered.map(d=><article className="drug-card" key={d.name}><div className="drug-card-top"><span>{d.className}</span><span className="dot-status">●</span></div><h3>{d.name}</h3><p>{d.note}</p><small>{d.status}</small></article>)}</div>{filtered.length===0&&<p className="empty">Ничего не найдено.</p>}</>:<div className="placeholder"><BookOpen size={28}/><h3>Раздел подготовлен к наполнению</h3><p>Структура платформы расширяется: здесь появятся проверенные материалы и ссылки на первоисточники.</p></div>}
   <div className="notice"><ShieldCheck size={20}/><p><b>Важно:</b> содержимое этой версии — демонстрационная структура, а не клиническая рекомендация. Дозировки, показания и противопоказания будут добавляться только после проверки источников и экспертного утверждения.</p></div></section>
   <footer>© 2026 EAPF · Проект медицинской справочной платформы</footer>
  </main>
 </div>
}