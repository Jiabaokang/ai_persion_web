import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Markdown 编辑器表单集成', () => {
  it('提供本地文件入口并在覆盖已有正文前确认', () => {
    const source = readFileSync(resolve(process.cwd(), 'components/admin/PostForm.vue'), 'utf8')
    expect(source).toContain('<ContentMarkdownEditor')
    expect(source).toContain('<ContentImportMarkdownButton')
    expect(source).toContain('window.confirm(\'当前正文已有内容，是否用导入文件覆盖？\')')
    expect(source).not.toContain('<ContentEditor')
  })

  it('本地导入按钮仅接受 Markdown 文件', () => {
    const source = readFileSync(resolve(process.cwd(), 'components/content/ImportMarkdownButton.vue'), 'utf8')
    expect(source).toContain('accept=".md,.markdown,text/markdown"')
    expect(source).toContain('emit(\'imported\', payload)')
  })

  it('灵感编辑流程也复用统一 Markdown 工作台', () => {
    const source = readFileSync(resolve(process.cwd(), 'components/inspiration/InspirationForm.vue'), 'utf8')
    expect(source).toContain('<ContentMarkdownEditor')
    expect(source).toContain('<ContentImportMarkdownButton')
    expect(source).not.toContain('<ContentEditor')
  })
})
