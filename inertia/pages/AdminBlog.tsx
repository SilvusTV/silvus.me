import { useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '../components/AdminShell'
import { apiGet, apiSend } from '../lib/api'

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  sections: {
    context: string
    what: string
    how: string
    why: string
    result: string
  }
  tags: string[]
  publishedAt: string | null
  behanceUrl: string | null
}

type BlogPayload = {
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  publishedAt?: string
  behanceUrl?: string
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  context: '',
  what: '',
  how: '',
  why: '',
  result: '',
  tags: 'retour-experience',
  publishedAt: '',
  behanceUrl: '',
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(emptyForm)

  const selected = posts.find((post) => post.id === selectedId) || null
  const isEditing = Boolean(selected)

  useEffect(() => {
    let active = true

    apiGet<{ data: BlogPost[] }>('/api/admin/blog')
      .then((payload) => {
        if (!active) return
        setPosts(payload.data)
        setSelectedId(payload.data[0]?.id ?? null)
      })
      .catch(() => {
        if (!active) return
        setStatus('Impossible de charger les articles admin.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selected) {
      setForm(emptyForm)
      return
    }

    setForm({
      title: selected.title,
      slug: selected.slug,
      excerpt: selected.excerpt,
      context: selected.sections.context,
      what: selected.sections.what,
      how: selected.sections.how,
      why: selected.sections.why,
      result: selected.sections.result,
      tags: selected.tags.join(', '),
      publishedAt: toDatetimeLocal(selected.publishedAt),
      behanceUrl: selected.behanceUrl || '',
    })
  }, [selected])

  function selectCreateMode() {
    setSelectedId(null)
    setStatus('')
    setForm(emptyForm)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    try {
      const payload = buildPayload(form)

      if (isEditing && selected) {
        const response = await apiSend<{ data: BlogPost }>(`/api/admin/blog/${selected.id}`, 'PATCH', payload)
        setPosts((previous) => previous.map((post) => (post.id === response.data.id ? response.data : post)))
        setStatus('Article mis à jour.')
      } else {
        const response = await apiSend<{ data: BlogPost }>('/api/admin/blog', 'POST', payload)
        setPosts((previous) => [response.data, ...previous])
        setSelectedId(response.data.id)
        setStatus('Article créé.')
      }
    } catch {
      setStatus('Operation impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeSelected() {
    if (!selected) return
    if (!window.confirm(`Supprimer ${selected.title} ?`)) return

    setSubmitting(true)
    setStatus('')

    try {
      await apiSend<{ deleted: boolean }>(`/api/admin/blog/${selected.id}`, 'DELETE', {})
      setPosts((previous) => previous.filter((post) => post.id !== selected.id))
      setSelectedId(null)
      setForm(emptyForm)
      setStatus('Article supprimé.')
    } catch {
      setStatus('Suppression impossible.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <AdminShell>Chargement admin blog...</AdminShell>
  }

  return (
    <AdminShell>
      <h1 className="mb-4 text-3xl font-semibold text-slate-900">Admin Blog</h1>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <button
            type="button"
            onClick={selectCreateMode}
            className="dark-action mb-3 w-full rounded-full bg-slate-900 px-3 py-2 text-sm text-slate-50"
          >
            Nouvel article
          </button>

          <div className="grid gap-2">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedId(post.id)}
                className={[
                  'rounded-xl border px-3 py-2 text-left transition',
                  selectedId === post.id
                    ? 'dark-action border-slate-900 bg-slate-900 text-slate-50'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                <p className="text-sm font-medium">{post.title}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs opacity-80">{post.slug}</p>
                  {post.behanceUrl ? (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Behance
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <form onSubmit={submit} className="grid gap-3">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Titre"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              required
              disabled={isEditing}
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Résumé"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              required
            />

            <textarea
              className="rounded-xl border border-slate-300 px-3 py-2"
              rows={3}
              placeholder="Contexte"
              value={form.context}
              onChange={(event) => setForm({ ...form, context: event.target.value })}
              required
            />
            <textarea
              className="rounded-xl border border-slate-300 px-3 py-2"
              rows={3}
              placeholder="Ce que j'ai fait"
              value={form.what}
              onChange={(event) => setForm({ ...form, what: event.target.value })}
              required
            />
            <textarea
              className="rounded-xl border border-slate-300 px-3 py-2"
              rows={3}
              placeholder="Comment"
              value={form.how}
              onChange={(event) => setForm({ ...form, how: event.target.value })}
              required
            />
            <textarea
              className="rounded-xl border border-slate-300 px-3 py-2"
              rows={3}
              placeholder="Pourquoi"
              value={form.why}
              onChange={(event) => setForm({ ...form, why: event.target.value })}
              required
            />
            <textarea
              className="rounded-xl border border-slate-300 px-3 py-2"
              rows={4}
              placeholder="Résultat"
              value={form.result}
              onChange={(event) => setForm({ ...form, result: event.target.value })}
              required
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Tags (séparés par des virgules)"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
            />

            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="URL de galerie Behance (optionnel)"
              value={form.behanceUrl}
              onChange={(event) => setForm({ ...form, behanceUrl: event.target.value })}
            />

            <div className="flex flex-wrap gap-2">
              <button
                className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Publier'}
              </button>
              {isEditing ? (
                <>
                  <a
                    href={`/blog/${selected?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit rounded-full border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    Voir l'article
                  </a>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={removeSelected}
                    className="w-fit rounded-full border border-rose-300 px-5 py-2 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                </>
              ) : null}
            </div>
          </form>

          {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
        </section>
      </div>
    </AdminShell>
  )
}

function buildPayload(form: typeof emptyForm): BlogPayload {
  const publishedAt = normalizeDatetime(form.publishedAt)

  return {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: JSON.stringify({
      context: form.context,
      what: form.what,
      how: form.how,
      why: form.why,
      result: form.result,
    }),
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    publishedAt: publishedAt || undefined,
    behanceUrl: form.behanceUrl || undefined,
  }
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function normalizeDatetime(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}
