import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { AdminShell } from '../components/AdminShell'
import { apiGet, apiSend, apiSendForm } from '../lib/api'

type S3Folder = {
  key: string
  name: string
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
  folders: S3Folder[]
  files: S3File[]
}

type ExplorerFolderItem = {
  kind: 'folder'
  key: string
  name: string
}

type ExplorerFileItem = {
  kind: 'file'
  key: string
  name: string
  size: number
  lastModified: string | null
  url: string
}

type ExplorerItem = ExplorerFolderItem | ExplorerFileItem

const KNOWN_ROOT_FOLDERS: S3Folder[] = [
  { key: 'static/', name: 'static' },
  { key: 'projects/', name: 'projects' },
  { key: 'blogs/', name: 'blogs' },
]

export default function AdminS3() {
  const [currentPrefix, setCurrentPrefix] = useState('')
  const [uploadPrefix, setUploadPrefix] = useState('')
  const [folders, setFolders] = useState<S3Folder[]>([])
  const [files, setFiles] = useState<S3File[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  async function loadNodes(targetPrefix = currentPrefix) {
    setLoading(true)
    setStatus('')

    try {
      const normalized = normalizePrefix(targetPrefix)
      const payload = await apiGet<S3NodesResponse>(
        `/api/admin/s3/objects?prefix=${encodeURIComponent(normalized)}`
      )

      setCurrentPrefix(payload.prefix)
      setFolders(payload.folders)
      setFiles(payload.files)
    } catch {
      setStatus('Impossible de charger les objets S3.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNodes('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const input = formElement.elements.namedItem('file') as HTMLInputElement | null
    const file = input?.files?.[0]

    if (!file) {
      setStatus('Choisis un fichier a uploader.')
      return
    }

    setUploading(true)
    setStatus('')

    try {
      const body = new FormData()
      body.set('file', file)

      const targetPrefix = normalizePrefix(uploadPrefix.trim() || currentPrefix)
      if (targetPrefix) {
        body.set('prefix', targetPrefix)
      }

      await apiSendForm<{ data: S3File }>('/api/admin/s3/upload', 'POST', body)
      formElement.reset()
      setStatus('Upload termine.')
      await loadNodes(currentPrefix)
    } catch {
      setStatus('Upload impossible.')
    } finally {
      setUploading(false)
    }
  }

  async function deleteObject(key: string) {
    if (!window.confirm(`Supprimer ${key} ?`)) {
      return
    }

    setStatus('')

    try {
      await apiSend<{ deleted: boolean }>('/api/admin/s3/delete', 'POST', { key })
      setFiles((previous) => previous.filter((item) => item.key !== key))
    } catch {
      setStatus('Suppression impossible.')
    }
  }

  async function copyFileUrl(url: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const area = document.createElement('textarea')
        area.value = url
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
      }

      setStatus('URL S3 copiee dans le presse-papiers.')
    } catch {
      setStatus('Impossible de copier l URL S3.')
    }
  }

  function openFile(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function navigateTo(prefix: string) {
    loadNodes(prefix)
  }

  const breadcrumbs = buildBreadcrumbs(currentPrefix)
  const visibleFolders = currentPrefix ? folders : mergeKnownRootFolders(folders)
  const items = buildExplorerItems(visibleFolders, files, currentPrefix)

  return (
    <AdminShell>
      <h1 className="mb-4 text-3xl font-semibold text-slate-900">Admin S3 / MinIO</h1>

      <section className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={submitUpload}>
          <input className="rounded-xl border border-slate-300 px-3 py-2" type="file" name="file" required />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder={currentPrefix ? `Dossier cible (defaut: ${currentPrefix})` : 'Dossier cible (optionnel)'}
            value={uploadPrefix}
            onChange={(event) => setUploadPrefix(event.target.value)}
          />
          <button
            type="submit"
            disabled={uploading}
            className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60"
          >
            {uploading ? 'Upload...' : 'Uploader'}
          </button>
        </form>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigateTo('')}
            className={[
              'rounded-full px-3 py-1.5 transition',
              currentPrefix === ''
                ? 'dark-action bg-slate-900 text-slate-50'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100',
            ].join(' ')}
          >
            Racine
          </button>

          {breadcrumbs.map((crumb) => (
            <Fragment key={crumb.prefix}>
              <span className="text-slate-400">/</span>
              <button
                type="button"
                onClick={() => navigateTo(crumb.prefix)}
                className={[
                  'rounded-full px-3 py-1.5 transition',
                  currentPrefix === crumb.prefix
                    ? 'dark-action bg-slate-900 text-slate-50'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                {crumb.label}
              </button>
            </Fragment>
          ))}

          <button
            type="button"
            className="ml-auto rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
            onClick={() => loadNodes(currentPrefix)}
          >
            Recharger
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm">
        {loading ? (
          <p className="p-4 text-sm text-slate-600">Chargement des objets...</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">Aucun dossier ni fichier dans cet emplacement.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 px-4 py-3">
                {item.kind === 'folder' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.key)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-100"
                    >
                      <FolderIcon />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{item.name}/</p>
                        <p className="text-xs text-slate-500">Dossier</p>
                      </div>
                    </button>
                    <div className="w-[76px]" />
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openFile(item.url)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-100"
                    >
                      <FileIcon />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatBytes(item.size)}
                          {item.lastModified
                            ? ` - ${new Date(item.lastModified).toLocaleString('fr-FR')}`
                            : ''}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyFileUrl(item.url)}
                      aria-label="Copier l URL S3"
                      title="Copier l URL S3"
                      className="rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
                    >
                      <CopyIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteObject(item.key)}
                      aria-label="Supprimer"
                      title="Supprimer"
                      className="rounded-full border border-rose-300 p-2 text-rose-700 hover:bg-rose-50"
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </AdminShell>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function normalizePrefix(prefix: string): string {
  const normalized = prefix
    .replace(/\\/g, '/')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\.\./g, '')

  if (!normalized) {
    return ''
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function mergeKnownRootFolders(folders: S3Folder[]): S3Folder[] {
  const map = new Map<string, S3Folder>()

  for (const folder of KNOWN_ROOT_FOLDERS) {
    map.set(folder.key, folder)
  }

  for (const folder of folders) {
    map.set(folder.key, folder)
  }

  return [...map.values()].sort((left, right) => left.name.localeCompare(right.name))
}

function buildBreadcrumbs(prefix: string): Array<{ label: string; prefix: string }> {
  const trimmed = prefix.replace(/\/+$/, '')
  if (!trimmed) {
    return []
  }

  const segments = trimmed.split('/')
  return segments.map((segment, index) => ({
    label: segment,
    prefix: `${segments.slice(0, index + 1).join('/')}/`,
  }))
}

function buildExplorerItems(
  folders: S3Folder[],
  files: S3File[],
  currentPrefix: string
): ExplorerItem[] {
  const folderItems: ExplorerFolderItem[] = folders
    .map((folder) => ({
      kind: 'folder',
      key: folder.key,
      name: folder.name,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

  const fileItems: ExplorerFileItem[] = files
    .map((file) => ({
      kind: 'file',
      key: file.key,
      name: formatRelativeKey(file.key, currentPrefix),
      size: file.size,
      lastModified: file.lastModified,
      url: file.url,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

  return [...folderItems, ...fileItems]
}

function formatRelativeKey(key: string, prefix: string): string {
  if (prefix && key.startsWith(prefix)) {
    return key.slice(prefix.length)
  }

  return key
}

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-amber-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-sky-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M7 3.5h7l4 4v13A1.5 1.5 0 0 1 16.5 22h-9A1.5 1.5 0 0 1 6 20.5v-15A2 2 0 0 1 8 3.5Z" />
      <path d="M14 3.5V8h4" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M5 15V7a2 2 0 0 1 2-2h8" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M7.5 7l.8 11.2A2 2 0 0 0 10.3 20h3.4a2 2 0 0 0 2-1.8L16.5 7" />
      <path d="M10 11.5v5" />
      <path d="M14 11.5v5" />
    </svg>
  )
}
