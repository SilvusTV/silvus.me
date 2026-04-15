import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type BlogPostDetail = {
  title: string
  excerpt: string
  content: string
  binanceSymbol?: string
  contactCtaUrl: string
}

export default function BlogShowPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPostDetail | null>(null)

  useEffect(() => {
    apiGet<BlogPostDetail>(`/api/blog/${slug}`).then(setPost)
  }, [slug])

  if (!post) {
    return <PageShell>Chargement…</PageShell>
  }

  return (
    <PageShell>
      <article style={{ display: 'grid', gap: '1rem' }}>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        {post.binanceSymbol ? (
          <aside style={{ border: '1px solid #ddd', borderRadius: 12, padding: '1rem' }}>
            Bloc Binance: {post.binanceSymbol}
          </aside>
        ) : null}
        <p>{post.content}</p>
        <Link href={post.contactCtaUrl}>Me contacter à propos de ce projet</Link>
      </article>
    </PageShell>
  )
}
