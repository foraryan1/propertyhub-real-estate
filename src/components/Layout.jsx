import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Home, Wrench, Sparkles, CalendarDays, UserRound, LogOut, Menu, X, Bell, ChevronDown, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/property', label: 'My Property', icon: Home },
  { to: '/app/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/app/amenities', label: 'Amenities', icon: Sparkles },
  { to: '/app/bookings', label: 'Bookings', icon: CalendarDays }
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const { user, logout, requests } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const pending = requests.filter(r => r.status !== 'Completed').length
  const page = location.pathname.includes('maintenance') ? 'Maintenance' :
    location.pathname.includes('amenities') ? 'Amenities' :
    location.pathname.includes('bookings') ? 'Bookings' :
    location.pathname.includes('property') ? 'My Property' :
    location.pathname.includes('profile') ? 'Profile' :
    location.pathname.includes('manager') ? 'Manager' : 'Dashboard'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="side-top"><Logo /><button className="mobile-close" onClick={() => setOpen(false)}><X /></button></div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
              {label === 'Maintenance' && pending > 0 && <b className="nav-count">{pending}</b>}
            </NavLink>
          ))}
          {user?.role === 'manager' && <NavLink to="/app/manager" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><ShieldCheck size={18} /><span>Manager</span></NavLink>}
        </nav>
        <div className="side-label side-label-bottom">ACCOUNT</div>
        <nav>
          <NavLink to="/app/profile" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><UserRound size={18} /><span>Profile</span></NavLink>
          <button className="nav-item logout" onClick={() => { logout(); navigate('/') }}><LogOut size={18} /><span>Log out</span></button>
        </nav>
        <div className="sidebar-help">
          <div className="help-icon"><Sparkles size={17} /></div>
          <strong>Need help?</strong>
          <span>Our support team is here 24/7.</span>
          <button onClick={() => navigate('/app/profile')}>Contact support</button>
        </div>
      </aside>

      {open && <div className="mobile-overlay" onClick={() => setOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(true)}><Menu /></button>
          <div className="breadcrumbs"><span>Resident Portal</span><b>/</b><strong>{page}</strong></div>
          <div className="top-actions">
            <button className="notification"><Bell size={18} /><i /></button>
            <div className="user-chip" onClick={() => navigate('/app/profile')}>
              <div className="avatar">{user?.name?.slice(0, 1) || 'S'}</div>
              <div className="user-chip-text"><strong>{user?.name || 'Shivaji'}</strong><span>{user?.role === 'manager' ? 'Property Manager' : 'Resident'}</span></div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>
        <div className="content"><Outlet /></div>
      </main>
    </div>
  )
}
