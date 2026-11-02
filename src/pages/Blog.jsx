import React, { useState } from 'react'
import { BookOpen, CalendarDays, Plus, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Modal'

export function Blog() {
  const { blogs, addBlog } = useApp()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  const submit = async event => {
    event.preventDefault(); setBusy(true)
    const saved = await addBlog(form)
    setBusy(false)
    if (saved) { setForm({ title: '', content: '' }); setOpen(false) }
  }

  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">COMMUNITY</div><h1>Community blog</h1><p>Share useful updates, stories and notes with your neighbours.</p></div><button className="primary-btn" onClick={() => setOpen(true)}><Plus size={17}/> Create blog</button></div>
    {blogs.length ? <div className="blog-grid">{blogs.map(blog => <article className="panel blog-card" key={blog.id}><div className="blog-card-icon"><BookOpen size={20}/></div><div className="blog-meta"><span><UserRound size={13}/>{blog.author}</span><span><CalendarDays size={13}/>{formatDate(blog.createdAt)}</span></div><h2>{blog.title}</h2><p>{blog.content}</p></article>)}</div> : <section className="panel blog-empty"><div className="blog-card-icon"><BookOpen size={22}/></div><h2>Start the community conversation</h2><p>No posts have been shared yet. Publish the first update for your community.</p><button className="secondary-btn" onClick={() => setOpen(true)}><Plus size={16}/> Write the first post</button></section>}
    <Modal open={open} onClose={() => setOpen(false)} title="Create a community blog" subtitle="Write an update residents can read in the community portal.">
      <form className="modal-form" onSubmit={submit}><label>Post title<input minLength={5} maxLength={120} required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. Community clean-up this weekend"/></label><label>Post content<textarea minLength={20} maxLength={5000} required rows="7" value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="Share the details with your neighbours…"/></label><button className="primary-btn full" disabled={busy}>{busy ? 'Publishing…' : 'Publish blog'}</button></form>
    </Modal>
  </div>
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
}
