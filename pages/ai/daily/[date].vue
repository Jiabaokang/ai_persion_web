<script setup lang="ts">
interface DailyItem {
  id: string
  title: string
  summary: string
  source: string
  originalHref: string
  publishedAt: string
}

interface DailyDetail {
  date: string
  generatedAt: string
  title: string
  leadParagraph: string
  sections: Array<{ label: string, items: DailyItem[] }>
  flashes: DailyItem[]
}

const route = useRoute()
const date = String(route.params.date ?? '')
const { data, error } = await useFetch<DailyDetail>(`/api/ai-dailies/${encodeURIComponent(date)}`)

if (error.value || !data.value) {
  throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '未找到这份 AI 日报' })
}

useHead({ title: () => `${data.value?.date || ''} AI 日报 · 智识花园` })
</script>

<template>
  <!-- 单日 AI 简报 -->
  <article
    v-if="data"
    class="daily-detail"
  >
    <nav
      class="daily-detail__nav"
      aria-label="返回链接"
    >
      <NuxtLink to="/ai">← AI 资讯</NuxtLink>
      <NuxtLink to="/ai/daily">日报归档</NuxtLink>
    </nav>

    <header class="daily-detail__head">
      <p class="paper-kicker">
        AI daily briefing
      </p>
      <time :datetime="data.date">{{ data.date }}</time>
      <h1>{{ data.title }}</h1>
      <p v-if="data.leadParagraph">
        {{ data.leadParagraph }}
      </p>
    </header>

    <section
      v-for="section in data.sections"
      :key="section.label"
      class="daily-section"
    >
      <h2>{{ section.label }}</h2>
      <article
        v-for="item in section.items"
        :key="item.id || item.title"
        class="daily-item"
      >
        <p class="daily-item__source">
          {{ item.source }}
        </p>
        <h3>
          <NuxtLink
            v-if="item.id"
            :to="`/ai/${item.id}`"
          >{{ item.title }}</NuxtLink>
          <span v-else>{{ item.title }}</span>
        </h3>
        <p v-if="item.summary">
          {{ item.summary }}
        </p>
        <a
          v-if="item.originalHref"
          :href="item.originalHref"
          target="_blank"
          rel="noopener noreferrer"
        >原始信源 ↗</a>
      </article>
    </section>

    <section
      v-if="data.flashes.length"
      class="daily-section"
    >
      <h2>快讯</h2>
      <article
        v-for="item in data.flashes"
        :key="item.id || item.title"
        class="daily-item"
      >
        <p class="daily-item__source">
          {{ item.source }}
        </p>
        <h3>
          <NuxtLink
            v-if="item.id"
            :to="`/ai/${item.id}`"
          >{{ item.title }}</NuxtLink>
          <span v-else>{{ item.title }}</span>
        </h3>
        <p v-if="item.summary">
          {{ item.summary }}
        </p>
      </article>
    </section>

    <footer class="daily-detail__foot">
      数据来源：AIHOT · 内容版权归原作者所有
      <a
        href="https://aihot.news/"
        target="_blank"
        rel="noopener noreferrer"
      >aihot.news ↗</a>
    </footer>
  </article>
</template>

<style scoped>
.daily-detail { max-width: 860px; padding: 0 0 40px; }
.daily-detail__nav { display: flex; min-height: 44px; align-items: center; justify-content: space-between; gap: 20px; color: var(--accent-moss); font-size: 0.76rem; font-weight: 700; }
.daily-detail__head { padding: 20px 0 24px; border-bottom: 1px solid var(--rule-strong); }
.daily-detail__head time { display: block; margin-top: 18px; color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.75rem; }
.daily-detail h1 { max-width: 18em; margin-top: 10px; font-size: clamp(1.7rem, 3.4vw, 3rem); font-weight: 500; letter-spacing: -0.04em; line-height: 1.2; }
.daily-detail__head > p:last-child { max-width: 44em; margin-top: 18px; color: var(--ink-secondary); font-family: var(--font-display); font-size: 1.02rem; line-height: 1.8; }
.daily-section { margin-top: 48px; }
.daily-section > h2 { padding-bottom: 12px; border-bottom: 1px solid var(--rule-strong); font-size: 1.45rem; font-weight: 600; }
.daily-item { padding: 24px 0; border-bottom: 1px solid var(--rule-color); }
.daily-item__source { color: var(--accent-moss); font-size: 0.7rem; }
.daily-item h3 { margin-top: 7px; font-family: var(--font-display); font-size: 1.14rem; line-height: 1.5; }
.daily-item > p:not(.daily-item__source) { margin-top: 8px; color: var(--ink-secondary); font-size: 1rem; line-height: 1.75; }
.daily-item > a { display: inline-block; margin-top: 10px; color: var(--accent-terracotta-dark); font-size: 0.72rem; text-decoration: underline; text-underline-offset: 3px; }
.daily-detail__foot { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-muted); font-size: 0.68rem; }
.daily-detail__foot a { margin-left: 6px; color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
</style>
