<script setup lang="ts">
interface DailyArchive {
  items: Array<{
    date: string
    generatedAt: string
    title: string
    leadParagraph: string
  }>
}

useHead({ title: 'AI 日报 · 智识花园' })

const { data, error } = await useFetch<DailyArchive>('/api/ai-dailies', {
  default: () => ({ items: [] }),
})
</script>

<template>
  <!-- AI 日报归档 -->
  <div class="daily-index">
    <NuxtLink
      to="/ai"
      class="daily-index__back"
    >← 返回 AI 资讯</NuxtLink>
    <header>
      <p class="paper-kicker">
        Daily archive
      </p>
      <h1>AI 日报</h1>
      <p>按日期浏览 AIHOT 汇总的每日重点与快讯。</p>
    </header>

    <p
      v-if="error"
      class="daily-index__state"
    >
      日报暂时无法读取，请稍后再试。
    </p>
    <ol
      v-else
      class="daily-list"
    >
      <li
        v-for="daily in data?.items"
        :key="daily.date"
      >
        <time :datetime="daily.date">{{ daily.date }}</time>
        <div>
          <h2><NuxtLink :to="`/ai/daily/${daily.date}`">{{ daily.title }}</NuxtLink></h2>
          <p v-if="daily.leadParagraph">
            {{ daily.leadParagraph }}
          </p>
        </div>
        <NuxtLink
          :to="`/ai/daily/${daily.date}`"
          :aria-label="`阅读 ${daily.date} 日报`"
        >→</NuxtLink>
      </li>
    </ol>

    <footer class="daily-index__foot">
      数据来源：AIHOT · 内容版权归原作者所有
      <a
        href="https://aihot.news/"
        target="_blank"
        rel="noopener noreferrer"
      >aihot.news ↗</a>
    </footer>
  </div>
</template>

<style scoped>
.daily-index { padding: 0 0 40px; }
.daily-index__back { display: inline-flex; min-height: 44px; align-items: center; color: var(--accent-moss); font-size: 0.76rem; font-weight: 700; }
.daily-index > header { padding: 34px 0 30px; border-bottom: 1px solid var(--rule-strong); }
.daily-index h1 { margin-top: 6px; font-size: clamp(2rem, 4vw, 3rem); font-weight: 500; letter-spacing: -0.05em; }
.daily-index > header > p:last-child { margin-top: 12px; color: var(--ink-secondary); }
.daily-list { margin: 0; padding: 0; list-style: none; }
.daily-list li { display: grid; grid-template-columns: 110px minmax(0, 1fr) 30px; gap: 22px; align-items: start; padding: 26px 0; border-bottom: 1px solid var(--rule-color); }
.daily-list time { color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.72rem; }
.daily-list h2 { font-family: var(--font-display); font-size: 1.16rem; line-height: 1.5; }
.daily-list p { margin-top: 8px; color: var(--ink-secondary); font-size: 1rem; line-height: 1.7; }
.daily-list li > a { color: var(--accent-moss); font-size: 1.2rem; }
.daily-index__state { padding: 60px 0; color: var(--ink-secondary); text-align: center; }
.daily-index__foot { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-muted); font-size: 0.68rem; }
.daily-index__foot a { margin-left: 6px; color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 640px) {
  .daily-list li { grid-template-columns: 1fr 24px; gap: 8px 16px; }
  .daily-list time { grid-column: 1 / -1; }
}
</style>
