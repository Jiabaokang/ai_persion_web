// 任务 I2 - useTheme composable 测试
// 验证主题持久化、默认值、toggle/set

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { withSetup } from '../helpers'
import { useTheme } from '../../composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // 默认系统偏好 dark，确保测试可预测
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any)
  })

  it('从 localStorage 恢复主题', () => {
    localStorage.setItem('ai-personal-website-theme', 'light')
    const { isLight, theme } = withSetup(useTheme)
    expect(theme.value).toBe('light')
    expect(isLight.value).toBe(true)
  })

  it('默认为 dark', () => {
    const { theme } = withSetup(useTheme)
    expect(theme.value).toBe('dark')
  })

  it('toggle 切换并持久化', async () => {
    const { theme, toggle } = withSetup(useTheme)
    toggle()
    await nextTick()
    expect(theme.value).toBe('light')
    expect(localStorage.getItem('ai-personal-website-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('set 直接设置主题', async () => {
    const { theme, set } = withSetup(useTheme)
    set('light')
    await nextTick()
    expect(theme.value).toBe('light')
    expect(localStorage.getItem('ai-personal-website-theme')).toBe('light')
  })

  it('data-theme 属性同步到 documentElement', async () => {
    const { set, toggle } = withSetup(useTheme)
    set('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    toggle()
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
