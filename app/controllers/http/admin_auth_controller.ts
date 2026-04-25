import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminSessionToken,
  validateAdminCredentials,
} from '#services/admin_auth_service'
import { adminLoginValidator } from '#validators/admin_auth_validator'

export default class AdminAuthController {
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminLoginValidator)

    if (!validateAdminCredentials(payload.login, payload.password)) {
      return response.unauthorized({ message: 'Identifiants invalides.' })
    }

    response.cookie(ADMIN_SESSION_COOKIE, createAdminSessionToken(), adminSessionCookieOptions())
    return response.ok({ authenticated: true, login: env.get('ADMIN_LOGIN') })
  }

  async logout({ response }: HttpContext) {
    response.clearCookie(ADMIN_SESSION_COOKIE, adminSessionCookieOptions())
    return response.ok({ authenticated: false })
  }

  async me({ request, response }: HttpContext) {
    const sessionToken = request.cookie(ADMIN_SESSION_COOKIE)
    if (!verifyAdminSessionToken(sessionToken)) {
      return response.unauthorized({ message: 'Session admin invalide.' })
    }

    return response.ok({ authenticated: true, login: env.get('ADMIN_LOGIN') })
  }
}
