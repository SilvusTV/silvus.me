import type { HttpContext } from '@adonisjs/core/http'
import { ensureBaseContent } from '#services/content_bootstrap_service'
import { sql } from '#services/db_service'
import { updatePortfolioEntryValidator } from '#validators/portfolio_entry_validator'

const journey = {
  educationSummary: {
    school: 'ESGI Aix-en-Provence',
    currentLevel: 'Master 1',
    specialization: 'Architecture Logicielle',
    yearsCompleted: 4
  },
  education: [
    {
      period: '2025 - aujourd’hui',
      school: 'ESGI Aix-en-Provence',
      program: 'Master Architecture Logicielle',
      level: 'M1',
      details: '4e année post-bac, orientation architecture logicielle et fiabilité.'
    },
    {
      period: '2024 - 2025',
      school: 'ESGI Paris',
      program: 'Bachelor Ingénierie du Web',
      level: 'B3',
      details: 'Consolidation fullstack, produit, qualité de livraison.'
    },
    {
      period: '2022 - 2024',
      school: 'ESGI Aix-en-Provence',
      program: 'Tronc commun informatique',
      level: 'B1-B2',
      details: 'Cycle tronc commun sur deux ans: fondamentaux du développement, réseau, systèmes, méthodologie projet et bases d’architecture.'
    }
  ],
  work: [
    {
      period: 'Depuis septembre 2025',
      company: 'All In Broadcast',
      companyUrl: 'https://allinbroadcast.com',
      role: 'Alternant développeur',
      summary:
        'Développement des outils internes et externes utilisés en production, pour les besoins de la boîte et des clients.'
    },
    {
      period: 'avril 2023 - août 2025',
      company: 'Kamaé',
      companyUrl: 'https://kamae.fr',
      role: 'Alternant Product Engineer',
      summary:
        'Alternance orientée intégrité du produit, production de contenu et stabilité de l’écosystème.'
    },
    {
      period: 'septembre 2022 - mars 2023',
      company: 'Websource',
      companyUrl: 'https://www.websource.fr/',
      role: 'Alternant chef de projet web',
      summary:
        'Expérience en agence web sur le pilotage de projets, la coordination et la livraison de solutions digitales pour les clients.'
    }
  ],
  freelance: {
    period: 'Depuis avril 2022',
    title: 'Freelance',
    summary:
      'J’accompagne des créateurs et des structures sur la mise en place d’environnements de stream, la fiabilisation des diffusions live et le développement d’outils sur mesure pour les besoins de production.'
  }
}

export default class PortfolioController {
  async index({ response }: HttpContext) {
    try {
      await ensureBaseContent()

      const result = await sql<PortfolioRow>(
        `
        select
          id,
          type,
          slug,
          title,
          summary,
          context,
          stack,
          impact_metrics,
          cover_image_url,
          details_html,
          external_links,
          start_date::text,
          end_date::text,
          highlighted
        from portfolio_entries
        order by highlighted desc, sort_order asc, start_date desc nulls last
        `
      )

      return response.ok({
        entries: result.rows.map(mapPortfolioRow)
      })
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger le portfolio pour le moment.'
      })
    }
  }

  async show({ response, params }: HttpContext) {
    try {
      await ensureBaseContent()

      const result = await sql<PortfolioRow>(
        `
        select
          id,
          type,
          slug,
          title,
          summary,
          context,
          stack,
          impact_metrics,
          cover_image_url,
          details_html,
          external_links,
          start_date::text,
          end_date::text,
          highlighted
        from portfolio_entries
        where slug = $1
        limit 1
        `,
        [params.slug]
      )

      const row = result.rows[0]

      if (!row) {
        return response.notFound({ message: 'Projet introuvable' })
      }

      return response.ok(mapPortfolioRow(row))
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger cette fiche portfolio pour le moment.'
      })
    }
  }

  async adminIndex({ response }: HttpContext) {
    try {
      const result = await sql<PortfolioRow>(
        `
        select
          id,
          type,
          slug,
          title,
          summary,
          context,
          stack,
          impact_metrics,
          cover_image_url,
          details_html,
          external_links,
          start_date::text,
          end_date::text,
          highlighted
        from portfolio_entries
        order by sort_order asc, title asc
        `
      )

      return response.ok({ entries: result.rows.map(mapPortfolioRow) })
    } catch {
      return response.internalServerError({
        message: 'Impossible de charger les fiches portfolio admin.'
      })
    }
  }

  async adminUpdate({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updatePortfolioEntryValidator)

    const updates: string[] = []
    const values: unknown[] = []
    let index = 1

    if (payload.type !== undefined) {
      updates.push(`type = $${index++}`)
      values.push(payload.type)
    }

    if (payload.slug !== undefined) {
      updates.push(`slug = $${index++}`)
      values.push(slugify(payload.slug))
    }

    if (payload.title !== undefined) {
      updates.push(`title = $${index++}`)
      values.push(payload.title)
    }

    if (payload.summary !== undefined) {
      updates.push(`summary = $${index++}`)
      values.push(payload.summary)
    }

    if (payload.context !== undefined) {
      updates.push(`context = $${index++}`)
      values.push(payload.context || null)
    }

    if (payload.stack !== undefined) {
      updates.push(`stack = $${index++}::jsonb`)
      values.push(JSON.stringify(payload.stack))
    }

    if (payload.impactMetrics !== undefined) {
      updates.push(`impact_metrics = $${index++}::jsonb`)
      values.push(JSON.stringify(payload.impactMetrics))
    }

    if (payload.coverImageUrl !== undefined) {
      updates.push(`cover_image_url = $${index++}`)
      values.push(payload.coverImageUrl || null)
    }

    if (payload.detailsHtml !== undefined) {
      updates.push(`details_html = $${index++}`)
      values.push(normalizeRichHtml(payload.detailsHtml))
    }

    if (payload.externalLinks !== undefined) {
      updates.push(`external_links = $${index++}::jsonb`)
      values.push(JSON.stringify(payload.externalLinks))
    }

    if (payload.startDate !== undefined) {
      updates.push(`start_date = $${index++}`)
      values.push(payload.startDate || null)
    }

    if (payload.endDate !== undefined) {
      updates.push(`end_date = $${index++}`)
      values.push(payload.endDate || null)
    }

    if (payload.highlighted !== undefined) {
      updates.push(`highlighted = $${index++}`)
      values.push(payload.highlighted)
    }

    if (updates.length === 0) {
      return response.badRequest({ message: 'Aucune modification a appliquer.' })
    }

    values.push(Number(params.id))

    try {
      const result = await sql<PortfolioRow>(
        `
        update portfolio_entries
        set ${updates.join(', ')}, updated_at = now()
        where id = $${index}
        returning
          id,
          type,
          slug,
          title,
          summary,
          context,
          stack,
          impact_metrics,
          cover_image_url,
          details_html,
          external_links,
          start_date::text,
          end_date::text,
          highlighted
        `,
        values
      )

      const row = result.rows[0]

      if (!row) {
        return response.notFound({ message: 'Fiche portfolio introuvable' })
      }

      return response.ok({ entry: mapPortfolioRow(row) })
    } catch (error: any) {
      if (error?.code === '23505') {
        return response.conflict({ message: 'Slug ou titre deja utilise.' })
      }

      return response.internalServerError({ message: 'Mise a jour portfolio impossible.' })
    }
  }

  journey({ response }: HttpContext) {
    return response.ok(journey)
  }
}

type PortfolioRow = {
  id: number
  type: 'project' | 'event' | 'experience' | 'skill'
  slug: string
  title: string
  summary: string
  context: string | null
  stack: string[] | null
  impact_metrics: Record<string, string> | null
  cover_image_url: string | null
  details_html: string | null
  external_links: { label: string; url: string }[] | null
  start_date: string | null
  end_date: string | null
  highlighted: boolean
}

function mapPortfolioRow(row: PortfolioRow) {
  const fallback = `${row.summary}${row.context ? `\n\n${row.context}` : ''}`

  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    context: row.context,
    stack: row.stack || [],
    impactMetrics: row.impact_metrics || {},
    coverImageUrl: row.cover_image_url,
    detailsHtml: normalizeRichHtml(row.details_html || fallback),
    externalLinks: row.external_links || [],
    startDate: row.start_date,
    endDate: row.end_date,
    highlighted: row.highlighted,
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeRichHtml(html: string): string {
  const withoutScript = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  return withoutScript
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\son\w+=\S+/gi, '')
}

function normalizeRichHtml(value: string): string {
  const input = normalizeLineBreaks(value).trim()

  if (!input) {
    return ''
  }

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(input)
  const html = hasHtmlTags ? replaceMarkdownLinks(input) : markdownLiteToHtml(input)

  return sanitizeRichHtml(html)
}

function markdownLiteToHtml(markdown: string): string {
  const escaped = escapeHtml(markdown)
  const withLinks = replaceMarkdownLinks(escaped)

  return withLinks
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function replaceMarkdownLinks(value: string): string {
  return value.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/\\n/g, '\n')
}
