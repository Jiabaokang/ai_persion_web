// 智识花园 - UnoCSS 配置
// 基础预设：UnoCSS 原子化样式 + 图标 + Web 字体
// 设计令牌（glass/aurora/colors）由 I0 任务注入 shortcuts
// @see https://unocss.dev/

// 显式导入：UnoCSS 配置在 Nuxt 上下文外加载，无法使用 auto-import
import {
  defineConfig,
  presetUno,
  presetIcons,
  presetWebFonts,
} from 'unocss'

// 导出供测试复用（经 vitest.config.ts 的 vue plugin 解析后可用）
export const shortcuts: [string, string][] = [
  // ===== 玻璃拟态 =====
  [
    'glass',
    'bg-[rgba(15,23,42,0.4)] backdrop-blur-[20px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
  ],
  [
    'glass-strong',
    'bg-[rgba(15,23,42,0.65)] backdrop-blur-[20px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.18)] rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
  ],

  // ===== 渐变文字 =====
  [
    'gradient-text',
    'bg-[linear-gradient(135deg,#22D3EE_0%,#A855F7_50%,#EC4899_100%)] [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] text-transparent',
  ],

  // ===== 响应式容器 =====
  [
    'container',
    'max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8',
  ],

  // ===== 章节垂直内边距 =====
  [
    'section',
    'py-16 md:py-24',
  ],

  // ===== 垂直堆叠 =====
  ['stack', '[&>*+*]:mt-4'],
  ['stack-lg', '[&>*+*]:mt-6'],
  ['stack-xl', '[&>*+*]:mt-10'],
]

export const theme = {
  colors: {
    'base': '#0F172A', // 主背景 - 深蓝黑
    'surface': '#1E293B', // 表面 - 略亮深蓝
    'surface-2': '#334155', // 表面 2 - 进一步提亮
    'ink': '#F1F5F9', // 主文字 - 近白
    'ink-2': '#94A3B8', // 次文字 - 中灰
    'cyan': '#22D3EE', // 极光 - 青
    'purple': '#A855F7', // 极光 - 紫
    'pink': '#EC4899', // 极光 - 粉
  },
}

export default defineConfig({
  presets: [
    // 原子化 CSS 基础预设（兼容 Tailwind / Windi 语法）
    presetUno(),

    // 图标预设（使用 Iconify 提供的开源图标库）
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),

    // Web 字体预设（自动从 Google Fonts 下载并自托管）
    presetWebFonts({
      provider: 'google',
      fonts: {
        // 标题 - 几何无衬线（强辨识度）
        display: [
          { name: 'Space Grotesk', weights: ['500', '600', '700'] },
        ],
        // 正文 - 现代人文无衬线（高可读性）
        body: [
          { name: 'DM Sans', weights: ['400', '500'] },
        ],
        // 代码 - 等宽（IDE 风格）
        mono: [
          { name: 'JetBrains Mono', weights: ['400', '500'] },
        ],
      },
    }),
  ],

  theme: {
    colors: {
      'base': '#0F172A',
      'surface': '#1E293B',
      'surface-2': '#334155',
      'ink': '#F1F5F9',
      'ink-2': '#94A3B8',
      'cyan': '#22D3EE',
      'purple': '#A855F7',
      'pink': '#EC4899',
    },
  },

  // 自定义快捷类（任务 I0 注入）
  // 与 prototype/assets/styles.css 中的 .glass / .gradient-text 等对应
  shortcuts,
})
