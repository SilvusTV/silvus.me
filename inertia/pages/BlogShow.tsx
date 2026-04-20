import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type Post = {
  id: number
  title: string
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
  binanceSymbol?: string
  binanceEmbedUrl?: string
  contactCtaUrl: string
}

export default function BlogShow({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiGet<Post>(`/api/blog/${slug}`)
      .then((payload) => {
        if (!active) return
        setPost(payload)
      })
      .catch(() => {
        if (!active) return
        setError('Article introuvable ou indisponible.')
      })

    return () => {
      active = false
    }
  }, [slug])

  if (!post && !error) return <PageShell>Chargement...</PageShell>

  return (
    <PageShell>
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p> : null}

      {post ? (
        <article className="grid gap-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-900">{post.title}</h1>
            <p className="mt-2 text-slate-600">{post.excerpt}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
              {post.tags.join(' · ')}
              {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('fr-FR')}` : ''}
            </p>
          </section>

          {post.binanceSymbol ? (
            <aside className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-900">
              <p className="font-medium">Bloc Binance</p>
              <p className="mt-1">Symbole: {post.binanceSymbol}</p>
              {post.binanceEmbedUrl ? (
                <a className="mt-2 inline-flex underline" href={post.binanceEmbedUrl} rel="noreferrer" target="_blank">
                  Ouvrir le marche
                </a>
              ) : null}
            </aside>
          ) : null}

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
            <article className="grid gap-4 text-slate-700">
              <Block title="Contexte" body={post.sections.context} />
              <Block title="Ce que j ai fait" body={post.sections.what} />
              <Block title="Comment" body={post.sections.how} />
              <Block title="Pourquoi" body={post.sections.why} />
              <Block title="Resultat" body={post.sections.result || post.content} />
            </article>
          </section>

          <Link className="dark-action inline-flex w-fit rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-50" href={post.contactCtaUrl}>
            Me contacter a propos de ce projet
          </Link>
        </article>
      ) : null}
    </PageShell>
  )
}

function Block({ title, body }: { title: string; body: string }) {
  if (!body) return null

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <p className="mt-1">{body}</p>
    </section>
  )
}
