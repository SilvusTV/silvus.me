import type { HttpContext } from '@adonisjs/core/http'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog_post_validator'

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Binance: intégrer un bloc marché sans polluer la lecture',
    slug: 'binance-integrer-un-bloc-marche',
    excerpt: 'Retour d’expérience sur une intégration utile et lisible.',
    content: 'Contexte -> implémentation -> résultats. Le bloc reste secondaire et actionnable.',
    tags: ['binance', 'ux', 'integration'],
    publishedAt: '2026-04-01T08:00:00.000Z',
    binanceSymbol: 'BTCUSDT'
  }
]

export default class BlogPostsController {
  async index({ response }: HttpContext) {
    return response.ok({ data: BLOG_POSTS })
  }

  async show({ params, response }: HttpContext) {
    const post = BLOG_POSTS.find((entry) => entry.slug === params.slug)
    if (!post) {
      return response.notFound({ message: 'Article introuvable' })
    }

    return response.ok({
      ...post,
      contactCtaUrl: `/contact?source=blog&post=${post.slug}&subject=${encodeURIComponent(`À propos: ${post.title}`)}`
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createBlogPostValidator)

    const post = {
      id: BLOG_POSTS.length + 1,
      ...payload
    }

    BLOG_POSTS.push(post)

    return response.created({ data: post })
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateBlogPostValidator)
    const index = BLOG_POSTS.findIndex((entry) => entry.id === Number(params.id))

    if (index === -1) {
      return response.notFound({ message: 'Article introuvable' })
    }

    BLOG_POSTS[index] = {
      ...BLOG_POSTS[index],
      ...payload
    }

    return response.ok({ data: BLOG_POSTS[index] })
  }
}
