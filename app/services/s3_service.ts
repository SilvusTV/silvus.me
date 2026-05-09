import env from '#start/env'
import { Client } from 'minio'

type MinioObject =
  | {
      etag: string
      lastModified: Date
      name: string
      size: number
      prefix?: never
    }
  | {
      prefix: string
      etag?: never
      lastModified?: never
      name?: never
      size: 0
    }

type S3File = {
  key: string
  size: number
  etag: string
  lastModified: string | null
  url: string
}

type S3Folder = {
  key: string
  name: string
}

const client = new Client({
  endPoint: env.get('S3_ENDPOINT'),
  port: env.get('S3_PORT'),
  useSSL: env.get('S3_USE_SSL'),
  accessKey: env.get('S3_ACCESS_KEY'),
  secretKey: env.get('S3_SECRET_KEY'),
  region: env.get('S3_REGION'),
})

let ensureBucketPromise: Promise<void> | null = null

export async function listS3Nodes(prefix = ''): Promise<{
  prefix: string
  folders: S3Folder[]
  files: S3File[]
}> {
  await ensureBucket()

  const normalizedPrefix = normalizePrefix(prefix)

  return new Promise((resolve, reject) => {
    const folders: S3Folder[] = []
    const files: S3File[] = []
    const stream = client.listObjectsV2(env.get('S3_BUCKET'), normalizedPrefix, false)

    stream.on('data', (item: MinioObject) => {
      if ('prefix' in item && item.prefix) {
        const key = normalizePrefix(item.prefix)
        folders.push({
          key,
          name: getFolderName(key),
        })
        return
      }

      if (!item.name || item.name.endsWith('/.keep')) {
        return
      }

      files.push({
        key: item.name,
        size: item.size || 0,
        etag: item.etag || '',
        lastModified: item.lastModified ? item.lastModified.toISOString() : null,
        url: buildObjectUrl(item.name),
      })
    })
    stream.on('error', reject)
    stream.on('end', () => {
      const uniqueFolders = dedupeFolders(folders).sort((left, right) => left.name.localeCompare(right.name))
      const sortedFiles = files.sort(
          (left, right) =>
            new Date(right.lastModified || 0).getTime() - new Date(left.lastModified || 0).getTime()
      )

      resolve({
        prefix: normalizedPrefix,
        folders: uniqueFolders,
        files: sortedFiles,
      })
    })
  })
}

export async function uploadToS3(objectKey: string, buffer: Buffer, contentType?: string) {
  await ensureBucket()

  const key = sanitizeObjectKey(objectKey)
  await client.putObject(
    env.get('S3_BUCKET'),
    key,
    buffer,
    buffer.length,
    {
      'Content-Type': contentType || 'application/octet-stream',
    }
  )

  return {
    key,
    url: buildObjectUrl(key),
  }
}

export async function deleteFromS3(objectKey: string) {
  await ensureBucket()
  await client.removeObject(env.get('S3_BUCKET'), sanitizeObjectKey(objectKey))
}

export function extractS3ObjectKeyFromUrl(url: string): string | null {
  const value = url.trim()
  if (!value) {
    return null
  }

  try {
    const objectUrl = new URL(value)
    const publicBase = new URL(env.get('S3_PUBLIC_URL'))
    const bucketPrefix = `/${env.get('S3_BUCKET')}/`

    if (objectUrl.origin !== publicBase.origin) {
      return null
    }

    if (!objectUrl.pathname.startsWith(bucketPrefix)) {
      return null
    }

    const encodedKey = objectUrl.pathname.slice(bucketPrefix.length)
    if (!encodedKey) {
      return null
    }

    return sanitizeObjectKey(decodePath(encodedKey))
  } catch {
    return null
  }
}

export function buildStorageKey(prefix: string | undefined, fileName: string): string {
  const cleanPrefix = sanitizeObjectKey(prefix || '').replace(/\/+$/, '')
  const cleanName = sanitizeObjectKey(fileName)
  return cleanPrefix ? `${cleanPrefix}/${cleanName}` : cleanName
}

function buildObjectUrl(key: string): string {
  const base = env.get('S3_PUBLIC_URL').replace(/\/+$/, '')
  return `${base}/${env.get('S3_BUCKET')}/${encodePath(key)}`
}

function ensureBucket() {
  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      const bucket = env.get('S3_BUCKET')
      const exists = await client.bucketExists(bucket)
      if (!exists) {
        await client.makeBucket(bucket, env.get('S3_REGION'))
      }

      await ensureDefaultPrefixes(bucket)
    })()
  }

  return ensureBucketPromise
}

async function ensureDefaultPrefixes(bucket: string) {
  const placeholder = Buffer.alloc(0)
  await client.putObject(bucket, 'static/.keep', placeholder, placeholder.length, {
    'Content-Type': 'application/octet-stream',
  })
}

function sanitizeObjectKey(key: string): string {
  return key
    .replace(/\\/g, '/')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\.\./g, '')
}

function normalizePrefix(prefix: string): string {
  const normalized = sanitizeObjectKey(prefix)
  if (!normalized) {
    return ''
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function getFolderName(folderKey: string): string {
  const clean = folderKey.replace(/\/+$/, '')
  const parts = clean.split('/')
  return parts[parts.length - 1] || clean
}

function dedupeFolders(folders: S3Folder[]): S3Folder[] {
  const map = new Map<string, S3Folder>()

  for (const folder of folders) {
    map.set(folder.key, folder)
  }

  return [...map.values()]
}

function encodePath(value: string): string {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function decodePath(value: string): string {
  return value
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
    .join('/')
}
