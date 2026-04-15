import type { HttpContext } from '@adonisjs/core/http'

export default class PagesController {
  intro({ inertia }: HttpContext) {
    return inertia.render('Intro')
  }

  portfolio({ inertia }: HttpContext) {
    return inertia.render('Portfolio')
  }

  journey({ inertia }: HttpContext) {
    return inertia.render('Journey')
  }

  blogIndex({ inertia }: HttpContext) {
    return inertia.render('BlogIndex')
  }

  blogShow({ inertia, params }: HttpContext) {
    return inertia.render('BlogShow', { slug: params.slug })
  }

  contact({ inertia }: HttpContext) {
    return inertia.render('Contact')
  }

  adminBlog({ inertia }: HttpContext) {
    return inertia.render('AdminBlog')
  }
}
