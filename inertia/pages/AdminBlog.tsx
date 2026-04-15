import { useState } from 'react'
import { PageShell } from '../components/PageShell'

export default function AdminBlog() {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: ''
  })

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    const response = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: ['retour-experience'] })
    })

    if (!response.ok) {
      setStatus('Erreur de création')
      return
    }

    setStatus('Article créé')
    setForm({ title: '', slug: '', excerpt: '', content: '' })
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-semibold">Admin Blog</h1>
      <form onSubmit={submit} className="grid max-w-2xl gap-3">
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Titre" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Résumé" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} required />
        <textarea className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" rows={10} placeholder="Contenu" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
        <button className="rounded bg-zinc-100 px-4 py-2 text-zinc-900" type="submit">Publier</button>
      </form>
      {status ? <p className="mt-4 text-sm text-zinc-300">{status}</p> : null}
    </PageShell>
  )
}
