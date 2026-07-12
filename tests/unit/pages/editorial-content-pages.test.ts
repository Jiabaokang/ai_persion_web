import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('编辑部首页与内容列表', () => {
  it('首页包含宣言、写作动作、导入入口和真实植物资源', () => {
    const source = read('pages/index.vue')
    expect(source).toContain('home-manifesto')
    expect(source).toContain('<ContentContentList')
    expect(source).toContain('写一篇文章')
    expect(source).toContain('导入 Markdown')
    expect(source).toContain('/images/ink-plant.webp')
    expect(source).not.toMatch(/glass|gradient-text/)
  })

  it.each(['pages/blog/index.vue', 'pages/notes/index.vue', 'pages/wechat/index.vue'])('%s 共用行列表', (path) => {
    const source = read(path)
    expect(source).toContain('<ContentContentList')
    expect(source).toContain('editorial-index')
    expect(source).not.toMatch(/glass|gradient-text/)
  })

  it('右侧阅读索引读取近期笔记和灵感', () => {
    const source = read('components/layout/ReadingAside.vue')
    expect(source).toContain('recentPrivate')
    expect(source).toContain('近期笔记与灵感')
  })
})
