import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Wrench, CalendarCheck2, MessageCircle, ShieldCheck, BarChart3, Home, Sparkles } from 'lucide-react'
import { Logo } from '../components/Logo'

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav className="landing-links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#benefits">Benefits</a></nav>
        <div className="landing-actions"><Link to="/login" className="text-btn">Sign in</Link><Link to="/register" className="primary-btn small">Get started <ArrowRight size={16} /></Link></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> Smarter property living</div>
          <h1>Everything your<br /><em>property needs,</em><br />in one place.</h1>
          <p>Manage maintenance, reserve amenities, and stay connected with your property team through one simple resident platform.</p>
          <div className="hero-buttons"><Link to="/register" className="primary-btn">Create free account <ArrowRight size={18} /></Link><a href="#features" className="secondary-btn">Explore features</a></div>
          <div className="trust-row"><div className="trust-avatars"><span>S</span><span>A</span><span>R</span><span>+</span></div><div><strong>4.8/5 resident satisfaction</strong><small>Designed for effortless property living</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="hero-dashboard">
            <div className="mock-sidebar"><Logo light /><div className="mock-nav active">⌂ Dashboard</div><div className="mock-nav">⌂ My Property</div><div className="mock-nav">⚒ Maintenance</div><div className="mock-nav">✦ Amenities</div><div className="mock-nav">▣ Bookings</div></div>
            <div className="mock-main">
              <div className="mock-top"><div><small>DASHBOARD</small><h3>Good morning, Shivaji</h3></div><div className="mock-avatar">S</div></div>
              <div className="mock-cards"><div><small>Total Requests</small><strong>04</strong><span>View all →</span></div><div><small>Upcoming Bookings</small><strong>02</strong><span>View all →</span></div><div><small>Open Issues</small><strong>02</strong><span>View all →</span></div></div>
              <div className="mock-panels"><div className="mock-panel"><div className="mock-panel-head">Maintenance Requests <span>View all</span></div><div className="mock-row"><b>AC not cooling</b><StatusMini text="In Progress" type="blue" /></div><div className="mock-row"><b>Water leakage</b><StatusMini text="Pending" type="gold" /></div><div className="mock-row"><b>Light replacement</b><StatusMini text="Completed" type="green" /></div></div><div className="mock-panel"><div className="mock-panel-head">Upcoming Bookings <span>View all</span></div><div className="booking-mini"><span>🏊</span><div><b>Swimming Pool</b><small>31 Aug · 10:00 AM</small></div></div><div className="booking-mini"><span>🏛</span><div><b>Community Hall</b><small>02 Sep · 05:00 PM</small></div></div></div></div>
              <div className="mock-announcement"><div><small>COMMUNITY UPDATE</small><b>Water supply maintenance on 5th Sep</b><span>10:00 AM – 2:00 PM</span></div><div className="city-art"><i/><i/><i/><i/></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip" id="features">
        <div className="section-kicker">BUILT FOR MODERN RESIDENTS</div>
        <h2>Everything in one calm, connected experience.</h2>
        <div className="feature-grid">
          <Feature icon={Wrench} title="Maintenance tracking" text="Create requests and follow every status update from submission to completion." />
          <Feature icon={CalendarCheck2} title="Smart amenity booking" text="See availability, select a time slot and avoid booking conflicts automatically." />
          <Feature icon={MessageCircle} title="Transparent communication" text="Keep property updates, service information and support in one place." />
          <Feature icon={BarChart3} title="Clear dashboards" text="Get a simple overview of requests, bookings and property activity at a glance." />
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="how-copy"><div className="section-kicker">HOW IT WORKS</div><h2>Simple enough for everyone.</h2><p>PropertyHub removes the back-and-forth from everyday rental operations. Everything follows a clear, trackable flow.</p><div className="steps"><Step n="01" title="Sign in" text="Access your resident workspace securely." /><Step n="02" title="Create or book" text="Raise an issue or reserve a shared amenity." /><Step n="03" title="Track in real time" text="See updates and confirmations without chasing anyone." /></div></div>
        <div className="how-card"><div className="circle-icon"><Sparkles /></div><h3>Designed around your day</h3><p>From a dripping tap to a weekend celebration, PropertyHub keeps small property tasks from becoming big headaches.</p><div className="check-line"><CheckCircle2 /> No double bookings</div><div className="check-line"><CheckCircle2 /> Clear request status</div><div className="check-line"><CheckCircle2 /> Mobile-friendly</div></div>
      </section>

      <section className="cta-section" id="benefits">
        <div><div className="section-kicker light">PROPERTY MANAGEMENT, SIMPLIFIED</div><h2>Less coordination.<br />More living.</h2></div>
        <Link to="/register" className="light-btn">Start using PropertyHub <ArrowRight size={18} /></Link>
      </section>
      <footer><Logo /><span>© 2026 PropertyHub · Resident services platform</span><div><a href="#features">Features</a><a href="#how">How it works</a></div></footer>
    </div>
  )
}

function Feature({ icon: Icon, title, text }) {
  return <article className="feature-card"><div className="feature-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>
}
function Step({ n, title, text }) {
  return <div className="step"><b>{n}</b><div><h4>{title}</h4><p>{text}</p></div></div>
}
function StatusMini({ text, type }) { return <span className={`mini-status ${type}`}>{text}</span> }
