import env from '#start/env'
import { Pool } from 'pg'
import type { QueryResultRow } from 'pg'

const databaseUrl = resolveDatabaseUrl()

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to use PostgreSQL endpoints')
}

const pool = new Pool({
  connectionString: databaseUrl
})

export async function sql<T extends QueryResultRow>(query: string, values: unknown[] = []) {
  return pool.query<T>(query, values)
}

function resolveDatabaseUrl(): string {
  const rawValue = (env.get('DATABASE_URL') || '').trim()
  const fallback = `postgresql://${env.get('DB_USER')}:${env.get('DB_PASSWORD')}@${env.get('DB_HOST')}:${env.get('DB_PORT')}/${env.get('DB_DATABASE')}`

  const withTokensResolved = (rawValue || fallback)
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
