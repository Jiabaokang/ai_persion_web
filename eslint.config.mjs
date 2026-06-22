// 智识花园 - ESLint 配置（基础版）
//
// 说明：
//   - 当前为任务 0 阶段的最小可用配置（纯 JS 规则）
//   - 完整版（含 Vue + TypeScript + Nuxt 规则）将在任务 2 升级
//   - 使用 ESLint 9 的 flat config 格式
//
// @see https://eslint.org/docs/latest/use/configure/configuration-files

export default [
  {
    // 公共配置
    languageOptions: {
      // ES2024 + ESM 模块
      ecmaVersion: 2024,
      sourceType: 'module',
      // 全局变量声明（Nuxt 3 / Vue 3 / Vitest 等自动导入的 API）
      globals: {
        // Nuxt 3 自动导入 - 配置相关
        defineNuxtConfig: 'readonly',
        defineNuxtPlugin: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        // Nuxt 3 自动导入 - 组合式 API
        useRuntimeConfig: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useState: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        navigateTo: 'readonly',
        // Nuxt 3 自动导入 - 服务端
        defineEventHandler: 'readonly',
        defineNitroPlugin: 'readonly',
        readBody: 'readonly',
        getQuery: 'readonly',
        getRouterParam: 'readonly',
        createError: 'readonly',
        getHeader: 'readonly',
        setHeader: 'readonly',
        // Vue 3 自动导入
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        defineModel: 'readonly',
        withDefaults: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUnmount: 'readonly',
        nextTick: 'readonly',
        // UnoCSS 自动导入
        defineConfig: 'readonly',
        presetUno: 'readonly',
        presetIcons: 'readonly',
        presetWebFonts: 'readonly',
        // Node.js
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        // Vitest 测试全局
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        // 浏览器全局
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    rules: {
      // 未使用变量：警告（_ 开头忽略）
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // 未定义变量：错误（catch 会用到 error 变量）
      'no-undef': 'error',
    },
  },
  // 忽略目录
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'coverage/**',
      'pnpm-lock.yaml',
    ],
  },
]
