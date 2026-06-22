// 智识花园 - Nuxt 配置
//
// 架构概览：
//   - SSR 模式（默认），公开页面用 routeRules 切到 SSG
//   - UnoCSS 处理样式，VueUse 提供常用工具
//   - 密钥通过 runtimeConfig + 环境变量注入，public 字段才会暴露到客户端
//
// @see https://nuxt.com/docs/api/nuxt-config

export default defineNuxtConfig({
  // 兼容性日期：锁定 Nuxt 行为版本
  compatibilityDate: '2025-01-01',

  // 开发工具：浏览器中访问 /__nuxt_devtools__
  devtools: { enabled: true },

  // ========== 站点元信息 ==========
  app: {
    head: {
      // 文档语言：中文
      htmlAttrs: { lang: 'zh-CN' },
      // 默认标题（各页面可通过 useHead 覆盖）
      title: '智识花园',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '个人网站：笔记 / 灵感 / 博客 / 公众号' },
        // 支持深色模式（与系统主题同步）
        { name: 'color-scheme', content: 'light dark' },
      ],
    },
  },

  // ========== 模块 ==========
  modules: [
    // 原子化 CSS 引擎
    '@unocss/nuxt',
    // Vue 组合式工具库（自动导入）
    '@vueuse/nuxt',
  ],

  // ========== 全局 CSS ==========
  // 顺序敏感：先 tokens 后 main（main 可能引用 tokens 的变量）
  css: [
    '~/assets/css/tokens.css',  // 设计令牌（CSS 变量）
    '~/assets/css/main.css',    // 全局样式（重置 + 排版）
  ],

  // ========== 运行时配置 ==========
  // 服务端字段（sessionSecret/oss.*）只在 server/ 中可见
  // public 字段会打包到客户端，必须确保无敏感信息
  runtimeConfig: {
    // 会话密钥（必填，用于 cookie 签名）
    sessionSecret: process.env.NUXT_SESSION_SECRET || '',
    // SQLite 数据库文件路径
    dbPath: process.env.NUXT_DB_PATH || './data/ai-personal.db',
    // 阿里云 OSS 配置（任务 23 启用）
    oss: {
      region: process.env.NUXT_OSS_REGION || '',
      bucket: process.env.NUXT_OSS_BUCKET || '',
      accessKeyId: process.env.NUXT_OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.NUXT_OSS_ACCESS_KEY_SECRET || '',
    },
    // 客户端可见配置
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || '智识花园',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      authorName: process.env.NUXT_PUBLIC_AUTHOR_NAME || 'Anonymous',
    },
  },

  // ========== Nitro 服务端配置 ==========
  nitro: {
    // 部署目标：Node.js 服务器（适合阿里云 ECS）
    preset: 'node-server',
    // 存储层（未来用于：会话/缓存/上传临时区）
    storage: {},
  },

  // ========== TypeScript ==========
  typescript: {
    // 严格模式
    strict: true,
    // CI / 单独跑时启用，开发时关闭以加速
    typeCheck: false,
  },

  // ========== 实验性特性 ==========
  experimental: {
    // 公开页面 payload 提取（SSG 优化）
    payloadExtraction: true,
  },
})
