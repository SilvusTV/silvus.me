import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string
  tags: string[]
  publishedAt: string | null
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiGet<{ data: Post[] }>('/api/blog')
      .then((payload) => {
        if (!active) return
        setPosts(payload.data)
      })
      .catch(() => {
        if (!active) return
        setError('Impossible de charger les articles pour le moment.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <PageShell>Chargement des articles...</PageShell>
  }

  return (
    <PageShell>
      <section className="mb-6 grid gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">Blog</h1>
        <p className="max-w-2xl text-slate-600">
          Des retours d experience concrets: contexte, implementation, arbitrages, resultat.
        </p>
      </section>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p> : null}

      <ul className="grid gap-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="text-xl font-medium text-slate-900">{post.title}</h2>
            <p className="mt-2 text-slate-600">{post.excerpt}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              {post.tags.join(' · ')}
              {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('fr-FR')}` : ''}
            </p>
              <Link className="dark-action mt-3 inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-sm text-slate-50" href={`/blog/${post.slug}`}>
              Lire l article
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
