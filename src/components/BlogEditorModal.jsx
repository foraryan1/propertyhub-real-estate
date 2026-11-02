import React, { useEffect, useState } from 'react'
import { Modal } from './Modal'

export const BLOG_CATEGORIES = ['Community', 'Events', 'Maintenance', 'Lifestyle', 'Announcements']

const blankPost = { title: '', content: '', category: 'Community' }

export function BlogEditorModal({ open, onClose, onSubmit, blog = null, busy = false }) {
  const [form, setForm] = useState(blankPost)

  useEffect(() => {
    if (open) setForm(blog ? { title: blog.title, content: blog.content, category: blog.category || 'Community' } : blankPost)
  }, [blog, open])

  const submit = async event => {
    event.preventDefault()
    await onSubmit(form)
  }

  const setField = (field, value) => setForm(current => ({ ...current, [field]: value }))
  const editing = Boolean(blog)

  return <Modal open={open} onClose={onClose} title={editing ? 'Edit community blog' : 'Create a community blog'} subtitle="Write an update residents can read in the community portal.">
    <form className="modal-form" onSubmit={submit}>
      <label>Post title<input minLength={5} maxLength={120} required value={form.title} onChange={event => setField('title', event.target.value)} placeholder="e.g. Community clean-up this weekend"/></label>
      <label>Category<select required value={form.category} onChange={event => setField('category', event.target.value)}>{BLOG_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
      <label>Post content<textarea minLength={20} maxLength={5000} required rows="7" value={form.content} onChange={event => setField('content', event.target.value)} placeholder="Share the details with your neighbours…"/></label>
      <button className="primary-btn full" disabled={busy}>{busy ? (editing ? 'Saving…' : 'Publishing…') : (editing ? 'Save changes' : 'Publish blog')}</button>
    </form>
  </Modal>
}
