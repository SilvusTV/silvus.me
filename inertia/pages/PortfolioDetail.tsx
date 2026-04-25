import { Head, Link, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type LinkItem = { label: string; url: string }

type Entry = {
  id: number
  type: 'project' | 'event' | 'experience' | 'skill'
  slug: string
  title: string
  summary: string
  context: string | null
  stack: string[]
  impactMetrics: Record<string, string>
  coverImageUrl: string | null
  detailsHtml: string
  externalLinks: LinkItem[]
  startDate?: string | null
  endDate?: string | null
  highlighted: boolean
}

export default function PortfolioDetail() {
  const { props } = usePage<{ slug: string }>()
  const slug = props.slug

  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiGet<Entry>(`/api/portfolio/${slug}`)
      .then((payload) => {
        if (!active) return
        setEntry(payload)
      })
      .catch(() => {
        if (!active) return
        setError('Impossible de charger cette fiche portfolio pour le moment.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return <PageShell>Chargement de la fiche...</PageShell>
  }

  if (error || !entry) {
    return (
      <PageShell>
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error || 'Fiche introuvable'}
        </p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {entry ? <Head title={entry.title} /> : null}
      <Link
        href="/portfolio"
        className="mb-4 inline-flex rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
      >
        Retour au portfolio
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm">
        <header className="relative">
          {entry.coverImageUrl ? (
            <img src={entry.coverImageUrl} alt={entry.title} className="h-64 w-full object-cover sm:h-80" />
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 sm:h-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
              <span className="rounded-full bg-white/20 px-2 py-0.5">{entry.type}</span>
              {(entry.startDate || entry.endDate) ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5">
                  {entry.startDate || '?'} {entry.endDate ? `→ ${entry.endDate}` : ''}
                </span>
              ) : null}
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{entry.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-100 sm:text-base">{entry.summary}</p>
          </div>
        </header>

        <div className="grid gap-8 p-6 lg:grid-cols-[2fr_1fr]">
          <section className="portfolio-rich">
            <div dangerouslySetInnerHTML={{ __html: entry.detailsHtml }} />
          </section>

          <aside className="grid gap-5">
            {entry.externalLinks.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Liens projet</h2>
                <div className="flex flex-wrap gap-2">
                  {entry.externalLinks.map((item) => (
                    <a
                      key={`${item.label}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {entry.stack.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Stack</h2>
                <p className="font-mono text-xs uppercase tracking-wide text-slate-600">{entry.stack.join(' · ')}</p>
              </section>
            ) : null}

            {Object.keys(entry.impactMetrics).length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Impact</h2>
                <p className="text-sm text-slate-600">
                  {Object.entries(entry.impactMetrics)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' · ')}
                </p>
              </section>
            ) : null}
          </aside>
        </div>
      </article>
    </PageShell>
  )
}
