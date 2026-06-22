// 智识花园 - ESLint 配置（Nuxt 官方）
//
// 使用 @nuxt/eslint 模块生成的配置作为基础
// withNuxt 接受多个 config 块，按顺序追加
// @see https://eslint.nuxt.com/

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // 1) 项目级 ignores（在 Nuxt 默认规则之前优先匹配）
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      'pnpm-lock.yaml',
      // 玻璃感 HTML 原型（参考用，不参与构建）
      'prototype/**',
    ],
  },
  // 2) 项目级自定义规则
  {
    rules: {
      // 允许单字组件名（如 `<Header>` 简写为 `<Header />` 即可）
      'vue/multi-word-component-names': 'off',
      // 服务端渲染的 Markdown HTML 内容安全（无用户输入 XSS 风险）
      'vue/no-v-html': 'off',
      // 未使用变量：警告（_ 开头忽略）
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // 3) 测试文件放宽 any 类型（mock/config 绕过类型窄化）
  {
    files: ['tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // 4) Vue 页面模板放宽 any（useFetch 返回动态数据）
  {
    files: ['pages/**/*.vue', 'components/**/*.vue', 'layouts/**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // 5) 服务器中间件放宽 any（H3 event 类型）
  {
    files: ['server/middleware/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
