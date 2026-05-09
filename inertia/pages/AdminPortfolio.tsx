import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type ChangeEvent,
  type ComponentType,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  Bold,
  Code2,
  Eraser,
  FolderOpen,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Upload,
} from 'lucide-react'
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

type S3File = {
  key: string
  size: number
  etag: string
  lastModified: string | null
  url: string
}

type S3NodesResponse = {
  prefix: string
  folders: Array<{ key: string; name: string }>
  files: S3File[]
}

type ToolbarButtonProps = {
  label: string
  icon: ComponentType<{ className?: string }>
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
  onClick: () => void
  disabled?: boolean
  iconClassName?: string
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
  const [s3LibraryOpen, setS3LibraryOpen] = useState(false)
  const [s3LibraryPrefix, setS3LibraryPrefix] = useState('portfolio/')
  const [s3LibraryFiles, setS3LibraryFiles] = useState<S3File[]>([])
  const [s3LibraryLoading, setS3LibraryLoading] = useState(false)
  const [s3LibraryError, setS3LibraryError] = useState('')
  const [cleanupRemovedS3Images, setCleanupRemovedS3Images] = useState(true)

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

    const nextDetailsHtml = selected.detailsHtml || ''

    setType(selected.type)
    setSlug(selected.slug || '')
    setTitle(selected.title || '')
    setSummary(selected.summary || '')
    setContext(selected.context || '')
    setStack(selected.stack.join(', '))
    setImpactMetricsText(metricsToText(selected.impactMetrics || {}))
    setCoverImageUrl(selected.coverImageUrl || '')
    setLinksText(linksToText(selected.externalLinks || []))
    setDetailsHtml(nextDetailsHtml)
    setStartDate(selected.startDate || '')
    setEndDate(selected.endDate || '')
    setHighlighted(Boolean(selected.highlighted))
    if (editorRef.current) {
      editorRef.current.innerHTML = nextDetailsHtml
    }
    savedSelectionRef.current = null
  }, [selected])

  function preventToolbarMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    captureEditorSelection()
  }

  async function loadS3Library(prefix: string) {
    const normalizedPrefix = normalizePrefix(prefix)
    setS3LibraryPrefix(normalizedPrefix)
    setS3LibraryLoading(true)
    setS3LibraryError('')

    try {
      const payload = await apiGet<S3NodesResponse>(
        `/api/admin/s3/objects?prefix=${encodeURIComponent(normalizedPrefix)}`
      )
      setS3LibraryFiles(payload.files.filter((file) => isImageFile(file.key)))
    } catch {
      setS3LibraryError('Impossible de charger les images S3.')
    } finally {
      setS3LibraryLoading(false)
    }
  }

  function openS3Library() {
    if (!selected) return
    captureEditorSelection()
    setS3LibraryOpen(true)
    void loadS3Library(`portfolio/${sanitizeKeySegment(slug || selected.slug)}`)
  }

  function insertExistingS3Image(file: S3File) {
    const alt = window.prompt('Texte alternatif (alt)') || file.key.split('/').pop() || 'image'
    const creditUrl = file.url
    const creditLabel = `S3 / ${file.key}`
    insertHtml(buildImageFigureHtml(file.url, alt, creditUrl, creditLabel, 's3'))
    setStatus('Image S3 inseree depuis la bibliotheque.')
    setS3LibraryOpen(false)
    setS3LibraryError('')
  }

  function refreshS3Library() {
    void loadS3Library(s3LibraryPrefix)
  }

  function runCommand(command: string, value?: string) {
    if (!editorRef.current) return
    restoreEditorSelection()
    editorRef.current.focus()
    document.execCommand(command, false, value)
    setDetailsHtml(editorRef.current.innerHTML)
    captureEditorSelection()
  }

  function insertHorizontalRule() {
    insertHtml('<hr />')
  }

  function clearFormatting() {
    runCommand('removeFormat')
    runCommand('unlink')
  }

  function setParagraphFormat(tagName: 'p' | 'h2' | 'h3' | 'blockquote' | 'pre') {
    runCommand('formatBlock', `<${tagName}>`)
  }

  function updateDetailsHtml() {
    if (!editorRef.current) return
    setDetailsHtml(editorRef.current.innerHTML)
    captureEditorSelection()
  }

  function focusEditor() {
    if (!editorRef.current) return
    editorRef.current.focus()
    captureEditorSelection()
  }

  function onEditorPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateDetailsHtml()
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return
    event.preventDefault()
    document.execCommand('insertHTML', false, '&emsp;')
    updateDetailsHtml()
  }

  function onEditorDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
  }

  function onEditorDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
  }

  function onEditorMouseUp() {
    captureEditorSelection()
  }

  function onEditorKeyUp() {
    captureEditorSelection()
  }

  function onEditorBlur() {
    if (!editorRef.current) return
    setDetailsHtml(editorRef.current.innerHTML)
  }

  function onEditorInput(event: FormEvent<HTMLDivElement>) {
    setDetailsHtml((event.target as HTMLDivElement).innerHTML)
  }

  function onS3LibraryPrefixChange(value: string) {
    setS3LibraryPrefix(value)
  }

  function closeS3Library() {
    setS3LibraryOpen(false)
    setS3LibraryError('')
    focusEditor()
  }

  function onS3LibrarySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    refreshS3Library()
  }

  function onCleanupRemovedS3ImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setCleanupRemovedS3Images(event.target.checked)
  }

  function formatS3FileDate(value: string | null): string {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('fr-FR')
  }

  function formatS3FileSize(size: number): string {
    if (!Number.isFinite(size) || size <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let current = size
    let index = 0
    while (current >= 1024 && index < units.length - 1) {
      current /= 1024
      index += 1
    }
    return `${current.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
  }

  function isImageFile(key: string): boolean {
    return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(key)
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
    const currentDetailsHtml = editorRef.current?.innerHTML || detailsHtml

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
        detailsHtml: currentDetailsHtml,
        externalLinks: textToLinks(linksText),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        highlighted,
        cleanupRemovedS3Images,
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
            <p className="text-sm text-slate-600">Sélectionne une fiche pour l'éditer.</p>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-slate-500">
                Édition de <strong>{selected.title}</strong> ({selected.slug})
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
                <span className="text-sm text-slate-700">Image de couverture (URL)</span>
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
                  <span className="text-sm text-slate-700">Date de début</span>
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
                <div className="grid gap-2 rounded-xl border border-slate-300 bg-slate-50 p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                      <ToolbarButton
                        label="Gras"
                        icon={Bold}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('bold')}
                      />
                      <ToolbarButton
                        label="Italique"
                        icon={Italic}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('italic')}
                      />
                      <ToolbarButton
                        label="Souligne"
                        icon={Underline}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('underline')}
                      />
                      <ToolbarButton
                        label="Lien"
                        icon={Link2}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={addLink}
                      />
                      <ToolbarButton
                        label="Nettoyer format"
                        icon={Eraser}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={clearFormatting}
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                      <ToolbarButton
                        label="Liste a puces"
                        icon={List}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('insertUnorderedList')}
                      />
                      <ToolbarButton
                        label="Liste numerotee"
                        icon={ListOrdered}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('insertOrderedList')}
                      />
                      <ToolbarButton
                        label="Titre H2"
                        icon={Heading2}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => setParagraphFormat('h2')}
                      />
                      <ToolbarButton
                        label="Titre H3"
                        icon={Heading3}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => setParagraphFormat('h3')}
                      />
                      <ToolbarButton
                        label="Paragraphe"
                        icon={Pilcrow}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => setParagraphFormat('p')}
                      />
                      <ToolbarButton
                        label="Citation"
                        icon={Quote}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => setParagraphFormat('blockquote')}
                      />
                      <ToolbarButton
                        label="Bloc code"
                        icon={Code2}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => setParagraphFormat('pre')}
                      />
                      <ToolbarButton
                        label="Separateur horizontal"
                        icon={Minus}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={insertHorizontalRule}
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                      <ToolbarButton
                        label="Annuler"
                        icon={Undo2}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('undo')}
                      />
                      <ToolbarButton
                        label="Retablir"
                        icon={Redo2}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={() => runCommand('redo')}
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                      <ToolbarButton
                        label={uploadingImage ? 'Upload S3 en cours' : 'Uploader une image sur S3'}
                        icon={uploadingImage ? LoaderCircle : Upload}
                        iconClassName={uploadingImage ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={triggerS3ImagePicker}
                        disabled={uploadingImage}
                      />
                      <ToolbarButton
                        label="Bibliotheque d images S3"
                        icon={FolderOpen}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={openS3Library}
                      />
                      <ToolbarButton
                        label="Inserer image externe avec credit"
                        icon={ImagePlus}
                        onMouseDown={preventToolbarMouseDown}
                        onClick={addExternalImage}
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={cleanupRemovedS3Images}
                    onChange={onCleanupRemovedS3ImagesChange}
                  />
                  Supprimer automatiquement les images S3 retirees du contenu
                </label>
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
                  onFocus={focusEditor}
                  onInput={onEditorInput}
                  onBlur={onEditorBlur}
                  onKeyUp={onEditorKeyUp}
                  onMouseUp={onEditorMouseUp}
                  onPaste={onEditorPaste}
                  onKeyDown={onEditorKeyDown}
                  onDrop={onEditorDrop}
                  onDragOver={onEditorDragOver}
                  className="min-h-[320px] rounded-xl border border-slate-300 px-3 py-2"
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

      {s3LibraryOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Bibliotheque S3</h2>
            <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={onS3LibrarySubmit}>
              <label className="grid min-w-[280px] flex-1 gap-1">
                <span className="text-sm text-slate-700">Prefixe</span>
                <input
                  className="rounded-xl border border-slate-300 px-3 py-2"
                  value={s3LibraryPrefix}
                  onChange={(event) => onS3LibraryPrefixChange(event.target.value)}
                  placeholder="portfolio/mon-projet/"
                  disabled={s3LibraryLoading}
                />
              </label>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                disabled={s3LibraryLoading}
              >
                Recharger
              </button>
              <button
                type="button"
                onClick={closeS3Library}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Fermer
              </button>
            </form>

            {s3LibraryLoading ? (
              <p className="mt-3 text-sm text-slate-600">Chargement des images S3...</p>
            ) : null}
            {s3LibraryError ? <p className="mt-3 text-sm text-rose-700">{s3LibraryError}</p> : null}
            {!s3LibraryLoading && s3LibraryFiles.length === 0 && !s3LibraryError ? (
              <p className="mt-3 text-sm text-slate-600">Aucune image trouvee.</p>
            ) : null}

            {s3LibraryFiles.length > 0 ? (
              <div className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-700">Image</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-700">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-700">Taille</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {s3LibraryFiles.map((file) => (
                      <tr key={file.key} className="align-middle">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={file.url}
                              alt={file.key.split('/').pop() || file.key}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-slate-900">{file.key}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{formatS3FileDate(file.lastModified)}</td>
                        <td className="px-3 py-2 text-slate-600">{formatS3FileSize(file.size)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                            onClick={() => insertExistingS3Image(file)}
                          >
                            Inserer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

function ToolbarButton({
  label,
  icon: Icon,
  onMouseDown,
  onClick,
  disabled,
  iconClassName,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={iconClassName || 'h-4 w-4'} />
    </button>
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

function normalizePrefix(prefix: string): string {
  const normalized = prefix.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!normalized) {
    return ''
  }
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}
