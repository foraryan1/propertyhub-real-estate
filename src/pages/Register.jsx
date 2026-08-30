import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'

export function Register() {
  const [name, setName] = useState('Shivaji Singh')
  const [email, setEmail] = useState('shivaji@example.com')
  const [password, setPassword] = useState('password')
  const { register } = useApp()
  const navigate = useNavigate()
  const submit = e => { e.preventDefault(); register(name, email); navigate('/app') }

  return <div className="auth-page">
    <div className="auth-brand"><Logo /><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to website</Link></div>
    <div className="auth-grid register-grid">
      <div className="auth-intro"><div className="eyebrow">WELCOME HOME</div><h1>Make property life feel effortless.</h1><p>Create your resident account and keep your everyday property tasks organized.</p><div className="benefit-list"><div><CheckCircle2 /><span><b>Track maintenance</b><small>Know exactly what is happening with every request.</small></span></div><div><CheckCircle2 /><span><b>Book amenities</b><small>Reserve shared spaces with confidence.</small></span></div><div><CheckCircle2 /><span><b>Stay informed</b><small>See property announcements in one place.</small></span></div></div></div>
      <div className="auth-card"><div className="auth-head"><h2>Create your account</h2><p>It takes less than a minute.</p></div><form onSubmit={submit}>
        <label>Full name<input value={name} onChange={e => setName(e.target.value)} required /></label>
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <label className="check terms"><input type="checkbox" required /> I agree to the terms and privacy policy.</label>
        <button className="primary-btn full">Create account <ArrowRight size={17} /></button>
      </form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></div>
    </div>
  </div>
}
