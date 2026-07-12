import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const detailPages = [
  'pages/blog/[slug].vue',
  'pages/notes/[slug].vue',
  'pages/wechat/[slug].vue',
  'pages/inspiration/[slug].vue',
]

describe('Markdown 详情页', () => {
  it.each(detailPages)('%s 使用统一 MarkdownContent', (path) => {
    const source = readFileSync(resolve(process.cwd(), path), 'utf8')
    expect(source).toContain('<ContentMarkdownContent')
    expect(source).not.toContain('v-html="post.contentHtml"')
    expect(source).toContain('reading-article')
  })
})
