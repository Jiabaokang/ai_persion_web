import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { publicNavigation } from '../../../composables/usePublicNavigation'

const layoutSource = readFileSync(resolve(process.cwd(), 'layouts/default.vue'), 'utf-8')
const asideSource = readFileSync(resolve(process.cwd(), 'components/layout/ReadingAside.vue'), 'utf-8')

describe('暖纸公共布局', () => {
  it('定义桌面书桌布局和移动头部', () => {
    expect(layoutSource).toContain('<LayoutPaperSidebar')
    expect(layoutSource).toContain('paper-shell__main')
    expect(layoutSource).toContain('<LayoutReadingAside')
    expect(layoutSource).toContain('<AppHeader')
  })

  it('AI 资讯优先，笔记和文章有独立入口', () => {
    expect(publicNavigation.map(item => [item.to, item.label])).toEqual([
      ['/ai', 'AI 资讯'],
      ['/notes', '笔记'],
      ['/blog', '文章'],
      ['/inspiration', '灵感'],
      ['/wechat', '公众号'],
    ])
  })

  it('阅读目录使用原生折叠面板', () => {
    expect(asideSource).toContain('<details')
    expect(asideSource).toContain('文章目录')
  })

  it('提供跳过导航与纸面应用根节点', () => {
    expect(layoutSource).toContain('skip-link')
    expect(layoutSource).toContain('paper-app')
  })
})
