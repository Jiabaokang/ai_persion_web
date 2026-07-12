import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const aiPagePath = resolve(process.cwd(), 'pages/ai.vue')
const aiPageSource = readFileSync(aiPagePath, 'utf-8')

describe('pages/ai.vue', () => {
  it('包含 AI 教程推荐位文案', () => {
    expect(aiPageSource).toContain('title: \'AI教程\'')
    expect(aiPageSource).toContain('data-ai-tutorial')
    expect(aiPageSource).toContain('立即查看教程')
  })

  it('教程入口指向指定链接并使用新标签页打开', () => {
    expect(aiPageSource).toContain('href: \'https://ai.codefather.cn/library/2010994846520700929\'')
    expect(aiPageSource).toContain('target="_blank"')
    expect(aiPageSource).toContain('rel="noopener noreferrer"')
  })

  it('保留 AI 导航页原有核心结构', () => {
    expect(aiPageSource).toContain('AI 工具导航')
    expect(aiPageSource).toContain('class="ai-search-wrap"')
    expect(aiPageSource).toContain('filteredGroups')
  })

  it('使用暖纸书架和项目图标库', () => {
    expect(aiPageSource).toContain('ai-shelf')
    expect(aiPageSource).toContain('i-carbon-application-web')
    expect(aiPageSource).not.toContain('<svg')
  })
})
