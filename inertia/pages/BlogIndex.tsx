import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'

type Post = { id: number; title: string; slug: string; excerpt: string; tags: string[] }

export default function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetch('/api/blog')
      .then((response) => response.json())
      .then((payload) => setPosts(payload.data))
  }, [])

  return (
    <PageShell>
      <h1 className="mb-2 text-2xl font-semibold">Blog</h1>
      <p className="mb-6 text-zinc-300">Retours d’expérience concrets côté produit et live.</p>
      <ul className="grid gap-3">
        {posts.map((post) => (
          <li key={post.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-medium">{post.title}</h2>
            <p className="text-sm text-zinc-300">{post.excerpt}</p>
            <p className="mb-2 text-xs text-zinc-400">{post.tags.join(' · ')}</p>
            <Link href={`/blog/${post.slug}`}>Lire l’article</Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
