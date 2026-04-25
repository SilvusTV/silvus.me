import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type Entry = {
  id: number
  type: 'project' | 'event' | 'experience' | 'skill'
  slug: string
  title: string
  summary: string
  context: string | null
  stack: string[]
  impactMetrics: Record<string, string>
  startDate?: string | null
  endDate?: string | null
  highlighted: boolean
}

function excerpt(value: string, maxLength = 180): string {
  const withoutMarkdownLinks = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
  const normalized = withoutMarkdownLinks.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export default function Portfolio() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | 'project' | 'event'>('all')

  useEffect(() => {
    let active = true

    apiGet<{ entries: Entry[] }>('/api/portfolio')
      .then((payload) => {
        if (!active) return
        setEntries(payload.entries)
      })
      .catch(() => {
        if (!active) return
        setError('Impossible de charger le portfolio pour le moment.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <PageShell>Chargement du portfolio...</PageShell>
  }

  const normalizedQuery = query.trim().toLowerCase()

  const filteredEntries = entries.filter((entry) => {
    if (kind !== 'all' && entry.type !== kind) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    const searchable = [entry.title, entry.summary, entry.context || ''].join(' ').toLowerCase()
    return searchable.includes(normalizedQuery)
  })

  return (
    <PageShell>
      <Head title="Portfolio" />
      <section className="mb-6 grid gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">Portfolio</h1>
        <p className="max-w-2xl text-slate-600">
          Voici les projets, evenements et experiences qui representent le mieux mon axe dev fullstack + operations
          broadcast.
        </p>
      </section>

      <section className="mb-6 grid gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher par mot-clé (titre, description...)"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => setKind('all')}
            className={[
              'rounded-full border px-3 py-1.5 transition',
              kind === 'all'
                ? 'dark-action border-slate-900 bg-slate-900 text-slate-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            ].join(' ')}
          >
            Tout
          </button>
          <button
            type="button"
            onClick={() => setKind('project')}
            className={[
              'rounded-full border px-3 py-1.5 transition',
              kind === 'project'
                ? 'dark-action border-slate-900 bg-slate-900 text-slate-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            ].join(' ')}
          >
            Projet
          </button>
          <button
            type="button"
            onClick={() => setKind('event')}
            className={[
              'rounded-full border px-3 py-1.5 transition',
              kind === 'event'
                ? 'dark-action border-slate-900 bg-slate-900 text-slate-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            ].join(' ')}
          >
            Event
          </button>
        </div>
      </section>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p> : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {filteredEntries.map((entry) => (
          <li key={entry.id} className="h-full rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <article className="flex h-full flex-col">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span>{entry.type}</span>
                {entry.highlighted ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">highlight</span>
                ) : null}
              </div>

              <p className="text-lg font-medium text-slate-900">{entry.title}</p>
              {(entry.startDate || entry.endDate) ? (
                <p className="mt-1 text-xs text-slate-500">
                  {entry.startDate || '?'} {entry.endDate ? `→ ${entry.endDate}` : ''}
                </p>
              ) : null}

              <p className="mt-3 text-sm text-slate-600">{excerpt(entry.summary)}</p>
              {entry.context ? <p className="mt-2 text-sm text-slate-500">{excerpt(entry.context, 150)}</p> : null}

              <div className="mt-auto pt-4">
                {entry.stack.length > 0 ? (
                  <p className="font-mono text-xs uppercase tracking-wide text-slate-500">
                    {entry.stack.join(' · ')}
                  </p>
                ) : null}
                {Object.keys(entry.impactMetrics).length > 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Impact:{' '}
                    {Object.entries(entry.impactMetrics)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' · ')}
                  </p>
                ) : null}
                <div className="mt-4">
                  <Link
                    href={`/portfolio/${entry.slug}`}
                    className="inline-flex rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    Voir le détail
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {filteredEntries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
          Aucun résultat pour cette recherche.
        </p>
      ) : null}
    </PageShell>
  )
}
