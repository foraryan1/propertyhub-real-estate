import React from 'react'
import { ShieldCheck, Wrench, CalendarDays, Users, TrendingUp, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { StatusBadge } from '../components/StatusBadge'

export function Manager() {
  const { user, requests, bookings, updateRequest } = useApp()
  if (user?.role !== 'manager') return <div className="page"><div className="empty-state"><ShieldCheck/><h3>Manager access only</h3><p>Manager access is assigned by the backend using the optional manager account in the project setup.</p></div></div>
  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">MANAGER CONSOLE</div><h1>Property operations</h1><p>Monitor maintenance and amenity activity across Greenwood Heights.</p></div><span className="manager-pill"><ShieldCheck size={15}/> Manager access</span></div>
    <div className="stats-grid manager-stats"><Stat icon={Users} label="Active residents" value="128" note="+6 this month"/><Stat icon={Wrench} label="Open requests" value={requests.filter(r=>r.status!=='Completed').length.toString().padStart(2,'0')} note="Needs attention"/><Stat icon={CalendarDays} label="Bookings today" value="08" note="Across 4 amenities"/><Stat icon={TrendingUp} label="Completion rate" value="94%" note="+3.2% this month"/></div>
    <section className="panel"><div className="panel-title"><h3>Maintenance queue</h3><span>Update status directly</span></div><div className="manager-table"><div className="table-head"><span>REQUEST</span><span>LOCATION</span><span>PRIORITY</span><span>STATUS</span><span>ACTION</span></div>{requests.map(r=><div className="table-row" key={r.id}><div><b>{r.title}</b><small>{r.id} · {r.created}</small></div><span>{r.location}</span><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span><StatusBadge status={r.status}/><select value={r.status} onChange={e=>updateRequest(r.id,e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>)}</div></section>
    <div className="manager-bottom"><section className="panel"><div className="panel-title"><h3>Amenity activity</h3><ArrowUpRight size={16}/></div><div className="activity-list"><Activity name="Swimming Pool" value="78% used" /><Activity name="Community Hall" value="62% used" /><Activity name="Fitness Studio" value="54% used" /><Activity name="Co-working Lounge" value="47% used" /></div></section><section className="panel success-panel"><CheckCircle2 size={23}/><h3>Zero booking conflicts</h3><p>Conflict prevention is active across all amenity reservations.</p><strong>100% slot validation</strong></section></div>
  </div>
}
function Stat({icon:Icon,label,value,note}) { return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function Activity({name,value}) { return <div className="activity-row"><span>{name}</span><div className="progress"><i style={{width:value.split('%')[0]+'%'}}/></div><b>{value}</b></div> }
