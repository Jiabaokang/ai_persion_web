// 任务 I0 - 设计令牌迁移：UnoCSS shortcuts 单元测试
// 验证 uno.config.ts 中的快捷类能正确生成 CSS
//
// 注意：测试用精简配置（去掉 web fonts / icons 预设），避免在 CI 触发 Google Fonts 拉取。

import { describe, it, expect, beforeAll } from 'vitest'
import { createGenerator, presetUno } from 'unocss'
import type { UnoGenerator } from 'unocss'
import { shortcuts, theme } from '../../../uno.config'

let generator: UnoGenerator

beforeAll(async () => {
  // 使用精简 preset（无 web fonts / icons），避免离线 / CI 环境噪音
  generator = await createGenerator({
    presets: [presetUno() as any],
    theme,
    shortcuts,
  } as any)
})

describe('UnoCSS shortcuts - 玻璃/渐变/容器', () => {
  describe('glass（玻璃拟态卡片）', () => {
    it('生成 backdrop-filter', async () => {
      const { css } = await generator.generate('glass')
      expect(css).toContain('backdrop-filter')
    })

    it('生成 rgba 半透明背景', async () => {
      const { css } = await generator.generate('glass')
      // UnoCSS 把 bg-[rgba(...)] 编译为 --un-bg-opacity + background-color
      expect(css).toMatch(/--un-bg-opacity:\s*0\.4/)
    })

    it('生成 1px 边框', async () => {
      const { css } = await generator.generate('glass')
      expect(css).toMatch(/border-width:\s*1px/)
    })
  })

  describe('glass-strong（强化玻璃）', () => {
    it('生成 backdrop-filter', async () => {
      const { css } = await generator.generate('glass-strong')
      expect(css).toContain('backdrop-filter')
    })

    it('生成更高不透明度（≥ 0.5）', async () => {
      const { css } = await generator.generate('glass-strong')
      // 验证 --un-bg-opacity 存在且 ≥ 0.5
      const match = css.match(/--un-bg-opacity:\s*(0\.[0-9]+)/)
      expect(match).not.toBeNull()
      const opacity = Number.parseFloat(match![1])
      expect(opacity).toBeGreaterThanOrEqual(0.5)
    })
  })

  describe('gradient-text（渐变文字）', () => {
    it('生成 background-clip: text', async () => {
      const { css } = await generator.generate('gradient-text')
      // UnoCSS 输出格式：background-clip:text（无空格），CSS 实际有空格
      expect(css).toMatch(/background-clip:\s*text/)
      expect(css).toMatch(/-webkit-background-clip:\s*text/)
    })

    it('生成 -webkit-text-fill-color: transparent', async () => {
      const { css } = await generator.generate('gradient-text')
      expect(css).toMatch(/-webkit-text-fill-color:\s*transparent/)
    })
  })

  describe('container（响应式容器）', () => {
    it('生成 max-width 约束', async () => {
      const { css } = await generator.generate('container')
      expect(css).toMatch(/max-width[^;]*1200px/)
    })

    it('生成水平内边距', async () => {
      const { css } = await generator.generate('container')
      expect(css).toMatch(/padding-(left|inline-start)[^;]*1rem/)
    })
  })

  describe('section（章节垂直内边距）', () => {
    it('生成垂直内边距', async () => {
      const { css } = await generator.generate('section')
      expect(css).toMatch(/padding-(top|block-start)[^;]*4rem/)
    })
  })
})

describe('UnoCSS shortcuts - 间距堆叠', () => {
  it('stack 1rem', async () => {
    const { css } = await generator.generate('stack')
    expect(css).toContain('1rem')
  })

  it('stack-lg 1.5rem', async () => {
    const { css } = await generator.generate('stack-lg')
    expect(css).toContain('1.5rem')
  })

  it('stack-xl 2.5rem', async () => {
    const { css } = await generator.generate('stack-xl')
    expect(css).toContain('2.5rem')
  })
})
