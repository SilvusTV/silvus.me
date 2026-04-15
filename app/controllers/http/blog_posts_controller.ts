import type { HttpContext } from '@adonisjs/core/http'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog_post_validator'

const posts = [
  {
    id: 1,
    title: 'Binance: intégrer un bloc utile sans casser la lecture',
    slug: 'binance-bloc-utile',
    excerpt: 'Retour d’expérience sur une intégration propre et actionnable.',
    content: 'Contexte, implémentation, arbitrages et résultat.',
    tags: ['binance', 'integration', 'ux'],
    publishedAt: '2026-04-01T08:00:00.000Z',
    binanceSymbol: 'BTCUSDT'
  }
]

export default class BlogPostsController {
  index({ response }: HttpContext) {
    return response.ok({ data: posts })
  }

  show({ response, params }: HttpContext) {
    const post = posts.find((item) => item.slug === params.slug)

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
    const post = { id: posts.length + 1, ...payload }
    posts.push(post)

    return response.created({ data: post })
  }

  async update({ request, response, params }: HttpContext) {
    const payload = await request.validateUsing(updateBlogPostValidator)
    const index = posts.findIndex((item) => item.id === Number(params.id))

    if (index === -1) {
      return response.notFound({ message: 'Article introuvable' })
    }

    posts[index] = { ...posts[index], ...payload }

    return response.ok({ data: posts[index] })
  }
}
