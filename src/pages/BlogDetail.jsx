import React, { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, CalendarDays, Edit3, Trash2, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BlogEditorModal } from '../components/BlogEditorModal'
import { Modal } from '../components/Modal'

export function BlogDetail() {
  const { id } = useParams()
  const { user, getBlog, updateBlog, deleteBlog } = useApp()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getBlog(id).then(result => {
      if (!active) return
      setBlog(result)
      setMissing(!result)
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [getBlog, id])

  const canManage = blog && (user?.role === 'manager' || blog.authorId === user?.id)
  const saveChanges = async body => {
    setBusy(true)
    const updated = await updateBlog(id, body)
    setBusy(false)
    if (updated) { setBlog(updated); setEditing(false) }
  }
  const removePost = async () => {
    setBusy(true)
    const deleted = await deleteBlog(id)
    setBusy(false)
    if (deleted) navigate('/app/blog')
  }

  if (loading) return <section className="panel blog-detail-state"><BookOpen size={24}/><h2>Loading community post…</h2></section>
  if (missing) return <section className="panel blog-detail-state"><BookOpen size={24}/><h2>Post not found</h2><p>This blog may have been removed or its link may be incorrect.</p><Link className="secondary-btn" to="/app/blog"><ArrowLeft size={16}/> Back to community blog</Link></section>

  return <article className="panel blog-detail">
    <Link className="back-link blog-back-link" to="/app/blog"><ArrowLeft size={16}/> All community posts</Link>
    {canManage && <div className="blog-detail-actions"><button className="secondary-btn" onClick={() => setEditing(true)}><Edit3 size={15}/> Edit post</button><button className="danger-outline-btn" onClick={() => setConfirmDelete(true)}><Trash2 size={15}/> Delete post</button></div>}
    <div className="blog-detail-icon"><BookOpen size={22}/></div>
    <h1>{blog.title}</h1>
    <div className="blog-meta blog-detail-meta"><span className="blog-category-chip">{blog.category || 'Community'}</span><span><UserRound size={14}/>{blog.author}</span><span><CalendarDays size={14}/>{formatDate(blog.createdAt)}{blog.updatedAt && blog.updatedAt !== blog.createdAt ? ' · edited' : ''}</span></div>
    <div className="blog-detail-content">{blog.content}</div>
    <BlogEditorModal open={editing} onClose={() => { if (!busy) setEditing(false) }} onSubmit={saveChanges} blog={blog} busy={busy}/>
    <Modal open={confirmDelete} onClose={() => { if (!busy) setConfirmDelete(false) }} title="Delete this post?" subtitle={blog.title}>
      <p className="delete-confirm-copy">This will permanently remove the post from the community blog.</p><div className="delete-confirm-actions"><button className="secondary-btn" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</button><button className="danger-btn" disabled={busy} onClick={removePost}>{busy ? 'Deleting…' : 'Delete post'}</button></div>
    </Modal>
  </article>
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(value))
}
