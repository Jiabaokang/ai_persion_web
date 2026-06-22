<script setup lang="ts">
useHead({ title: '智识花园 - 首页' })

const { data: health } = await useFetch('/api/health', {
  default: () => ({ status: 'loading', timestamp: '' }),
})
</script>

<template>
  <main class="min-h-screen px-6 py-16 max-w-3xl mx-auto">
    <header class="mb-12">
      <h1 class="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-cyan via-purple to-pink bg-clip-text text-transparent">
        智识花园
      </h1>
      <p class="text-lg text-ink-2">
        个人网站：笔记 / 灵感 / 博客 / 公众号
      </p>
    </header>

    <section class="space-y-6">
      <div class="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
        <h2 class="text-xl font-display font-semibold mb-2 text-ink">架构已就绪</h2>
        <p class="text-ink-2 mb-4">Nuxt 3 全栈项目，前后端分层清晰：</p>
        <ul class="space-y-1 text-ink-2 text-sm font-mono">
          <li>FE：pages / components / layouts / composables / assets / public</li>
          <li>BE：server/api / server/db / server/utils / server/middleware</li>
        </ul>
      </div>

      <div class="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
        <h2 class="text-xl font-display font-semibold mb-2 text-ink">服务健康检查</h2>
        <div v-if="health" class="font-mono text-sm">
          <p>状态：<span :class="health.status === 'ok' ? 'text-cyan' : 'text-pink'">{{ health.status }}</span></p>
          <p class="text-ink-2">时间戳：{{ health.timestamp }}</p>
        </div>
      </div>

      <div class="text-sm text-ink-2 font-mono">
        <p>后续任务：UnoCSS 设计令牌 (I0) → 布局组件 (I1) → Composables (I2) → 业务页面 → ...</p>
        <p class="mt-2">进度追踪：<a href="/docs/progress.md" class="text-cyan hover:underline">docs/progress.md</a></p>
      </div>
    </section>
  </main>
</template>
