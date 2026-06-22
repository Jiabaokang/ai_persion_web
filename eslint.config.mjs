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
      // 未使用变量：警告（_ 开头忽略）
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
