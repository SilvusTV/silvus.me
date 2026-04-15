import env from '#start/env'

export default {
  apiKey: env.get('RESEND_API_KEY'),
  from: env.get('RESEND_FROM'),
  to: env.get('RESEND_TO')
}
