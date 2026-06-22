<script setup lang="ts">
useHead({ title: '智识花园 - 个人网站' })

const { data: posts } = await useFetch<any[]>('/api/contents?status=published&visibility=public', {
  default: () => [],
})
const latest = computed(() => posts.value?.slice(0, 6) ?? [])
</script>

<template>
  <div class="container section">
    <header class="text-center mb-16">
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 gradient-text">
        智识花园
      </h1>
      <p class="text-lg md:text-xl text-ink-2 max-w-2xl mx-auto">
        个人网站：笔记 / 灵感 / 博客 / 公众号<br>
        用好奇心浇灌的小角落，慢慢写，慢慢长。
      </p>
    </header>

    <section class="mb-16">
      <h2 class="text-2xl font-display font-semibold mb-6 text-ink">
        最新文章
      </h2>
      <div class="stack-lg">
        <article
          v-for="p in latest"
          :key="p.slug"
          class="glass p-6 hover:translate-y-[-2px] transition"
        >
          <h3 class="text-xl font-display font-semibold mb-2 text-ink">
            <NuxtLink
              :to="`/${p.type}/${p.slug}`"
              class="hover:text-cyan transition"
            >
              {{ p.title }}
            </NuxtLink>
          </h3>
          <p
            v-if="p.summary"
            class="text-ink-2 mb-3"
          >
            {{ p.summary }}
          </p>
          <div class="flex items-center justify-between text-sm">
            <time class="text-ink-2 font-mono">
              {{ p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '' }}
            </time>
            <span
              v-if="p.readingTime"
              class="text-ink-2"
            >· {{ p.readingTime }} 分钟</span>
          </div>
        </article>
      </div>
      <div
        v-if="!latest.length"
        class="text-center py-12 text-ink-2"
      >
        还没有文章
      </div>
    </section>

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
