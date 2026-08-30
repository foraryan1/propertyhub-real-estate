import React, { useState } from 'react'
import { CalendarDays, Clock3, Users, MapPin, Sparkles, CheckCircle2, ArrowRight, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Modal'

export function Amenities() {
  const { amenities, bookings, addBooking } = useApp()
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ date:'31 Aug 2026', start:'10:00 AM', end:'11:00 AM' })

  const submit = e => { e.preventDefault(); const ok=addBooking({...form, amenity:selected.name}); if(ok)setSelected(null) }
  const slots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','05:00 PM','06:00 PM','07:00 PM']

  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">AMENITIES</div><h1>Shared spaces, on your time.</h1><p>Browse availability and reserve a space without the back-and-forth.</p></div><div className="availability-live"><i/> Live availability</div></div>
    <div className="amenity-grid">
      {amenities.map(a => <article className="amenity-card" key={a.id}><div className={`amenity-art ${a.accent}`}><div className="amenity-art-icon"><Sparkles size={27}/></div><div className="art-shapes"><i/><i/><i/></div><span className="available-tag"><i/> Available today</span></div><div className="amenity-body"><div className="amenity-title"><h3>{a.name}</h3><span>{a.capacity} people</span></div><p>{a.description}</p><div className="amenity-meta"><span><MapPin size={13}/> {a.location}</span><span><Clock3 size={13}/> {a.hours}</span></div><button className="outline-btn full" onClick={()=>{setSelected(a);setForm({date:'31 Aug 2026',start:'10:00 AM',end:'11:00 AM'})}}>Check availability <ArrowRight size={16}/></button></div></article>)}
    </div>
    <section className="panel booking-rule"><div className="rule-icon"><CheckCircle2/></div><div><h3>Fair booking policy</h3><p>One active reservation per amenity and time slot. PropertyHub checks for overlapping reservations before confirming a booking.</p></div></section>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title={`Book ${selected?.name || ''}`} subtitle="Choose a date and time. Conflicting slots are blocked automatically.">
      <form className="modal-form" onSubmit={submit}><label>Date<input type="text" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Check-in<select value={form.start} onChange={e=>setForm({...form,start:e.target.value})}>{slots.map(s=><option key={s}>{s}</option>)}</select></label><label>Check-out<select value={form.end} onChange={e=>setForm({...form,end:e.target.value})}>{slots.map(s=><option key={s}>{s}</option>)}</select></label><div className="booking-preview"><span><CalendarDays/> {form.date}</span><span><Clock3/> {form.start} – {form.end}</span><span><Users/> Max {selected?.capacity}</span></div><button className="primary-btn full">Confirm booking</button></form>
    </Modal>
  </div>
}
