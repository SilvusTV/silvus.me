import type { HttpContext } from '@adonisjs/core/http'
import {
  ensureBaseContent,
  parseBlogSections,
  serializeBlogSections
} from '#services/content_bootstrap_service'
import { sql } from '#services/db_service'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog_post_validator'

type BlogRow = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[] | null
  published_at: string | null
  binance_symbol: string | null
  binance_embed_url: string | null
}

export default class BlogPostsController {
  async index({ response }: HttpContext) {
    try {
      await ensureBaseContent()

      const posts = await sql<BlogRow>(
        `
        select
          id,
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at::text,
          binance_symbol,
          binance_embed_url
        from blog_posts
        order by published_at desc nulls last, created_at desc
        `
      )

      return response.ok({
        data: posts.rows.map((post: BlogRow) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          tags: post.tags || [],
          publishedAt: post.published_at,
          binanceSymbol: post.binance_symbol,
          binanceEmbedUrl: post.binance_embed_url
        }))
      })
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger les articles pour le moment.'
      })
    }
  }

  async show({ response, params }: HttpContext) {
    try {
      await ensureBaseContent()

      const post = await sql<BlogRow>(
        `
        select
          id,
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at::text,
          binance_symbol,
          binance_embed_url
        from blog_posts
        where slug = $1
        limit 1
        `,
        [params.slug]
      )

      const row = post.rows[0]

      if (!row) {
        return response.notFound({ message: 'Article introuvable' })
      }

      return response.ok({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        sections: parseBlogSections(row.content),
        tags: row.tags || [],
        publishedAt: row.published_at,
        binanceSymbol: row.binance_symbol,
        binanceEmbedUrl: row.binance_embed_url,
        contactCtaUrl: `/contact?source=blog&post=${row.slug}&subject=${encodeURIComponent(`A propos: ${row.title}`)}`
      })
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger cet article pour le moment.'
      })
    }
  }

  async adminIndex({ response }: HttpContext) {
    try {
      await ensureBaseContent()

      const posts = await sql<BlogRow>(
        `
        select
          id,
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at::text,
          binance_symbol,
          binance_embed_url
        from blog_posts
        order by published_at desc nulls last, created_at desc
        `
      )

      return response.ok({
        data: posts.rows.map((post: BlogRow) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          sections: parseBlogSections(post.content),
          tags: post.tags || [],
          publishedAt: post.published_at,
          binanceSymbol: post.binance_symbol,
          binanceEmbedUrl: post.binance_embed_url,
        })),
      })
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger les articles admin.',
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createBlogPostValidator)
    const normalizedContent = normalizeContent(payload.content)
    const normalizedTags = payload.tags.filter((tag) => tag.length > 0)
    const publishedAt = payload.publishedAt || new Date().toISOString()

    try {
      const post = await sql<BlogRow>(
        `
        insert into blog_posts (
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at,
          binance_symbol,
          binance_embed_url
        ) values (
          $1,
          $2,
          $3,
          $4,
          $5::jsonb,
          $6,
          $7,
          $8
        )
        returning
          id,
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at::text,
          binance_symbol,
          binance_embed_url
        `,
        [
          payload.title,
          payload.slug,
          payload.excerpt,
          normalizedContent,
          JSON.stringify(normalizedTags),
          publishedAt,
          payload.binanceSymbol || null,
          payload.binanceEmbedUrl || null
        ]
      )

      const row = post.rows[0]

      return response.created({
        data: {
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
          sections: parseBlogSections(row.content),
          tags: row.tags || [],
          publishedAt: row.published_at,
          binanceSymbol: row.binance_symbol,
          binanceEmbedUrl: row.binance_embed_url
        }
      })
    } catch (error: any) {
      if (error?.code === '23505') {
        return response.conflict({ message: 'Un article existe deja avec ce slug.' })
      }

      return response.internalServerError({ message: 'Creation de l article impossible.' })
    }
  }

  async update({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updateBlogPostValidator)
    const updates: string[] = []
    const values: unknown[] = []
    let index = 1

    if (payload.title !== undefined) {
      updates.push(`title = $${index++}`)
      values.push(payload.title)
    }

    if (payload.excerpt !== undefined) {
      updates.push(`excerpt = $${index++}`)
      values.push(payload.excerpt)
    }

    if (payload.content !== undefined) {
      updates.push(`content = $${index++}`)
      values.push(normalizeContent(payload.content))
    }

    if (payload.tags !== undefined) {
      updates.push(`tags = $${index++}::jsonb`)
      values.push(JSON.stringify(payload.tags.filter((tag) => tag.length > 0)))
    }

    if (payload.publishedAt !== undefined) {
      updates.push(`published_at = $${index++}`)
      values.push(payload.publishedAt)
    }

    if (payload.binanceSymbol !== undefined) {
      updates.push(`binance_symbol = $${index++}`)
      values.push(payload.binanceSymbol || null)
    }

    if (payload.binanceEmbedUrl !== undefined) {
      updates.push(`binance_embed_url = $${index++}`)
      values.push(payload.binanceEmbedUrl || null)
    }

    if (updates.length === 0) {
      return response.badRequest({ message: 'Aucune modification a appliquer.' })
    }

    values.push(Number(params.id))

    try {
      const post = await sql<BlogRow>(
        `
        update blog_posts
        set ${updates.join(', ')}, updated_at = now()
        where id = $${index}
        returning
          id,
          title,
          slug,
          excerpt,
          content,
          tags,
          published_at::text,
          binance_symbol,
          binance_embed_url
        `,
        values
      )

      const row = post.rows[0]

      if (!row) {
        return response.notFound({ message: 'Article introuvable' })
      }

      return response.ok({
        data: {
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
          sections: parseBlogSections(row.content),
          tags: row.tags || [],
          publishedAt: row.published_at,
          binanceSymbol: row.binance_symbol,
          binanceEmbedUrl: row.binance_embed_url
        }
      })
    } catch {
      return response.internalServerError({ message: 'Mise a jour impossible.' })
    }
  }

  async destroy({ response, params }: HttpContext) {
    try {
      const result = await sql<{ id: number }>(
        `
        delete from blog_posts
        where id = $1
        returning id
        `,
        [Number(params.id)]
      )

      if (!result.rows[0]) {
        return response.notFound({ message: 'Article introuvable' })
      }

      return response.ok({ deleted: true })
    } catch {
      return response.internalServerError({ message: 'Suppression impossible.' })
    }
  }
}

function normalizeContent(content: string): string {
  const trimmed = content.trim()

  try {
    const parsed = JSON.parse(trimmed) as Partial<{
      context: string
      what: string
      how: string
      why: string
      result: string
    }>

    if (
      typeof parsed.context === 'string' &&
      typeof parsed.what === 'string' &&
      typeof parsed.how === 'string' &&
      typeof parsed.why === 'string' &&
      typeof parsed.result === 'string'
    ) {
      return serializeBlogSections({
        context: parsed.context,
        what: parsed.what,
        how: parsed.how,
        why: parsed.why,
        result: parsed.result
      })
    }
  } catch {
    // Plain text fallback
  }

  return serializeBlogSections({
    context: '',
    what: '',
    how: '',
    why: '',
    result: trimmed
  })
}
