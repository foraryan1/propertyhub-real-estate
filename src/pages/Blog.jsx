import React, { useMemo, useState } from 'react'
import { BookOpen, CalendarDays, Edit3, Filter, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Modal'
import { BLOG_CATEGORIES, BlogEditorModal } from '../components/BlogEditorModal'

export function Blog() {
  const { blogs, user, addBlog, updateBlog, deleteBlog } = useApp()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [deletingBlog, setDeletingBlog] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')

  const visibleBlogs = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return blogs.filter(blog => {
      const matchesCategory = category === 'All categories' || (blog.category || 'Community') === category
      const matchesQuery = !term || `${blog.title} ${blog.content} ${blog.author}`.toLocaleLowerCase().includes(term)
      return matchesCategory && matchesQuery
    })
  }, [blogs, category, query])

  const submit = async form => {
    setBusy(true)
    const saved = editingBlog ? await updateBlog(editingBlog.id, form) : await addBlog(form)
    setBusy(false)
    if (saved) { setOpen(false); setEditingBlog(null) }
  }

  const openCreate = () => { setEditingBlog(null); setOpen(true) }
  const openEdit = blog => { setEditingBlog(blog); setOpen(true) }

  const confirmDelete = async () => {
    if (!deletingBlog) return
    setBusy(true)
    const deleted = await deleteBlog(deletingBlog.id)
    setBusy(false)
    if (deleted) setDeletingBlog(null)
  }

  return <div className="page">
    <div className="page-head"><div><div className="section-kicker">COMMUNITY</div><h1>Community blog</h1><p>Share useful updates, stories and notes with your neighbours.</p></div><button className="primary-btn" onClick={openCreate}><Plus size={17}/> Create blog</button></div>
    <div className="toolbar blog-toolbar">
      <label className="search-box"><Search size={15}/><input aria-label="Search community blogs" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search posts or authors…"/></label>
      <label className="blog-category-filter"><Filter size={15}/><select aria-label="Filter blogs by category" className="compact-select" value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{BLOG_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
    </div>
    {blogs.length === 0 ? <section className="panel blog-empty"><div className="blog-card-icon"><BookOpen size={22}/></div><h2>Start the community conversation</h2><p>No posts have been shared yet. Publish the first update for your community.</p><button className="secondary-btn" onClick={openCreate}><Plus size={16}/> Write the first post</button></section>
      : visibleBlogs.length ? <div className="blog-grid">{visibleBlogs.map(blog => {
        const canManage = user?.role === 'manager' || blog.authorId === user?.id
        return <article className="panel blog-card" key={blog.id}>
          <div className="blog-card-top"><div className="blog-card-icon"><BookOpen size={20}/></div>{canManage && <div className="blog-card-actions"><button className="icon-btn" aria-label={`Edit ${blog.title}`} title="Edit post" onClick={() => openEdit(blog)}><Edit3 size={16}/></button><button className="icon-btn danger-icon" aria-label={`Delete ${blog.title}`} title="Delete post" onClick={() => setDeletingBlog(blog)}><Trash2 size={16}/></button></div>}</div>
          <span className="blog-category-chip">{blog.category || 'Community'}</span>
          <div className="blog-meta"><span><UserRound size={13}/>{blog.author}</span><span><CalendarDays size={13}/>{formatDate(blog.createdAt)}</span></div>
          <h2>{blog.title}</h2><p>{blog.content.length > 220 ? `${blog.content.slice(0, 220).trim()}…` : blog.content}</p><Link className="blog-read-more" to={`/app/blog/${blog.id}`}>Read full post →</Link>
        </article>
      })}</div> : <section className="panel blog-empty"><div className="blog-card-icon"><Search size={22}/></div><h2>No matching posts</h2><p>Try another search or choose a different category.</p><button className="secondary-btn" onClick={() => { setQuery(''); setCategory('All categories') }}>Clear filters</button></section>}
    <BlogEditorModal open={open} onClose={() => { if (!busy) { setOpen(false); setEditingBlog(null) } }} onSubmit={submit} blog={editingBlog} busy={busy}/>
    <Modal open={Boolean(deletingBlog)} onClose={() => { if (!busy) setDeletingBlog(null) }} title="Delete this post?" subtitle={deletingBlog?.title}>
      <p className="delete-confirm-copy">This will permanently remove the post from the community blog.</p><div className="delete-confirm-actions"><button className="secondary-btn" disabled={busy} onClick={() => setDeletingBlog(null)}>Cancel</button><button className="danger-btn" disabled={busy} onClick={confirmDelete}>{busy ? 'Deleting…' : 'Delete post'}</button></div>
    </Modal>
  </div>
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value))
}
