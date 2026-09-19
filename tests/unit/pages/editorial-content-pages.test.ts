import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('编辑部首页与内容列表', () => {
  it('首页就是博客列表，不再保留独立首页宣言', () => {
    const source = read('pages/index.vue')
    expect(source).toContain('type=blog')
    expect(source).toContain('<h1>博客</h1>')
    expect(source).toContain('<ContentList')
    expect(source).not.toContain('home-manifesto')
  })

  it('旧博客列表地址永久跳转到首页', () => {
    const source = read('pages/blog/index.vue')
    expect(source).toContain('navigateTo(\'/\', { redirectCode: 301')
  })

  it.each(['pages/index.vue', 'pages/notes/index.vue', 'pages/wechat/index.vue'])('%s 共用行列表', (path) => {
    const source = read(path)
    expect(source).toContain('<ContentList')
    expect(source).toContain('editorial-index')
  })

  it('右侧阅读索引读取近期笔记和灵感', () => {
    const source = read('components/layout/ReadingAside.vue')
    expect(source).toContain('recentPrivate')
    expect(source).toContain('近期笔记与灵感')
  })
})
