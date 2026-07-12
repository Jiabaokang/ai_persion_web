import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { createGenerator, presetUno } from 'unocss'
import type { UnoGenerator } from 'unocss'
import { shortcuts, theme } from '../../../uno.config'

const unoSource = readFileSync(resolve(process.cwd(), 'uno.config.ts'), 'utf8')

let generator: UnoGenerator

beforeAll(async () => {
  generator = await createGenerator({
    presets: [presetUno() as any],
    theme,
    shortcuts,
  } as any)
})

describe('UnoCSS 暖纸语义快捷方式', () => {
  it('paper-surface 生成纸面背景、边框和克制圆角', async () => {
    const { css } = await generator.generate('paper-surface')
    expect(css).toContain('background-color')
    expect(css).toMatch(/border-width:\s*1px/)
    expect(css).toMatch(/border-radius:\s*10px/)
    expect(css).not.toContain('backdrop-filter')
  })

  it('paper-rule 生成纸墨分隔线', async () => {
    const { css } = await generator.generate('paper-rule')
    expect(css).toMatch(/border-(bottom-)?width:\s*1px/)
  })

  it('paper-focus 生成可见聚焦轮廓', async () => {
    const { css } = await generator.generate('paper-focus')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('box-shadow')
  })

  it('container 保持响应式宽度和内边距', async () => {
    const { css } = await generator.generate('container')
    expect(css).toMatch(/max-width[^;]*1280px/)
    expect(css).toMatch(/padding-(left|inline-start)[^;]*1rem/)
  })

  it('只导出暖纸视觉语义快捷方式', () => {
    expect(shortcuts.some(([name]) => name === 'paper-surface')).toBe(true)
    expect(shortcuts.some(([name]) => name === 'paper-rule')).toBe(true)
    expect(shortcuts.some(([name]) => name === 'paper-focus')).toBe(true)
  })

  it('构建过程不依赖远程字体抓取', () => {
    expect(unoSource).not.toContain('presetWebFonts')
  })
})
