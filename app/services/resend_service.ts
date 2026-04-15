import env from '#start/env'

type ContactPayload = {
  name: string
  email: string
  subject?: string
  message: string
  sourcePage?: string
  relatedPostSlug?: string
}

export async function sendContactMessage(payload: ContactPayload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.get('RESEND_FROM'),
      to: [env.get('RESEND_TO')],
      subject: payload.subject || 'Nouveau message depuis silvus.me',
      text: [`Nom: ${payload.name}`, `Email: ${payload.email}`, '', payload.message].join('\n')
    })
  })

  if (!response.ok) {
    throw new Error(`Resend request failed (${response.status})`)
  }

  const body = (await response.json()) as { id: string }

  return { accepted: true, messageId: body.id }
}
