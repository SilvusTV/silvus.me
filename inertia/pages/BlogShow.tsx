import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'

type Post = {
  title: string
  excerpt: string
  content: string
  binanceSymbol?: string
  contactCtaUrl: string
}

export default function BlogShow({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((response) => response.json())
      .then(setPost)
  }, [slug])

  if (!post) return <PageShell>Chargement…</PageShell>

  return (
    <PageShell>
      <article className="grid gap-4">
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="text-zinc-300">{post.excerpt}</p>
        {post.binanceSymbol ? (
          <aside className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
            Bloc Binance: {post.binanceSymbol}
          </aside>
        ) : null}
        <p>{post.content}</p>
        <Link href={post.contactCtaUrl}>Me contacter à propos de ce projet</Link>
      </article>
    </PageShell>
  )
}
