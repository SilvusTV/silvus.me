import { useState, type FormEvent } from 'react'
import { PageShell } from '../components/PageShell'
import { apiSend } from '../lib/api'

export default function AdminBlog() {
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    context: '',
    what: '',
    how: '',
    why: '',
    result: '',
    tags: 'retour-experience',
    binanceSymbol: '',
    binanceEmbedUrl: ''
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    try {
      await apiSend('/api/admin/blog', 'POST', {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: JSON.stringify({
          context: form.context,
          what: form.what,
          how: form.how,
          why: form.why,
          result: form.result
        }),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        binanceSymbol: form.binanceSymbol || undefined,
        binanceEmbedUrl: form.binanceEmbedUrl || undefined
      })

      setStatus('Article cree.')
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        context: '',
        what: '',
        how: '',
        why: '',
        result: '',
        tags: 'retour-experience',
        binanceSymbol: '',
        binanceEmbedUrl: ''
      })
    } catch {
      setStatus('Erreur de creation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-3xl font-semibold text-slate-900">Admin Blog</h1>
      <form onSubmit={submit} className="grid max-w-3xl gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Titre" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Resume" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} required />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2" rows={4} placeholder="Contexte" value={form.context} onChange={(event) => setForm({ ...form, context: event.target.value })} required />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2" rows={4} placeholder="Ce que j ai fait" value={form.what} onChange={(event) => setForm({ ...form, what: event.target.value })} required />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2" rows={4} placeholder="Comment" value={form.how} onChange={(event) => setForm({ ...form, how: event.target.value })} required />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2" rows={4} placeholder="Pourquoi" value={form.why} onChange={(event) => setForm({ ...form, why: event.target.value })} required />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2" rows={4} placeholder="Resultat" value={form.result} onChange={(event) => setForm({ ...form, result: event.target.value })} required />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Binance symbol (optional)" value={form.binanceSymbol} onChange={(event) => setForm({ ...form, binanceSymbol: event.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Binance embed URL (optional)" value={form.binanceEmbedUrl} onChange={(event) => setForm({ ...form, binanceEmbedUrl: event.target.value })} />
        <button className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? 'Publication...' : 'Publier'}
        </button>
      </form>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
    </PageShell>
  )
}
