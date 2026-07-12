import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const tokensCss = readFileSync(
  resolve(__dirname, '../../../assets/css/tokens.css'),
  'utf-8',
)

describe('暖纸设计令牌', () => {
  it('声明纸面、墨色和双强调色', () => {
    expect(tokensCss).toContain('--paper-base: #F3EBDD')
    expect(tokensCss).toContain('--paper-surface: #F8F2E7')
    expect(tokensCss).toContain('--paper-muted: #E9DECC')
    expect(tokensCss).toContain('--ink-primary: #2A241D')
    expect(tokensCss).toContain('--ink-secondary: #6F6558')
    expect(tokensCss).toContain('--accent-terracotta: #B85C38')
    expect(tokensCss).toContain('--accent-moss: #667653')
  })

  it('使用细分隔线、克制圆角和可见焦点', () => {
    expect(tokensCss).toContain('--rule-color: rgba(71, 59, 43, 0.18)')
    expect(tokensCss).toContain('--focus-ring: rgba(184, 92, 56, 0.24)')
    expect(tokensCss).toContain('--radius-sm: 4px')
    expect(tokensCss).toContain('--radius-md: 8px')
    expect(tokensCss).toContain('--radius-lg: 10px')
  })

  it('提供迁移期基础语义别名', () => {
    expect(tokensCss).toContain('--bg-base: var(--paper-base)')
    expect(tokensCss).toContain('--text-primary: var(--ink-primary)')
    expect(tokensCss).toContain('--text-secondary: var(--ink-secondary)')
  })
})
