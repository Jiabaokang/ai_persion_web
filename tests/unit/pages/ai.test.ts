import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const aiPagePath = resolve(process.cwd(), 'pages/ai.vue')
const aiPageSource = readFileSync(aiPagePath, 'utf-8')
const aiApiSource = readFileSync(resolve(process.cwd(), 'server/api/ai-nav.get.ts'), 'utf-8')

describe('pages/ai.vue', () => {
  it('使用 AIHOT 的分类、热点和资讯时间流', () => {
    expect(aiPageSource).toContain('当前热点')
    expect(aiPageSource).toContain('全部资讯')
    expect(aiPageSource).toContain('ai-feed')
    expect(aiPageSource).toContain('AI 评分')
  })

  it('资讯链接安全地在新标签页打开', () => {
    expect(aiPageSource).toContain('target="_blank"')
    expect(aiPageSource).toContain('rel="noopener noreferrer"')
  })

  it('服务端从 AIHOT 公开 API 获取数据', () => {
    expect(aiApiSource).toContain('fetchAihotNavigation')
    expect(aiApiSource).not.toContain('ai-nav.json')
    expect(aiApiSource).not.toContain('readFile')
  })

  it('保留数据来源署名且彻底移除旧工具书架', () => {
    expect(aiPageSource).toContain('数据来源：AIHOT')
    expect(aiPageSource).not.toContain('AI教程')
    expect(aiPageSource).not.toContain('ai-shelf')
  })
})
