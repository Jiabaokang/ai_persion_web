import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('站点浏览器标签图标（Favicon）配置', () => {
  it('public 目录下应存在 favicon.svg、favicon.ico 和 apple-touch-icon.png', () => {
    const svgPath = resolve(process.cwd(), 'public/favicon.svg')
    const icoPath = resolve(process.cwd(), 'public/favicon.ico')
    const applePath = resolve(process.cwd(), 'public/apple-touch-icon.png')

    expect(existsSync(svgPath)).toBe(true)
    expect(existsSync(icoPath)).toBe(true)
    expect(existsSync(applePath)).toBe(true)
  })

  it('favicon.svg 应包含水墨植物与暖纸特征色', () => {
    const svgContent = readFileSync(resolve(process.cwd(), 'public/favicon.svg'), 'utf8')
    // 验证包含 SVG 根标签
    expect(svgContent).toContain('<svg')
    // 验证包含暖纸底衬特征
    expect(svgContent).toContain('#FAF5EC')
    // 验证包含苔藓绿嫩芽
    expect(svgContent).toContain('#6F8856')
    // 验证包含水墨色
    expect(svgContent).toContain('#2A241D')
    // 验证包含陶土红色种子
    expect(svgContent).toContain('#B85C38')
  })

  it('nuxt.config.ts 应正确配置 head.link 图标引用', () => {
    const nuxtConfigContent = readFileSync(resolve(process.cwd(), 'nuxt.config.ts'), 'utf8')
    expect(nuxtConfigContent).toContain('href: \'/favicon.svg\'')
    expect(nuxtConfigContent).toContain('href: \'/favicon.ico\'')
    expect(nuxtConfigContent).toContain('href: \'/apple-touch-icon.png\'')
  })
})
