import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    const result = await login(email, password)
    setBusy(false)
    if (result === true) navigate('/app')
    else setError(result || 'Sign in failed. Please try again.')
  }

  return <div className="auth-page">
    <div className="auth-brand"><Logo /><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to website</Link></div>
    <div className="auth-grid">
      <div className="auth-intro"><div className="eyebrow">WELCOME HOME</div><h1>A better way to manage your property.</h1><p>One place for maintenance, amenities, bookings and everything in between.</p><div className="auth-points"><span><ShieldCheck /> Secure resident workspace</span><span><ShieldCheck /> Real-time status visibility</span><span><ShieldCheck /> Conflict-free amenity booking</span></div></div>
      <div className="auth-card"><div className="auth-head"><h2>Welcome back</h2><p>Sign in to your PropertyHub account.</p></div><form onSubmit={submit}>
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<div className="password-wrap"><input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="primary-btn full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight size={17} />}</button>
      </form><p className="auth-switch">New to PropertyHub? <Link to="/register">Create an account</Link></p></div>
    </div>
  </div>
}
