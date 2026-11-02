import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Home, Plus, Wrench, Clock3, MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { StatusBadge } from '../components/StatusBadge'

export function Dashboard() {
  const { user, requests, bookings, amenities } = useApp()
  const open = requests.filter(r => r.status !== 'Completed').length
  const completed = requests.filter(r => r.status === 'Completed').length
  const upcoming = bookings.filter(b => b.status === 'Confirmed').length

  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">DASHBOARD</div><h1>Good morning, {user?.name?.split(' ')[0] || 'Shivaji'}.</h1><p>Here’s what’s happening around your home today.</p></div><div className="head-actions"><Link to="/app/maintenance" className="secondary-btn"><Wrench size={16} /> Report issue</Link><Link to="/app/amenities" className="primary-btn"><Plus size={17} /> Book amenity</Link></div></div>

    <div className="stats-grid">
      <StatCard icon={Wrench} label="Total requests" value={requests.length.toString().padStart(2,'0')} note={`${open} currently open`} />
      <StatCard icon={CalendarDays} label="Upcoming bookings" value={upcoming.toString().padStart(2,'0')} note="Confirmed reservations" />
      <StatCard icon={Home} label="My property" value="01" note="Greenwood Heights" />
      <StatCard icon={Clock3} label="Resolved" value={completed.toString().padStart(2,'0')} note="Requests completed" />
    </div>

    <div className="dashboard-grid">
      <section className="panel large"><PanelTitle title="Maintenance requests" link="/app/maintenance" /><div className="table-like">
        {requests.slice(0,4).map(r => <div className="request-row" key={r.id}><div className="row-icon wrench"><Wrench size={16}/></div><div className="row-main"><strong>{r.title}</strong><span>{r.location} · {r.created}</span></div><StatusBadge status={r.status} /></div>)}
      </div></section>
      <section className="panel"><PanelTitle title="Upcoming bookings" link="/app/bookings" /><div className="booking-list">
        {bookings.filter(b => b.status !== 'Cancelled').slice(0,3).map(b => <div className="booking-row" key={b.id}><div className="amenity-avatar"><Sparkles size={16}/></div><div><strong>{b.amenity}</strong><span>{b.date} · {b.start} – {b.end}</span></div></div>)}
      </div></section>
    </div>

    <div className="dashboard-grid lower"><section className="announcement-card"><div><div className="section-kicker">COMMUNITY UPDATE</div><h3>Water supply maintenance scheduled</h3><p>Water supply will be unavailable on <b>5 Sep, 10:00 AM – 2:00 PM</b>. Please plan accordingly.</p><Link to="/app/property">View property details <ArrowUpRight size={15}/></Link></div><div className="city-illustration"><span/><span/><span/><span/><span/></div></section>
    <section className="panel"><PanelTitle title="Amenities" link="/app/amenities" /><div className="amenity-quick">{amenities.slice(0,3).map(a => <Link to="/app/amenities" className="amenity-quick-row" key={a.id}><div className={`amenity-dot ${a.accent}`}><Sparkles size={15}/></div><div><strong>{a.name}</strong><span><MapPin size={12}/> {a.location.split('·')[0].trim()}</span></div><ChevronRight size={16}/></Link>)}</div></section></div>
  </div>
}

function StatCard({ icon: Icon, label, value, note }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
}
function PanelTitle({ title, link }) { return <div className="panel-title"><h3>{title}</h3><Link to={link}>View all <ArrowUpRight size={14}/></Link></div> }
