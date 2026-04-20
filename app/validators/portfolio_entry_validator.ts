import vine from '@vinejs/vine'

export const updatePortfolioEntryValidator = vine.compile(
  vine.object({
    type: vine.enum(['project', 'event', 'experience', 'skill']).optional(),
    slug: vine.string().trim().minLength(2).maxLength(220).optional(),
    title: vine.string().trim().minLength(2).maxLength(220).optional(),
    summary: vine.string().trim().minLength(10).maxLength(2000).optional(),
    context: vine.string().trim().maxLength(5000).optional(),
    stack: vine.array(vine.string().trim().maxLength(120)).optional(),
    impactMetrics: vine.record(vine.string().trim().maxLength(240)).optional(),
    coverImageUrl: vine.string().trim().url().optional(),
    detailsHtml: vine.string().trim().maxLength(100000).optional(),
    externalLinks: vine
      .array(
        vine.object({
          label: vine.string().trim().minLength(1).maxLength(120),
          url: vine.string().trim().url(),
        })
      )
      .optional(),
    startDate: vine.string().trim().maxLength(32).optional(),
    endDate: vine.string().trim().maxLength(32).optional(),
    highlighted: vine.boolean().optional(),
  })
)
