import type { HttpContext } from '@adonisjs/core/http'

export default class PagesController {
  intro({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('Intro', {})
  }

  portfolio({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('Portfolio', {})
  }

  portfolioShow({ inertia, params }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('PortfolioDetail', { slug: params.slug })
  }

  journey({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('Journey', {})
  }

  blogIndex({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('BlogIndex', {})
  }

  blogShow({ inertia, params }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('BlogShow', { slug: params.slug })
  }

  contact({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('Contact', {})
  }

  adminBlog({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('AdminBlog', {})
  }

  adminPortfolio({ inertia }: HttpContext) {
    const renderer = inertia as any
    return renderer.render('AdminPortfolio', {})
  }
}
