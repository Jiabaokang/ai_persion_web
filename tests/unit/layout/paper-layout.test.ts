import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { publicNavigation } from '../../../composables/usePublicNavigation'

const layoutSource = readFileSync(resolve(process.cwd(), 'layouts/default.vue'), 'utf-8')
const asideSource = readFileSync(resolve(process.cwd(), 'components/layout/ReadingAside.vue'), 'utf-8')

describe('暖纸公共布局', () => {
  it('定义桌面三栏和移动头部', () => {
    expect(layoutSource).toContain('<LayoutPaperSidebar')
    expect(layoutSource).toContain('paper-shell__main')
    expect(layoutSource).toContain('<LayoutReadingAside')
    expect(layoutSource).toContain('<AppHeader')
  })

  it('AI 导航位于首位且首页统一命名为博客', () => {
    expect(publicNavigation.map(item => [item.to, item.label])).toEqual([
      ['/ai', 'AI 导航'],
      ['/', '博客'],
      ['/notes', '笔记'],
      ['/inspiration', '灵感'],
      ['/wechat', '公众号'],
    ])
  })

  it('右栏提供日期、近期入口和知识摘录', () => {
    expect(asideSource).toContain('reading-aside__date')
    expect(asideSource).toContain('近期笔记与灵感')
    expect(asideSource).toContain('知识不是记住多少')
  })

  it('提供跳过导航与纸面应用根节点', () => {
    expect(layoutSource).toContain('skip-link')
    expect(layoutSource).toContain('paper-app')
  })
})
