import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('灵感、登录与编辑流程暖纸迁移', () => {
  it('灵感索引使用时间线并保留新增、编辑和删除行为', () => {
    const source = read('pages/inspiration/index.vue')
    expect(source).toContain('inspiration-timeline')
    expect(source).toContain('/inspiration/new')
    expect(source).toContain('/inspiration/edit/')
    expect(source).toContain('@click="remove(p.id)"')
    expect(source).not.toMatch(/glass|gradient-text/)
  })

  it.each(['pages/inspiration/new.vue', 'pages/inspiration/edit/[id].vue'])('%s 使用纸面编辑工作区', (path) => {
    const source = read(path)
    expect(source).toContain('inspiration-workspace')
    expect(source).toContain('<InspirationForm')
  })

  it('登录页保留完整认证行为并使用真实水墨辅助图', () => {
    const source = read('pages/login.vue')
    expect(source).toContain('name="username"')
    expect(source).toContain('name="password"')
    expect(source).toContain('showPassword')
    expect(source).toContain('/images/ink-plant.webp')
    expect(source).toContain('login-sheet')
    expect(source).not.toMatch(/aurora|glass|gradient-text|<svg/)
  })
})
