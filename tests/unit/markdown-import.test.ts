import { describe, expect, it } from 'vitest'
import { readMarkdownFile } from '../../composables/useMarkdownImport'

describe('readMarkdownFile', () => {
  it('读取 Markdown 文本并根据文件名建议标题', async () => {
    const file = new File(['# 正文'], '我的文章.md', { type: 'text/markdown' })
    await expect(readMarkdownFile(file)).resolves.toEqual({
      content: '# 正文',
      suggestedTitle: '我的文章',
    })
  })

  it('支持 .markdown 扩展名且忽略大小写', async () => {
    const file = new File(['内容'], 'Research.MARKDOWN', { type: 'text/markdown' })
    await expect(readMarkdownFile(file)).resolves.toMatchObject({ suggestedTitle: 'Research' })
  })

  it('拒绝不支持的扩展名', async () => {
    const file = new File(['x'], 'note.txt', { type: 'text/plain' })
    await expect(readMarkdownFile(file)).rejects.toThrow('仅支持 .md 或 .markdown 文件')
  })

  it('拒绝空 Markdown 文件', async () => {
    const file = new File(['  \n'], 'empty.md', { type: 'text/markdown' })
    await expect(readMarkdownFile(file)).rejects.toThrow('Markdown 文件为空')
  })
})
