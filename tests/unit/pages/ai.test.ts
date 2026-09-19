import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const aiPagePath = resolve(process.cwd(), 'pages/ai/index.vue')
const aiPageSource = readFileSync(aiPagePath, 'utf-8')
const aiApiSource = readFileSync(resolve(process.cwd(), 'server/api/ai-nav.get.ts'), 'utf-8')

describe('pages/ai', () => {
  it('使用 AIHOT 的分类、热点和资讯时间流', () => {
    expect(aiPageSource).toContain('当前热点')
    expect(aiPageSource).toContain('全部资讯')
    expect(aiPageSource).toContain('ai-feed')
    expect(aiPageSource).toContain('AI 评分')
  })

  it('资讯和热点详情均使用本站 /ai/:id 路由', () => {
    expect(aiPageSource).toContain('/ai/${item.id}')
    expect(aiPageSource).toContain('/ai/${topic.id}')
    expect(aiPageSource).not.toContain('/ai/items/')
    expect(aiPageSource).not.toContain(':href="item.href"')
    expect(aiPageSource).not.toContain(':href="topic.href"')
  })

  it('服务端覆盖 AIHOT OpenAPI 的全部 9 个端点', () => {
    for (const endpoint of [
      '/items',
      '/codex-resets',
      '/hot-topics',
      '/stories/',
      '/dailies?',
      '/dailies/latest',
      '/dailies/',
      '/selected/snapshot',
      '/selected/changes',
    ]) {
      expect(aiApiSource).toContain(endpoint)
    }
  })

  it('保留数据来源署名且彻底移除旧工具书架', () => {
    expect(aiPageSource).toContain('数据来源：AIHOT')
    expect(aiPageSource).not.toContain('AI教程')
    expect(aiPageSource).not.toContain('ai-shelf')
  })

  it('提供本站资讯详情、日报归档和日报详情页面', () => {
    const detailPath = resolve(process.cwd(), 'pages/ai/[id].vue')
    const dailyIndexPath = resolve(process.cwd(), 'pages/ai/daily/index.vue')
    const dailyDetailPath = resolve(process.cwd(), 'pages/ai/daily/[date].vue')

    expect(existsSync(detailPath)).toBe(true)
    expect(existsSync(dailyIndexPath)).toBe(true)
    expect(existsSync(dailyDetailPath)).toBe(true)
    if (![detailPath, dailyIndexPath, dailyDetailPath].every(existsSync)) return

    const detailSource = readFileSync(detailPath, 'utf-8')
    const dailyIndexSource = readFileSync(dailyIndexPath, 'utf-8')
    const dailyDetailSource = readFileSync(dailyDetailPath, 'utf-8')
    expect(detailSource).toContain('/api/ai-items/')
    expect(detailSource).toContain('推荐理由')
    expect(detailSource).toContain('事件时间线')
    expect(detailSource).toContain('数据来源：AIHOT')
    expect(detailSource).not.toContain('aihot.news/items/')
    expect(dailyIndexSource).toContain('/api/ai-dailies')
    expect(dailyDetailSource).toContain('/api/ai-dailies/')
    expect(dailyDetailSource).toContain('数据来源：AIHOT')
  })

  it('AI 子页面不会被父级路由吞并', () => {
    // pages/ai.vue 会作为 pages/ai/** 的父路由；父级没有 <NuxtPage /> 时子页面永远不会渲染。
    expect(existsSync(resolve(process.cwd(), 'pages/ai.vue'))).toBe(false)
    expect(existsSync(resolve(process.cwd(), 'pages/ai/index.vue'))).toBe(true)
  })

  it('旧 /ai/items/:id 入口保留 301 重定向', () => {
    const legacyRoutePath = resolve(process.cwd(), 'server/routes/ai/items/[id].get.ts')
    expect(existsSync(legacyRoutePath)).toBe(true)
    if (!existsSync(legacyRoutePath)) return

    const legacySource = readFileSync(legacyRoutePath, 'utf-8')
    expect(legacySource).toContain('sendRedirect')
    expect(legacySource).toContain('301')
  })
})
