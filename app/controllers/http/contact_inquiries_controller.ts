import type { HttpContext } from '@adonisjs/core/http'
import { sendContactMessage } from '#services/resend_service'
import { contactInquiryValidator } from '#validators/contact_inquiry_validator'

export default class ContactInquiriesController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(contactInquiryValidator)
    const delivery = await sendContactMessage(payload)

    return response.created({
      status: delivery.accepted ? 'sent' : 'queued',
      messageId: delivery.messageId
    })
  }
}
