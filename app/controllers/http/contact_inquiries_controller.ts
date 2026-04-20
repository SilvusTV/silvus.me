import type { HttpContext } from '@adonisjs/core/http'
import { sql } from '#services/db_service'
import { sendContactMessage } from '#services/resend_service'
import { contactInquiryValidator } from '#validators/contact_inquiry_validator'

export default class ContactInquiriesController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(contactInquiryValidator)

    try {
      const delivery = await sendContactMessage(payload)

      await persistInquiry(payload, delivery.accepted ? 'sent' : 'queued', true)

      return response.created({
        status: delivery.accepted ? 'sent' : 'queued',
        messageId: delivery.messageId
      })
    } catch {
      await persistInquiry(payload, 'failed', false)

      return response.internalServerError({
        message: 'Le message n a pas pu etre envoye. Reessaie dans un instant.'
      })
    }
  }
}

async function persistInquiry(
  payload: {
    name: string
    email: string
    subject?: string
    message: string
    sourcePage?: string
    relatedPostSlug?: string
  },
  status: string,
  withSentDate: boolean
) {
  try {
    await sql(
      `
      insert into contact_inquiries (
        name, email, subject, message, source_page, related_post_slug, sent_at, status
      ) values (
        $1, $2, $3, $4, $5, $6, case when $8 then now() else null end, $7
      )
      `,
      [
        payload.name,
        payload.email,
        payload.subject || null,
        payload.message,
        payload.sourcePage || 'contact',
        payload.relatedPostSlug || null,
        status,
        withSentDate
      ]
    )
  } catch {
    // Ignore DB write errors, API response should reflect email delivery outcome first.
  }
}
