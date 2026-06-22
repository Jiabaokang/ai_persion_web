// 任务 I0 - 极光背景动画测试
// 验证 assets/css/aurora.css 包含必要的动画定义

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const auroraCss = readFileSync(
  resolve(__dirname, '../../../assets/css/aurora.css'),
  'utf-8',
)

describe('极光背景 - aurora.css', () => {
  it('定义 .aurora-bg 容器', () => {
    expect(auroraCss).toMatch(/\.aurora-bg\s*\{/)
  })

  it('包含 3 个动画关键帧', () => {
    expect(auroraCss).toMatch(/@keyframes\s+aurora-1/)
    expect(auroraCss).toMatch(/@keyframes\s+aurora-2/)
    expect(auroraCss).toMatch(/@keyframes\s+aurora-3/)
  })

  it('使用 GPU 友好属性（will-change: transform）', () => {
    expect(auroraCss).toMatch(/will-change:\s*transform/)
  })

  it('使用 filter: blur 创建光晕', () => {
    expect(auroraCss).toMatch(/filter:\s*blur\(/)
  })

  it('移动端简化（max-width: 767px）', () => {
    expect(auroraCss).toMatch(/@media\s*\(max-width:\s*767px\)/)
  })

  it('尊重 prefers-reduced-motion', () => {
    expect(auroraCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  })
})
