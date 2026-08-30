import React, { useState } from 'react'
import { UserRound, Mail, Phone, MapPin, ShieldCheck, Bell, Save, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function Profile() {
  const { user, login, toast } = useApp()
  const [name,setName]=useState(user?.name||'Shivaji Singh')
  const [email,setEmail]=useState(user?.email||'shivaji@example.com')
  const [phone,setPhone]=useState('+91 98765 43210')
  const save=()=>login(email,user?.role||'tenant')
  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">ACCOUNT</div><h1>Your profile</h1><p>Manage your personal details and notification preferences.</p></div></div>
    <div className="profile-grid"><section className="panel profile-card"><div className="profile-cover"><div className="profile-avatar">{name.slice(0,1)}</div></div><div className="profile-body"><h2>{name}</h2><span>Resident · Greenwood Heights</span><div className="profile-verification"><ShieldCheck size={15}/> Verified resident</div></div></section>
    <section className="panel"><div className="panel-title"><h3>Personal information</h3><UserRound size={17}/></div><div className="form-grid"><label>Full name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email address<input value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)}/></label><label>Home address<input value="Greenwood Heights, Prayagraj" readOnly/></label></div><button className="primary-btn" onClick={save}><Save size={16}/> Save changes</button></section>
    <section className="panel"><div className="panel-title"><h3>Notifications</h3><Bell size={17}/></div><Toggle title="Maintenance updates" text="Get notified when a request changes status."/><Toggle title="Booking reminders" text="Receive reminders before an amenity reservation."/><Toggle title="Community announcements" text="Stay updated on important property notices."/></section></div>
    {toast && <div className="inline-success"><CheckCircle2 size={16}/> {toast}</div>}
  </div>
}
function Toggle({title,text}) { const [on,setOn]=useState(true); return <div className="toggle-row"><div><b>{title}</b><span>{text}</span></div><button className={`toggle ${on?'on':''}`} onClick={()=>setOn(!on)}><i/></button></div> }
