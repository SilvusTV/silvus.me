import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE = 'admin_session'

type AdminSessionPayload = {
  login: string
  exp: number
}

export function validateAdminCredentials(login: string, password: string): boolean {
  return safeEqual(login, env.get('ADMIN_LOGIN')) && safeEqual(password, env.get('ADMIN_PASSWORD'))
}

export function createAdminSessionToken(): string {
  const hours = Math.max(1, env.get('ADMIN_SESSION_TTL_HOURS'))
  const payload: AdminSessionPayload = {
    login: env.get('ADMIN_LOGIN'),
    exp: Date.now() + hours * 60 * 60 * 1000,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) {
    return false
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return false
  }

  const expectedSignature = sign(encodedPayload)
  if (!safeEqual(signature, expectedSignature)) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<AdminSessionPayload>
    if (typeof payload.login !== 'string' || typeof payload.exp !== 'number') {
      return false
    }

    if (payload.exp < Date.now()) {
      return false
    }

    return safeEqual(payload.login, env.get('ADMIN_LOGIN'))
  } catch {
    return false
  }
}

export function adminSessionCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: app.inProduction,
    maxAge: `${Math.max(1, env.get('ADMIN_SESSION_TTL_HOURS'))}h`,
  }
}

function sign(value: string): string {
  return createHmac('sha256', `${env.get('APP_KEY')}#${env.get('ADMIN_PASSWORD')}`)
    .update(value)
    .digest('base64url')
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
