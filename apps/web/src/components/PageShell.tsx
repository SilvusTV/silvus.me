import { Link } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'

const links = [
  { href: '/', label: 'Intro' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/journey', label: 'Parcours' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' }
]

export function PageShell({ children }: PropsWithChildren) {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <strong>silvus.me</strong>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  )
}
