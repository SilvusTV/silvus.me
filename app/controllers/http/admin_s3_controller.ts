import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import { buildStorageKey, deleteFromS3, listS3Nodes, uploadToS3 } from '#services/s3_service'

export default class AdminS3Controller {
  async index({ request, response }: HttpContext) {
    const prefix = String(request.qs().prefix || '')

    try {
      const nodes = await listS3Nodes(prefix)
      return response.ok(nodes)
    } catch {
      return response.internalServerError({ message: 'Impossible de charger les objets S3.' })
    }
  }

  async upload({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '200mb',
    })

    if (!file) {
      return response.badRequest({ message: 'Aucun fichier recu.' })
    }

    if (!file.isValid) {
      return response.unprocessableEntity({
        message: file.errors[0]?.message || 'Le fichier est invalide.',
      })
    }

    if (!file.tmpPath) {
      return response.badRequest({ message: 'Upload multipart invalide.' })
    }

    const targetPrefix = request.input('prefix') ? String(request.input('prefix')) : undefined
    const fileName = request.input('fileName') ? String(request.input('fileName')) : file.clientName
    const objectKey = buildStorageKey(targetPrefix, fileName)

    try {
      const buffer = await readFile(file.tmpPath)
      const contentType = file.type && file.subtype ? `${file.type}/${file.subtype}` : undefined
      const uploaded = await uploadToS3(objectKey, buffer, contentType)

      return response.created({
        data: {
          ...uploaded,
          size: file.size,
        },
      })
    } catch {
      return response.internalServerError({ message: 'Upload vers S3 impossible.' })
    }
  }

  async destroy({ request, response }: HttpContext) {
    const key = request.input('key')
    if (typeof key !== 'string' || key.trim().length === 0) {
      return response.badRequest({ message: 'La cle S3 est obligatoire.' })
    }

    try {
      await deleteFromS3(key)
      return response.ok({ deleted: true })
    } catch {
      return response.internalServerError({ message: 'Suppression S3 impossible.' })
    }
  }
}
