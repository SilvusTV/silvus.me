import { useEffect, useRef, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet, apiSend } from '../lib/api'

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

function linksToText(items: LinkItem[]): string {
  return items.map((item) => `${item.label} | ${item.url}`).join('\n')
}

function textToLinks(value: string): LinkItem[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|').map((part) => part.trim())
      return { label: label || '', url: url || '' }
    })
    .filter((item) => item.label.length > 0 && /^https?:\/\//.test(item.url))
}

export default function AdminPortfolio() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  const [summary, setSummary] = useState('')
  const [context, setContext] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [linksText, setLinksText] = useState('')
  const [detailsHtml, setDetailsHtml] = useState('')

  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true

    apiGet<{ entries: Entry[] }>('/api/admin/portfolio')
      .then((payload) => {
        if (!active) return
        setEntries(payload.entries)
        setSelectedId(payload.entries[0]?.id ?? null)
      })
      .catch(() => {
        if (!active) return
        setStatus('Impossible de charger les fiches portfolio.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const selected = entries.find((entry) => entry.id === selectedId) || null

  useEffect(() => {
    if (!selected) return

    setSummary(selected.summary || '')
    setContext(selected.context || '')
    setCoverImageUrl(selected.coverImageUrl || '')
    setLinksText(linksToText(selected.externalLinks || []))
    setDetailsHtml(selected.detailsHtml || '')
  }, [selected])

  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = detailsHtml
  }, [detailsHtml, selectedId])

  function runCommand(command: string) {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command)
    setDetailsHtml(editorRef.current.innerHTML)
  }

  function addLink() {
    if (!editorRef.current) return
    const url = window.prompt('URL du lien (https://...)')
    if (!url) return
    editorRef.current.focus()
    document.execCommand('createLink', false, url)
    setDetailsHtml(editorRef.current.innerHTML)
  }

  async function save() {
    if (!selected) return

    setSubmitting(true)
    setStatus('')

    try {
      const payload = await apiSend<{ entry: Entry }>(`/api/admin/portfolio/${selected.id}`, 'PATCH', {
        summary,
        context,
        coverImageUrl: coverImageUrl || undefined,
        detailsHtml,
        externalLinks: textToLinks(linksText),
      })

      setEntries((previous) =>
        previous.map((item) => (item.id === payload.entry.id ? payload.entry : item))
      )
      setStatus('Fiche portfolio mise à jour.')
    } catch {
      setStatus('Erreur pendant la mise à jour.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <PageShell>Chargement admin portfolio...</PageShell>
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-3xl font-semibold text-slate-900">Admin Portfolio</h1>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Fiches</h2>
          <div className="grid gap-2">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedId(entry.id)}
                className={[
                  'rounded-xl border px-3 py-2 text-left transition',
                  selectedId === entry.id
                    ? 'dark-action border-slate-900 bg-slate-900 text-slate-50'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                <p className="text-sm font-medium">{entry.title}</p>
                <p className="text-xs opacity-80">{entry.type}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          {!selected ? (
            <p className="text-sm text-slate-600">Sélectionne une fiche pour éditer son contenu.</p>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-slate-500">
                Édition de <strong>{selected.title}</strong> ({selected.slug})
              </p>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Résumé court</span>
                <textarea
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Contexte</span>
                <textarea
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Image d'entête (URL)</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Liens projet (une ligne: Label | URL)</span>
                <textarea
                  rows={4}
                  className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
                  value={linksText}
                  onChange={(event) => setLinksText(event.target.value)}
                  placeholder="Site officiel | https://..."
                />
              </label>

              <div className="grid gap-2">
                <span className="text-sm text-slate-700">Contenu riche</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => runCommand('bold')}
                  >
                    Gras
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => runCommand('italic')}
                  >
                    Italique
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => runCommand('insertUnorderedList')}
                  >
                    Liste
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={addLink}
                  >
                    Lien
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setDetailsHtml((event.target as HTMLDivElement).innerHTML)}
                  className="min-h-[220px] rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <button
                type="button"
                className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60"
                onClick={save}
                disabled={submitting}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {status ? <p className="text-sm text-slate-600">{status}</p> : null}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
