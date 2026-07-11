import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../../server/utils/markdown'

describe('renderMarkdown advanced syntax', () => {
  it('renders headings, task lists, tables and fenced code', async () => {
    const html = await renderMarkdown([
      '# 标题',
      '',
      '- [x] 完成',
      '',
      '| A | B |',
      '| --- | --- |',
      '| 1 | 2 |',
      '',
      '```ts',
      'const n = 1',
      '```',
    ].join('\n'))

    expect(html).toContain('<h1 id="标题">标题</h1>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('<table>')
    expect(html).toContain('language-ts')
  })

  it('removes scripts, event handlers and dangerous urls', async () => {
    const html = await renderMarkdown([
      '<script>alert(1)</script>',
      '',
      '<img src="x" onerror="alert(1)">',
      '',
      '[危险链接](javascript:alert(1))',
    ].join('\n'))

    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('href="javascript:')
  })

  it('opens external links safely while keeping internal links local', async () => {
    const html = await renderMarkdown('[外部](https://example.com) [内部](/notes/demo)')

    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain('href="/notes/demo"')
    expect(html).not.toContain('href="/notes/demo" target="_blank"')
  })
})
