// 任务 I2 - 主题切换 composable
//
// 支持 dark / light 双主题，自动持久化到 localStorage
// 同步 data-theme 属性到 <html> 用于 CSS 变量切换
// 首次访问跟随系统偏好（prefers-color-scheme）

import { ref, computed } from 'vue'

type Theme = 'dark' | 'light'
const THEME_KEY = 'ai-personal-website-theme'

export function useTheme() {
  // SSR 安全：服务端无 localStorage/window，默认返回 dark
  const initial = getBrowserTheme() || 'dark'
  const theme = ref<Theme>(initial)

  const isLight = computed(() => theme.value === 'light')

  function sync() {
    if (typeof window === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem(THEME_KEY, theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    sync()
  }

  function set(newTheme: Theme) {
    theme.value = newTheme
    sync()
  }

  return { theme, isLight, toggle, set }
}

function getBrowserTheme(): Theme | undefined {
  if (typeof window === 'undefined') return undefined
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return undefined
}
