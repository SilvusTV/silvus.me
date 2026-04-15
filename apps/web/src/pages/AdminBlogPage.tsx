import { useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiPost } from '../lib/api'

export default function AdminBlogPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    await apiPost('/api/admin/blog', {
      title,
      slug,
      excerpt,
      content,
      tags: ['retour-experience']
    })

    setStatus('Article créé.')
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
  }

  return (
    <PageShell>
      <h1>Admin blog</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 640 }}>
        <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <input placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
        <textarea placeholder="Contenu" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="submit">Publier</button>
      </form>
      {status ? <p>{status}</p> : null}
    </PageShell>
  )
}
