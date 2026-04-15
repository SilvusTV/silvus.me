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
    <main className="mx-auto max-w-4xl px-5 py-8">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <strong className="text-zinc-200">silvus.me</strong>
        <nav className="flex gap-4 text-sm text-zinc-300">
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
