import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  APP_KEY: Env.schema.secret(),
  ADMIN_LOGIN: Env.schema.string(),
  ADMIN_PASSWORD: Env.schema.string(),
  ADMIN_SESSION_TTL_HOURS: Env.schema.number(),

  DB_CONNECTION: Env.schema.enum(['pg'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),
  DATABASE_URL: Env.schema.string(),

  RESEND_API_KEY: Env.schema.string(),
  RESEND_FROM: Env.schema.string(),
  RESEND_TO: Env.schema.string(),

  S3_ENDPOINT: Env.schema.string({ format: 'host' }),
  S3_PORT: Env.schema.number(),
  S3_USE_SSL: Env.schema.boolean(),
  S3_ACCESS_KEY: Env.schema.string(),
  S3_SECRET_KEY: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_REGION: Env.schema.string(),
  S3_PUBLIC_URL: Env.schema.string(),
  MINIO_CONSOLE_PORT: Env.schema.number(),
})
