// 智识花园 - Vitest 配置
//
// 说明：
//   - 使用 happy-dom（轻量 DOM，比 jsdom 快 3-5x）
//   - 启用全局 API（describe/it/expect 等无需导入）
//   - 当前不依赖 Nuxt context（避免 pathe 兼容问题）
//   - 未来 Nuxt 组件测试用 @nuxt/test-utils/runtime 直接调用
//
// @see https://vitest.dev/

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 启用 Vue SFC 编译（必须，否则无法解析 .vue 文件）
  // @ts-expect-error @vitejs/plugin-vue 6.x 的 Vite 7 类型与 vitest 内置的 Vite 5 类型冲突，运行时正常
  plugins: [vue()],
  test: {
    // DOM 环境：happy-dom（轻量、快）
    environment: 'happy-dom',
    // 启用全局 API（describe/it/expect 等无需导入）
    globals: true,
    // 测试文件匹配
    include: ['tests/**/*.{test,spec}.ts'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        '.output/',
        'dist/',
        'coverage/',
      ],
    },
  },
})
