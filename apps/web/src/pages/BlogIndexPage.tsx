import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  tags: string[]
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    apiGet<{ data: BlogPost[] }>('/api/blog').then((payload) => setPosts(payload.data))
  }, [])

  return (
    <PageShell>
      <h1>Blog</h1>
      <p>Retours d’expérience orientés terrain, produit et diffusion live.</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
        {posts.map((post) => (
          <li key={post.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>{post.title}</h2>
            <p>{post.excerpt}</p>
            <small>{post.tags.join(' · ')}</small>
            <div>
              <Link href={`/blog/${post.slug}`}>Lire l’article</Link>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
