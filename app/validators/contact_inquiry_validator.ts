import vine from '@vinejs/vine'

export const contactInquiryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email(),
    subject: vine.string().trim().maxLength(255).optional(),
    message: vine.string().trim().minLength(15).maxLength(5000),
    sourcePage: vine.string().trim().maxLength(120).optional(),
    relatedPostSlug: vine.string().trim().maxLength(220).optional()
  })
)
