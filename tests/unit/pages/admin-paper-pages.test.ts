import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
describe('暖纸管理后台', () => {
  it('使用同源纸面侧栏和移动导航', () => {
    const source = read('layouts/admin.vue')
    expect(source).toContain('admin-sidebar')
    expect(source).toContain('admin-mobile-nav')
    expect(source).toContain('返回网站')
    expect(source).toContain('标签')
  })

  it('仪表盘使用编辑部摘要行', () => {
    const source = read('pages/admin/index.vue')
    expect(source).toContain('admin-stats')
    expect(source).toContain('admin-quick-actions')
  })

  it('内容管理保留行表格、新建、编辑和删除入口', () => {
    const source = read('pages/admin/posts/index.vue')
    expect(source).toContain('admin-content-table')
    expect(source).toContain('/admin/posts/new')
    expect(source).toContain('@click="remove(p.id)"')
  })

  it('PostForm 以正文为主栏并提供粘性发布设置', () => {
    const source = read('components/admin/PostForm.vue')
    expect(source).toContain('post-form__main')
    expect(source).toContain('post-form__aside')
    expect(source).toContain('post-settings is-sticky')
    expect(source).toContain('<ContentMarkdownEditor')
    expect(source).toContain('<ContentImportMarkdownButton')
  })
})
