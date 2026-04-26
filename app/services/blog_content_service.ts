export type BlogSections = {
  context: string
  what: string
  how: string
  why: string
  result: string
}

export function serializeBlogSections(sections: BlogSections): string {
  return JSON.stringify(sections)
}

export function parseBlogSections(content: string): BlogSections {
  try {
    const parsed = JSON.parse(content) as Partial<BlogSections>

    if (
      typeof parsed.context === 'string' &&
      typeof parsed.what === 'string' &&
      typeof parsed.how === 'string' &&
      typeof parsed.why === 'string' &&
      typeof parsed.result === 'string'
    ) {
      return {
        context: parsed.context,
        what: parsed.what,
        how: parsed.how,
        why: parsed.why,
        result: parsed.result
      }
    }
  } catch {
    // Legacy text content fallback
  }

  return {
    context: '',
    what: '',
    how: '',
    why: '',
    result: content
  }
}
