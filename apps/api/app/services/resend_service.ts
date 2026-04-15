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
  const apiKey = env.get('RESEND_API_KEY')
  const from = env.get('RESEND_FROM')
  const to = env.get('RESEND_TO')

  const subject = payload.subject || 'Nouveau message depuis silvus.me'
  const text = [
    `Nom: ${payload.name}`,
    `Email: ${payload.email}`,
    `Source: ${payload.sourcePage || 'contact'}`,
    `Article lié: ${payload.relatedPostSlug || '-'}`,
    '',
    payload.message
  ].join('\n')

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text
    })
  })

  if (!result.ok) {
    const body = await result.text()
    throw new Error(`Resend error (${result.status}): ${body}`)
  }

  const body = (await result.json()) as { id: string }

  return {
    accepted: true,
    messageId: body.id
  }
}
