import { describe, it, expect } from 'vitest'
import { renderMarkdown, calculateReadingTime, slugify } from '~/server/utils/markdown'

describe('markdown', () => {
  it('renders headings and paragraphs', async () => {
    const html = await renderMarkdown('# Hello\n\nWorld')
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<p>World</p>')
  })

  it('calculates reading time (CN chars)', () => {
    const md = '中'.repeat(400)
    expect(calculateReadingTime(md)).toBe(2)
  })

  it('slugifies title', () => {
    expect(slugify('Hello World! 2026')).toBe('hello-world-2026')
  })
})
