// 智识花园 - 暖纸编辑部 UnoCSS 配置
import {
  defineConfig,
  presetIcons,
  presetUno,
} from 'unocss'
import { publicNavigation } from './composables/usePublicNavigation'

export const shortcuts: [string, string][] = [
  [
    'paper-surface',
    'bg-[var(--paper-surface)] border border-[var(--rule-color)] rounded-[10px]',
  ],
  [
    'paper-rule',
    'border-b border-[var(--rule-color)]',
  ],
  [
    'paper-focus',
    'outline-none focus-visible:border-[var(--accent-terracotta)] focus-visible:shadow-[0_0_0_3px_var(--focus-ring)]',
  ],
  [
    'container',
    'max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8',
  ],
  ['section', 'py-12 md:py-16'],
  ['stack', '[&>*+*]:mt-4'],
  ['stack-lg', '[&>*+*]:mt-6'],
  ['stack-xl', '[&>*+*]:mt-10'],
]

export const theme = {
  colors: {
    'base': '#F3EBDD',
    'surface': '#F8F2E7',
    'surface-2': '#E9DECC',
    'ink': '#2A241D',
    'ink-2': '#6F6558',
    'terracotta': '#B85C38',
    'moss': '#667653',
  },
}

export default defineConfig({
  // 导航图标来自共享数据，显式纳入生成，避免动态 class 被模板扫描遗漏。
  safelist: publicNavigation.map(item => item.icon),
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.15,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme,
  shortcuts,
})
