import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync(resolve(process.cwd(), 'layouts/default.vue'), 'utf-8')
const navigationSource = readFileSync(resolve(process.cwd(), 'composables/usePublicNavigation.ts'), 'utf-8')
const asideSource = readFileSync(resolve(process.cwd(), 'components/layout/ReadingAside.vue'), 'utf-8')

describe('暖纸公共布局', () => {
  it('定义桌面三栏和移动头部', () => {
    expect(layoutSource).toContain('<LayoutPaperSidebar')
    expect(layoutSource).toContain('paper-shell__main')
    expect(layoutSource).toContain('<LayoutReadingAside')
    expect(layoutSource).toContain('<AppHeader')
  })

  it('侧栏包含全部公共主路由', () => {
    for (const path of ['/', '/blog', '/notes', '/inspiration', '/ai', '/wechat']) {
      expect(navigationSource).toContain(`to: '${path}'`)
    }
  })

  it('右栏提供日期、近期入口和知识摘录', () => {
    expect(asideSource).toContain('reading-aside__date')
    expect(asideSource).toContain('近期阅读')
    expect(asideSource).toContain('知识不是记住多少')
  })

  it('不再挂载极光背景', () => {
    expect(layoutSource).not.toContain('AppAuroraBackground')
  })
})
