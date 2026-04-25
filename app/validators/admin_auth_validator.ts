import vine from '@vinejs/vine'

export const adminLoginValidator = vine.compile(
  vine.object({
    login: vine.string().trim().minLength(1).maxLength(128),
    password: vine.string().trim().minLength(1).maxLength(256),
  })
)
