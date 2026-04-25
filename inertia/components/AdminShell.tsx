import { Link, usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { PageShell } from './PageShell'
import { apiSend } from '../lib/api'

const links = [
  { href: '/admin/blog', label: 'Blogs' },
  { href: '/admin/portfolio', label: 'Projets' },
  { href: '/admin/s3', label: 'S3 / MinIO' },
]

export function AdminShell({ children }: PropsWithChildren) {
  const page = usePage()

  async function logout() {
    try {
      await apiSend<{ authenticated: boolean }>('/api/admin/auth/logout', 'POST', {})
    } finally {
      window.location.href = '/admin/login'
    }
  }

  return (
    <PageShell>
      <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'rounded-full px-3 py-1.5 text-sm transition',
                  page.url === item.href
                    ? 'dark-action bg-slate-900 text-slate-50'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Deconnexion
          </button>
        </div>
      </section>

      {children}
    </PageShell>
  )
}
