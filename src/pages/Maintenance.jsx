import React, { useState } from 'react'
import { Plus, Wrench, Search, Filter, CalendarDays, MapPin, ArrowUpRight, CheckCircle2, Clock3, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { StatusBadge } from '../components/StatusBadge'
import { Modal } from '../components/Modal'

export function Maintenance() {
  const { requests, addRequest, updateRequest, user } = useApp()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ title: '', location: 'Living room', priority: 'Medium', description: '' })
  const list = requests.filter(r => (filter === 'All' || r.status === filter) && `${r.title} ${r.location} ${r.id}`.toLowerCase().includes(query.toLowerCase()))

  const submit = async e => { e.preventDefault(); const saved=await addRequest(form); if(saved){setForm({title:'',location:'Living room',priority:'Medium',description:''}); setOpen(false)} }

  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">MAINTENANCE</div><h1>Maintenance requests</h1><p>Raise an issue and follow its progress from start to finish.</p></div><button className="primary-btn" onClick={() => setOpen(true)}><Plus size={17}/> New request</button></div>
    <div className="summary-strip"><Summary icon={Clock3} label="Pending" value={requests.filter(r=>r.status==='Pending').length}/><Summary icon={Wrench} label="In progress" value={requests.filter(r=>r.status==='In Progress').length}/><Summary icon={CheckCircle2} label="Completed" value={requests.filter(r=>r.status==='Completed').length}/><Summary icon={AlertCircle} label="High priority" value={requests.filter(r=>r.priority==='High' && r.status!=='Completed').length}/></div>
    <section className="panel">
      <div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search requests..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-group"><Filter size={15}/>{['All','Pending','In Progress','Completed'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div></div>
      <div className="maintenance-list">
        {list.map(r => <article className="maintenance-card" key={r.id}><div className="request-icon"><Wrench size={19}/></div><div className="maintenance-main"><div className="request-top"><span className="request-id">{r.id}</span><StatusBadge status={r.status}/></div><h3>{r.title}</h3><p>{r.description}</p><div className="request-meta"><span><MapPin size={13}/> {r.location}</span><span><CalendarDays size={13}/> {r.created}</span><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority} priority</span></div></div>{user?.role==='manager' && <select className="compact-select" value={r.status} onChange={e=>updateRequest(r.id,e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select>}</article>)}
        {!list.length && <div className="empty-state"><Wrench/><h3>No requests found</h3><p>Try another search or create a new request.</p></div>}
      </div>
    </section>
    <Modal open={open} onClose={()=>setOpen(false)} title="New maintenance request" subtitle="Tell us what needs attention.">
      <form className="modal-form" onSubmit={submit}><label>Issue title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Water leakage"/></label><label>Location<select value={form.location} onChange={e=>setForm({...form,location:e.target.value})}><option>Living room</option><option>Kitchen</option><option>Master bedroom</option><option>Bathroom</option><option>Main entrance</option><option>Balcony</option></select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Description<textarea required rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the issue..."/></label><button className="primary-btn full">Submit request</button></form>
    </Modal>
  </div>
}
function Summary({icon:Icon,label,value}) { return <div className="summary-item"><div className="summary-icon"><Icon size={17}/></div><div><span>{label}</span><strong>{value.toString().padStart(2,'0')}</strong></div></div> }
