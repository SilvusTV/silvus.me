import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '#services/admin_auth_service'

export default class AdminAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const sessionToken = ctx.request.cookie(ADMIN_SESSION_COOKIE)
    if (verifyAdminSessionToken(sessionToken)) {
      return next()
    }

    if (ctx.request.url().startsWith('/api/')) {
      return ctx.response.unauthorized({ message: 'Authentification admin requise.' })
    }

    return ctx.response.redirect('/admin/login')
  }
}
