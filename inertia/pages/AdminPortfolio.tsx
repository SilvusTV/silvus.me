import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AdminShell } from '../components/AdminShell'
import { apiGet, apiSend, apiSendForm } from '../lib/api'

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

function metricsToText(metrics: Record<string, string>): string {
  return Object.entries(metrics)
    .map(([key, value]) => `${key} | ${value}`)
    .join('\n')
}

function textToMetrics(value: string): Record<string, string> {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const [key, metric] = line.split('|').map((part) => part.trim())
      if (key && metric) {
        accumulator[key] = metric
      }
      return accumulator
    }, {})
}

export default function AdminPortfolio() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  const [type, setType] = useState<Entry['type']>('project')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [context, setContext] = useState('')
  const [stack, setStack] = useState('')
  const [impactMetricsText, setImpactMetricsText] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [linksText, setLinksText] = useState('')
  const [detailsHtml, setDetailsHtml] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [highlighted, setHighlighted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [externalImageUrl, setExternalImageUrl] = useState('')
  const [externalCreditText, setExternalCreditText] = useState('')
  const [externalCreditUrl, setExternalCreditUrl] = useState('')
  const [imageError, setImageError] = useState('')

  const editorRef = useRef<HTMLDivElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const savedSelectionRef = useRef<Range | null>(null)

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

    setType(selected.type)
    setSlug(selected.slug || '')
    setTitle(selected.title || '')
    setSummary(selected.summary || '')
    setContext(selected.context || '')
    setStack(selected.stack.join(', '))
    setImpactMetricsText(metricsToText(selected.impactMetrics || {}))
    setCoverImageUrl(selected.coverImageUrl || '')
    setLinksText(linksToText(selected.externalLinks || []))
    setDetailsHtml(selected.detailsHtml || '')
    setStartDate(selected.startDate || '')
    setEndDate(selected.endDate || '')
    setHighlighted(Boolean(selected.highlighted))
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
    const selectedText = captureEditorSelection()
    setLinkText(selectedText)
    setLinkUrl('')
    setLinkError('')
    setLinkModalOpen(true)
  }

  function insertHtml(html: string) {
    if (!editorRef.current) return
    restoreEditorSelection()
    editorRef.current.focus()
    document.execCommand('insertHTML', false, html)
    setDetailsHtml(editorRef.current.innerHTML)
    savedSelectionRef.current = null
  }

  function addExternalImage() {
    captureEditorSelection()
    setExternalImageUrl('')
    setExternalCreditText('')
    setExternalCreditUrl('')
    setImageError('')
    setImageModalOpen(true)
  }

  function triggerS3ImagePicker() {
    imageInputRef.current?.click()
  }

  async function onS3ImagePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !selected) return

    setUploadingImage(true)
    setStatus('')

    try {
      const body = new FormData()
      body.set('file', file)
      body.set('prefix', `portfolio/${sanitizeKeySegment(slug || selected.slug)}`)

      const response = await apiSendForm<{ data: { key: string; url: string } }>(
        '/api/admin/s3/upload',
        'POST',
        body
      )

      const alt = window.prompt('Texte alternatif (alt)') || file.name
      const creditUrl = response.data.url
      const creditLabel = `S3 / ${response.data.key}`

      insertHtml(buildImageFigureHtml(response.data.url, alt, creditUrl, creditLabel, 's3'))
      setStatus('Image envoyee sur S3 et inseree.')
    } catch {
      setStatus('Upload image S3 impossible.')
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  function submitLinkModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = linkText.trim()
    const url = linkUrl.trim()
    if (!text) {
      setLinkError('Le texte du lien est obligatoire.')
      return
    }
    if (!isHttpUrl(url)) {
      setLinkError('Le lien doit commencer par http:// ou https://')
      return
    }

    insertHtml(
      `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noreferrer">${escapeHtmlText(text)}</a>`
    )
    setLinkModalOpen(false)
    setLinkText('')
    setLinkUrl('')
    setLinkError('')
  }

  function submitExternalImageModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const imageUrl = externalImageUrl.trim()
    const creditText = externalCreditText.trim()
    const creditUrl = externalCreditUrl.trim()

    if (!isHttpUrl(imageUrl)) {
      setImageError('L URL de l image doit commencer par http:// ou https://')
      return
    }
    if (!creditText) {
      setImageError('Le texte du credit est obligatoire.')
      return
    }
    if (!isHttpUrl(creditUrl)) {
      setImageError('Le lien du credit doit commencer par http:// ou https://')
      return
    }

    insertHtml(buildImageFigureHtml(imageUrl, creditText, creditUrl, creditText, 'external'))
    setImageModalOpen(false)
    setExternalImageUrl('')
    setExternalCreditText('')
    setExternalCreditUrl('')
    setImageError('')
  }

  function captureEditorSelection(): string {
    if (!editorRef.current) return ''
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return ''

    const range = selection.getRangeAt(0)
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return ''
    }

    savedSelectionRef.current = range.cloneRange()
    return selection.toString().trim()
  }

  function restoreEditorSelection() {
    if (!savedSelectionRef.current) return
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(savedSelectionRef.current)
  }

  async function save() {
    if (!selected) return

    setSubmitting(true)
    setStatus('')

    try {
      const payload = await apiSend<{ entry: Entry }>(`/api/admin/portfolio/${selected.id}`, 'PATCH', {
        type,
        slug,
        title,
        summary,
        context,
        stack: stack
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        impactMetrics: textToMetrics(impactMetricsText),
        coverImageUrl: coverImageUrl || undefined,
        detailsHtml,
        externalLinks: textToLinks(linksText),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        highlighted,
      })

      setEntries((previous) =>
        previous.map((item) => (item.id === payload.entry.id ? payload.entry : item))
      )
      setStatus('Fiche portfolio mise a jour.')
    } catch {
      setStatus('Erreur pendant la mise a jour.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <AdminShell>Chargement admin portfolio...</AdminShell>
  }

  return (
    <AdminShell>
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
            <p className="text-sm text-slate-600">Selectionne une fiche pour l editer.</p>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-slate-500">
                Edition de <strong>{selected.title}</strong> ({selected.slug})
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm text-slate-700">Type</span>
                  <select
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    value={type}
                    onChange={(event) => setType(event.target.value as Entry['type'])}
                  >
                    <option value="project">project</option>
                    <option value="event">event</option>
                    <option value="experience">experience</option>
                    <option value="skill">skill</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-slate-700">Slug</span>
                  <input
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Titre</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Resume court</span>
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
                <span className="text-sm text-slate-700">Stack (comma separated)</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={stack}
                  onChange={(event) => setStack(event.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Impact metrics (une ligne: key | value)</span>
                <textarea
                  rows={4}
                  className="rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
                  value={impactMetricsText}
                  onChange={(event) => setImpactMetricsText(event.target.value)}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Image d entete (URL)</span>
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

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm text-slate-700">Date de debut</span>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    value={startDate || ''}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-slate-700">Date de fin</span>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    value={endDate || ''}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </label>

                <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(event) => setHighlighted(event.target.checked)}
                  />
                  Highlight
                </label>
              </div>

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
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={triggerS3ImagePicker}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Upload image...' : 'Image S3'}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    onClick={addExternalImage}
                  >
                    Image externe + credit
                  </button>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onS3ImagePicked}
                />
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setDetailsHtml((event.target as HTMLDivElement).innerHTML)}
                  className="min-h-[260px] rounded-xl border border-slate-300 px-3 py-2"
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

      {linkModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Inserer un lien</h2>
            <form className="mt-4 grid gap-3" onSubmit={submitLinkModal}>
              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Texte du lien</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  placeholder="Ex: Voir le site"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Lien</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
              {linkError ? <p className="text-sm text-rose-700">{linkError}</p> : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkModalOpen(false)
                    setLinkError('')
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="dark-action rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-50"
                >
                  Inserer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {imageModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Inserer une image externe</h2>
            <form className="mt-4 grid gap-3" onSubmit={submitExternalImageModal}>
              <label className="grid gap-1">
                <span className="text-sm text-slate-700">URL de l image</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={externalImageUrl}
                  onChange={(event) => setExternalImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Texte du credit</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={externalCreditText}
                  onChange={(event) => setExternalCreditText(event.target.value)}
                  placeholder="Ex: Photo by ..."
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-slate-700">Lien du credit</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={externalCreditUrl}
                  onChange={(event) => setExternalCreditUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
              {imageError ? <p className="text-sm text-rose-700">{imageError}</p> : null}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageModalOpen(false)
                    setImageError('')
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="dark-action rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-50"
                >
                  Inserer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

function buildImageFigureHtml(
  imageUrl: string,
  alt: string,
  creditUrl: string,
  creditLabel: string,
  sourceType: 's3' | 'external'
): string {
  return `<figure class="portfolio-media" data-source-type="${escapeHtmlAttr(sourceType)}"><img src="${escapeHtmlAttr(
    imageUrl
  )}" alt="${escapeHtmlAttr(alt)}" /><figcaption class="portfolio-media-credit"><a href="${escapeHtmlAttr(
    creditUrl
  )}" target="_blank" rel="noreferrer">Credit: ${escapeHtmlText(creditLabel)}</a></figcaption></figure>`
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function sanitizeKeySegment(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9/_-]+/g, '-')
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}
