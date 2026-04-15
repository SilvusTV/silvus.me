import vine from '@vinejs/vine'

export const createBlogPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(220),
    slug: vine.string().trim().minLength(3).maxLength(220),
    excerpt: vine.string().trim().minLength(10),
    content: vine.string().trim().minLength(20),
    tags: vine.array(vine.string().trim()),
    publishedAt: vine.string().optional(),
    binanceSymbol: vine.string().trim().maxLength(32).optional(),
    binanceEmbedUrl: vine.string().trim().url().optional()
  })
)

export const updateBlogPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(220).optional(),
    excerpt: vine.string().trim().minLength(10).optional(),
    content: vine.string().trim().minLength(20).optional(),
    tags: vine.array(vine.string().trim()).optional(),
    publishedAt: vine.string().optional(),
    binanceSymbol: vine.string().trim().maxLength(32).optional(),
    binanceEmbedUrl: vine.string().trim().url().optional()
  })
)
