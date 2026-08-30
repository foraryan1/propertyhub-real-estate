import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Sparkles, XCircle, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function Bookings() {
  const { bookings, cancelBooking } = useApp()
  const active = bookings.filter(b=>b.status==='Confirmed')
  const cancelled = bookings.filter(b=>b.status==='Cancelled')
  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">BOOKINGS</div><h1>My amenity bookings</h1><p>Keep track of upcoming reservations and past activity.</p></div><Link className="secondary-btn" to="/app/amenities"><Sparkles size={16}/> Browse amenities</Link></div>
    <div className="booking-stats"><div><span>Upcoming</span><strong>{active.length.toString().padStart(2,'0')}</strong></div><div><span>This month</span><strong>{bookings.length.toString().padStart(2,'0')}</strong></div><div><span>Conflicts prevented</span><strong>07</strong></div></div>
    <section className="panel"><div className="panel-title"><h3>Upcoming reservations</h3><span className="live-small"><i/> Live</span></div>{active.length ? <div className="big-bookings">{active.map(b=><article className="big-booking" key={b.id}><div className="big-booking-icon"><Sparkles/></div><div className="big-booking-main"><div><span className="request-id">{b.id}</span><span className="confirmed"><CheckCircle2 size={14}/> Confirmed</span></div><h3>{b.amenity}</h3><p><CalendarDays size={14}/> {b.date} <b>·</b> <Clock3 size={14}/> {b.start} – {b.end}</p></div><button className="cancel-btn" onClick={()=>cancelBooking(b.id)}><XCircle size={16}/> Cancel</button></article>)}</div> : <div className="empty-state"><CalendarDays/><h3>No upcoming bookings</h3><p>Reserve an amenity to see it here.</p></div>}</section>
    {cancelled.length>0 && <section className="panel"><div className="panel-title"><h3>Cancelled</h3></div>{cancelled.map(b=><div className="cancelled-row" key={b.id}><span>{b.amenity}</span><span>{b.date} · {b.start}</span><span>Cancelled</span></div>)}</section>}
    <div className="info-banner"><div><b>Need to change a reservation?</b><span>Cancel your current slot and create a new booking from the Amenities page.</span></div><ArrowUpRight/></div>
  </div>
}
