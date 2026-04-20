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

  if (!apiKey || !from || !to) {
    throw new Error('Resend environment variables are missing')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: payload.subject || 'Nouveau message depuis silvus.me',
      text: [
        `Nom: ${payload.name}`,
        `Email: ${payload.email}`,
        `Source: ${payload.sourcePage || 'contact'}`,
        `Article lie: ${payload.relatedPostSlug || '-'}`,
        '',
        payload.message
      ].join('\n')
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend request failed (${response.status}): ${body}`)
  }

  const body = (await response.json()) as { id: string }

  return { accepted: true, messageId: body.id }
}
