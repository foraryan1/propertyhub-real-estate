import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'

export function Login() {
  const [email, setEmail] = useState('shivaji@example.com')
  const [password, setPassword] = useState('password')
  const [show, setShow] = useState(false)
  const [role, setRole] = useState('tenant')
  const { login } = useApp()
  const navigate = useNavigate()

  const submit = e => { e.preventDefault(); login(email, role); navigate('/app') }

  return <div className="auth-page">
    <div className="auth-brand"><Logo /><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to website</Link></div>
    <div className="auth-grid">
      <div className="auth-intro"><div className="eyebrow">WELCOME HOME</div><h1>A better way to manage your property.</h1><p>One place for maintenance, amenities, bookings and everything in between.</p><div className="auth-points"><span><ShieldCheck /> Secure resident workspace</span><span><ShieldCheck /> Real-time status visibility</span><span><ShieldCheck /> Conflict-free amenity booking</span></div></div>
      <div className="auth-card"><div className="auth-head"><h2>Welcome back</h2><p>Sign in to your PropertyHub account.</p></div><form onSubmit={submit}>
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<div className="password-wrap"><input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <div className="form-row"><label className="check"><input type="checkbox" defaultChecked /> Remember me</label><a href="#forgot">Forgot password?</a></div>
        <div className="role-toggle"><button type="button" className={role === 'tenant' ? 'active' : ''} onClick={() => setRole('tenant')}>Resident</button><button type="button" className={role === 'manager' ? 'active' : ''} onClick={() => setRole('manager')}>Manager demo</button></div>
        <button className="primary-btn full">Sign in <ArrowRight size={17} /></button>
      </form><p className="auth-switch">New to PropertyHub? <Link to="/register">Create an account</Link></p></div>
    </div>
  </div>
}
