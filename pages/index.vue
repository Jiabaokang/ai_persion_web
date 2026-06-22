<script setup lang="ts">
/**
 * 首页
 * 结构：Hero + 最新文章（mock）+ 标签云 + 关于
 * 任务 18 将从 API 拉取真实数据
 */

useHead({ title: '智识花园 - 个人网站' })

const recentPosts = [
  {
    title: '在阿里云 ECS 上部署 Nuxt 3 全栈应用',
    excerpt: '从零搭建：PM2 + nginx + HTTPS + 自动备份。2 核 2G 跑得动，预算 < 20 元/月。',
    date: '2026-06-20',
    slug: 'deploy-nuxt-on-aliyun-ecs',
    tags: ['DevOps', 'Nuxt', '阿里云'],
  },
  {
    title: '玻璃感设计：从 prototype 到 Nuxt 组件',
    excerpt: '把 HTML 原型拆成可复用的 Vue 组件，UnoCSS shortcuts 替代重复样式。',
    date: '2026-06-18',
    slug: 'glass-design-nuxt-migration',
    tags: ['设计', 'Vue', 'UnoCSS'],
  },
  {
    title: 'SQLite + Drizzle：个人项目的轻量数据库方案',
    excerpt: '单文件数据库 + FTS5 全文搜索 + 每日备份到 OSS。1 万篇文章毫无压力。',
    date: '2026-06-15',
    slug: 'sqlite-drizzle-personal-site',
    tags: ['数据库', 'Drizzle', 'SQLite'],
  },
]

const tags = ['DevOps', 'Nuxt', 'Vue', 'TypeScript', 'UnoCSS', '设计', '数据库', 'SQLite', '阿里云', '效率']
</script>

<template>
  <div class="container section">
    <!-- Hero -->
    <header class="text-center mb-16">
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 gradient-text">
        智识花园
      </h1>
      <p class="text-lg md:text-xl text-ink-2 max-w-2xl mx-auto">
        个人网站：笔记 / 灵感 / 博客 / 公众号<br>
        用好奇心浇灌的小角落，慢慢写，慢慢长。
      </p>
    </header>

    <!-- 最新文章 -->
    <section class="mb-16">
      <h2 class="text-2xl font-display font-semibold mb-6 text-ink">
        最新文章
      </h2>
      <div class="stack-lg">
        <article
          v-for="post in recentPosts"
          :key="post.slug"
          class="glass p-6 hover:translate-y-[-2px] transition"
        >
          <h3 class="text-xl font-display font-semibold mb-2 text-ink">
            <NuxtLink
              :to="`/blog/${post.slug}`"
              class="hover:text-cyan transition"
            >
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p class="text-ink-2 mb-3">
            {{ post.excerpt }}
          </p>
          <div class="flex items-center justify-between text-sm">
            <time class="text-ink-2 font-mono">{{ post.date }}</time>
            <div class="flex gap-2">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="px-2 py-0.5 rounded-full bg-white/5 text-ink-2 text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 标签云 -->
    <section class="mb-16">
      <h2 class="text-2xl font-display font-semibold mb-6 text-ink">
        标签
      </h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="px-3 py-1.5 rounded-full glass text-ink-2 text-sm cursor-pointer hover:text-cyan transition"
        >
          #{{ tag }}
        </span>
      </div>
    </section>

    <!-- 关于 -->
    <section class="glass-strong p-8 text-center">
      <h2 class="text-2xl font-display font-semibold mb-4 text-ink">
        关于
      </h2>
      <p class="text-ink-2 max-w-2xl mx-auto">
        这里记录我的技术笔记、灵感碎片和长文思考。
        玻璃感 + 极光设计，深色优先，响应式适配移动端。
        后端 SQLite + Drizzle，前端 Nuxt 3 + UnoCSS，部署阿里云 2C2G。
      </p>
    </section>
  </div>
</template>
