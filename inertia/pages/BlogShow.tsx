import { Head, Link } from '@inertiajs/react'
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
  behanceUrl?: string
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

  const behanceEmbedUrl = post?.behanceUrl ? getBehanceEmbedUrl(post.behanceUrl) : null

  return (
    <PageShell>
      {post ? <Head title={post.title} /> : null}
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

          {post.behanceUrl ? (
            <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                <p className="text-sm font-medium text-slate-700">Projet Behance lié</p>
              </div>
              <div className="p-5">
                {behanceEmbedUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                    <iframe
                      src={behanceEmbedUrl}
                      height="100%"
                      width="100%"
                      allowFullScreen
                      title="Behance Project"
                      frameBorder="0"
                      allow="clipboard-write"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : null}
                <a
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                  href={post.behanceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Voir le projet sur Behance
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    <path d="M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </a>
              </div>
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

function getBehanceEmbedUrl(url: string) {
  const match = url.match(/behance\.net\/gallery\/(\d+)/)
  if (match) {
    return `https://www.behance.net/embed/project/${match[1]}?ilo0=1`
  }
  return null
}
