// 智识花园 - Vitest 配置
//
// 说明：
//   - 使用 happy-dom（轻量 DOM，比 jsdom 快 3-5x）
//   - 通过 @nuxt/test-utils/config 启用 Nuxt 测试能力
//   - 未来任务 21（E2E）可能切换到 playwright
//
// @see https://vitest.dev/
// @see https://nuxt.com/docs/getting-started/testing

import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
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
