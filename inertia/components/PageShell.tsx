import { Link, usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'

const links = [
  { href: '/', label: 'Intro' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/journey', label: 'Parcours' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' }
]

export function PageShell({ children }: PropsWithChildren) {
  const page = usePage()

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-8">
      <header className="mb-10 rounded-2xl border border-slate-200/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <strong className="font-mono text-sm uppercase tracking-[0.2em] text-slate-600">
            silvus.me
          </strong>
          <nav className="flex flex-wrap gap-2 text-sm">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'rounded-full px-3 py-1.5 transition',
                page.url === item.href
                  ? 'dark-action bg-slate-900 text-slate-50'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        </div>
      </header>
      {children}
    </main>
  )
}
