// 任务 I0 - 设计令牌（CSS 变量）迁移测试
// 验证 assets/css/tokens.css 包含完整的 prototype 设计令牌

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const tokensCss = readFileSync(
  resolve(__dirname, '../../../assets/css/tokens.css'),
  'utf-8',
)

describe('设计令牌 - 基础色（深色）', () => {
  it('声明 --bg-base（主背景）', () => {
    expect(tokensCss).toMatch(/--bg-base:\s*#0F172A/)
  })
  it('声明 --bg-deep（深背景）', () => {
    expect(tokensCss).toMatch(/--bg-deep:\s*#020617/)
  })
  it('声明 --text-primary（主文字）', () => {
    expect(tokensCss).toMatch(/--text-primary:\s*#F8FAFC/)
  })
})

describe('设计令牌 - 玻璃参数', () => {
  it('声明 --glass-bg', () => {
    expect(tokensCss).toMatch(/--glass-bg:\s*rgba\(15,\s*23,\s*42,\s*0\.4\)/)
  })
  it('声明 --glass-bg-strong', () => {
    expect(tokensCss).toMatch(/--glass-bg-strong:\s*rgba\(15,\s*23,\s*42,\s*0\.65\)/)
  })
  it('声明 --glass-blur 20px', () => {
    expect(tokensCss).toMatch(/--glass-blur:\s*20px/)
  })
})

describe('设计令牌 - 极光强调色', () => {
  it('--accent-cyan', () => {
    expect(tokensCss).toMatch(/--accent-cyan:\s*#22D3EE/)
  })
  it('--accent-purple', () => {
    expect(tokensCss).toMatch(/--accent-purple:\s*#A855F7/)
  })
  it('--accent-pink', () => {
    expect(tokensCss).toMatch(/--accent-pink:\s*#EC4899/)
  })
})

describe('设计令牌 - 渐变', () => {
  it('--gradient-aurora 含三色', () => {
    expect(tokensCss).toMatch(/--gradient-aurora:.*#22D3EE.*#A855F7.*#EC4899/)
  })
})

describe('设计令牌 - 圆角', () => {
  it('声明 5 个圆角档位', () => {
    expect(tokensCss).toMatch(/--radius-sm:\s*8px/)
    expect(tokensCss).toMatch(/--radius-md:\s*12px/)
    expect(tokensCss).toMatch(/--radius-lg:\s*16px/)
    expect(tokensCss).toMatch(/--radius-xl:\s*24px/)
    expect(tokensCss).toMatch(/--radius-full:\s*9999px/)
  })
})

describe('设计令牌 - 动效', () => {
  it('--ease-out', () => {
    expect(tokensCss).toMatch(/--ease-out:\s*cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/)
  })
  it('--duration-fast 150ms', () => {
    expect(tokensCss).toMatch(/--duration-fast:\s*150ms/)
  })
  it('--duration-slow 400ms', () => {
    expect(tokensCss).toMatch(/--duration-slow:\s*400ms/)
  })
})

describe('设计令牌 - 浅色主题覆盖', () => {
  it('通过 [data-theme="light"] 切换', () => {
    expect(tokensCss).toMatch(/\[data-theme=['"]light['"]\]/)
  })
  it('浅色主题重写 --bg-base', () => {
    expect(tokensCss).toMatch(/\[data-theme=['"]light['"]\][^{]*\{[^}]*--bg-base:\s*#F8FAFC/)
  })
})
