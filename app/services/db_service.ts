import env from '#start/env'
import { Pool } from 'pg'
import type { QueryResultRow } from 'pg'

const databaseUrl = env.get('DATABASE_URL')

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to use PostgreSQL endpoints')
}

const pool = new Pool({
  connectionString: databaseUrl
})

export async function sql<T extends QueryResultRow>(query: string, values: unknown[] = []) {
  return pool.query<T>(query, values)
}
