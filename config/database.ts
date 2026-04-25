import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const resolvedDatabaseUrl = resolveDatabaseUrl()

const dbConfig = defineConfig({
  connection: 'pg',
  connections: {
    pg: {
      client: 'pg',
      connection: resolvedDatabaseUrl
        ? { connectionString: resolvedDatabaseUrl }
        : {
            host: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig

function resolveDatabaseUrl() {
  const rawValue = (env.get('DATABASE_URL') || '').trim()
  if (!rawValue) {
    return ''
  }

  const withTokensResolved = rawValue
    .replaceAll('${DB_USER}', env.get('DB_USER'))
    .replaceAll('${DB_PASSWORD}', env.get('DB_PASSWORD'))
    .replaceAll('${DB_HOST}', env.get('DB_HOST'))
    .replaceAll('${DB_PORT}', String(env.get('DB_PORT')))
    .replaceAll('${DB_DATABASE}', env.get('DB_DATABASE'))

  if (withTokensResolved.includes('${')) {
    throw new Error(
      'DATABASE_URL contains unresolved placeholders. Supported: ${DB_USER}, ${DB_PASSWORD}, ${DB_HOST}, ${DB_PORT}, ${DB_DATABASE}'
    )
  }

  return withTokensResolved
}
