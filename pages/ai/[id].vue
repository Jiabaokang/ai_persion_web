<script setup lang="ts">
interface AihotReport {
  id: string
  title: string
  summary: string
  source: string
  firstParty: boolean
  publishedAt: string
  originalHref: string
}

interface AihotDetail {
  item: {
    id: string
    title: string
    summary: string
    source: string
    originalHref: string
    publishedAt: string
    category: string
    score: number | null
    reason: string
  }
  story: null | {
    publicId: string
    title: string
    status: 'active' | 'settled'
    sourceCount: number
    reportCount: number
    firstReportAt: string
    latestAt: string
    latest: string
    digest: string
    reports: AihotReport[]
  }
}

const categoryLabels: Record<string, string> = {
  'ai-models': '模型',
  'ai-products': '产品',
  'industry': '行业',
  'paper': '论文',
  'tip': '教程',
}

const route = useRoute()
const id = String(route.params.id ?? '')
const { data, error } = await useFetch<AihotDetail>(`/api/ai-items/${encodeURIComponent(id)}`)

if (error.value || !data.value) {
  throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '未找到这条 AI 资讯' })
}

const detail = data.value
const item = detail.item
const story = detail.story
const categoryLabel = categoryLabels[item.category] || '其他'

useHead({
  title: `${item.title} · 智识花园`,
  meta: [
    { name: 'description', content: item.summary || '来自 AIHOT 的 AI 行业资讯详情。' },
  ],
})

// 将上游时间统一转换为本站中文阅读格式。
function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
</script>

<template>
  <!-- 本站 AI 资讯详情：阅读过程完全留在站内，只把原始信源作为外链。 -->
  <article class="ai-detail">
    <nav
      class="ai-detail__nav"
      aria-label="返回链接"
    >
      <NuxtLink
        to="/ai"
        class="ai-detail__back"
      >← 返回 AI 资讯</NuxtLink>
      <NuxtLink
        v-if="story"
        to="/ai/daily"
        class="ai-detail__back"
      >日报归档</NuxtLink>
    </nav>

    <header class="ai-detail__head">
      <div class="ai-detail__badges">
        <span>{{ categoryLabel }}</span>
        <span v-if="item.score !== null">AI 评分 {{ item.score }}/100</span>
      </div>
      <h1>{{ item.title }}</h1>
      <p class="ai-detail__meta">
        <span>{{ item.source }}</span>
        <time
          v-if="item.publishedAt"
          :datetime="item.publishedAt"
        >{{ formatDate(item.publishedAt) }}</time>
        <a
          v-if="item.originalHref"
          :href="item.originalHref"
          target="_blank"
          rel="noopener noreferrer"
        >查看原始信源 ↗</a>
      </p>
    </header>

    <section
      v-if="item.summary"
      class="ai-detail__lead"
      aria-labelledby="ai-guide-heading"
    >
      <p class="paper-kicker">
        AI guide
      </p>
      <h2 id="ai-guide-heading">
        AI 导读
      </h2>
      <p>{{ item.summary }}</p>
    </section>

    <aside
      v-if="item.reason"
      class="ai-detail__reason"
    >
      <strong>推荐理由</strong>
      <p>{{ item.reason }}</p>
    </aside>

    <!-- 热点事件聚合区：同一事件的跨信源报道按时间排列 -->
    <section
      v-if="story"
      class="ai-story"
      aria-labelledby="story-heading"
    >
      <header>
        <div>
          <p class="paper-kicker">
            Story tracking
          </p>
          <h2 id="story-heading">
            事件追踪
          </h2>
        </div>
        <span>
          {{ story.status === 'settled' ? '已沉淀' : '进行中' }}
          · {{ story.sourceCount }} 个信源 · {{ story.reportCount }} 篇报道
        </span>
      </header>

      <p
        v-if="story.digest"
        class="ai-story__digest"
      >
        {{ story.digest }}
      </p>
      <p
        v-if="story.latest"
        class="ai-story__latest"
      >
        <strong>最新进展：</strong>{{ story.latest }}
      </p>

      <h3>事件时间线</h3>
      <ol class="ai-timeline">
        <li
          v-for="report in story.reports"
          :key="report.id"
        >
          <time :datetime="report.publishedAt">{{ formatDate(report.publishedAt) }}</time>
          <div>
            <p class="ai-timeline__source">
              {{ report.source }}
              <span v-if="report.firstParty">一手信源</span>
            </p>
            <h4>{{ report.title }}</h4>
            <p v-if="report.summary">
              {{ report.summary }}
            </p>
            <a
              v-if="report.originalHref"
              :href="report.originalHref"
              target="_blank"
              rel="noopener noreferrer"
            >阅读原始报道 ↗</a>
          </div>
        </li>
      </ol>
    </section>

    <p
      v-else-if="!item.summary"
      class="ai-detail__fallback"
    >
      这条资讯来自 AIHOT 热点榜，暂时没有更完整的摘要；可前往原始信源阅读全文。
    </p>

    <footer class="ai-detail__foot">
      数据来源：AIHOT
      <a
        href="https://aihot.news/"
        target="_blank"
        rel="noopener noreferrer"
      >aihot.news ↗</a>
      · 内容版权归原作者所有
    </footer>
  </article>
</template>

<style scoped>
.ai-detail { max-width: 860px; padding: 0 0 40px; }
.ai-detail__nav { display: flex; min-height: 44px; align-items: center; justify-content: space-between; gap: 20px; }
.ai-detail__back { display: inline-flex; min-height: 44px; align-items: center; color: var(--accent-moss); font-size: 0.76rem; font-weight: 700; }
.ai-detail__head { padding: 20px 0 24px; border-bottom: 1px solid var(--rule-strong); }
.ai-detail__badges { display: flex; flex-wrap: wrap; gap: 8px; }
.ai-detail__badges span { padding: 4px 8px; border: 1px solid var(--rule-color); color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.66rem; }
.ai-detail h1 { max-width: 17em; margin-top: 18px; font-size: clamp(1.7rem, 3.4vw, 3rem); font-weight: 500; letter-spacing: -0.045em; line-height: 1.18; }
.ai-detail__meta { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: 22px; color: var(--ink-muted); font-size: 0.72rem; }
.ai-detail__meta a { color: var(--accent-moss); font-weight: 700; }
.ai-detail__lead { margin-top: 24px; padding: 28px; border: 1px solid var(--rule-strong); background: rgba(248, 242, 231, 0.5); }
.ai-detail__lead h2,
.ai-story h2 { margin-top: 6px; font-size: 1.55rem; font-weight: 600; }
.ai-detail__lead > p:last-child { margin-top: 18px; font-family: var(--font-display); font-size: 1.08rem; line-height: 1.9; }
.ai-detail__reason { margin-top: 22px; padding: 18px 22px; border-left: 3px solid var(--accent-moss); background: rgba(102, 118, 83, 0.07); }
.ai-detail__reason strong { color: var(--accent-moss); font-size: 0.78rem; }
.ai-detail__reason p { margin-top: 7px; color: var(--ink-secondary); line-height: 1.75; }
.ai-detail__fallback { margin-top: 34px; padding: 16px 18px; border: 1px dashed var(--rule-strong); color: var(--ink-muted); font-size: 0.78rem; line-height: 1.7; }
.ai-story { margin-top: 60px; }
.ai-story > header { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--rule-strong); }
.ai-story > header > span { color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.68rem; }
.ai-story__digest { margin-top: 22px; font-family: var(--font-display); font-size: 1.05rem; line-height: 1.85; }
.ai-story__latest { margin-top: 14px; padding: 13px 15px; border: 1px solid var(--rule-color); color: var(--ink-secondary); line-height: 1.7; }
.ai-story__latest strong { color: var(--accent-terracotta-dark); }
.ai-story h3 { margin-top: 38px; font-size: 1.15rem; }
.ai-timeline { margin: 18px 0 0; padding: 0; list-style: none; }
.ai-timeline li { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 24px; padding: 22px 0; border-top: 1px solid var(--rule-color); }
.ai-timeline time { color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.66rem; }
.ai-timeline__source { color: var(--accent-moss); font-size: 0.7rem; }
.ai-timeline__source span { margin-left: 8px; padding: 2px 5px; border: 1px solid var(--accent-moss); }
.ai-timeline h4 { margin-top: 6px; font-family: var(--font-display); font-size: 1.05rem; line-height: 1.5; }
.ai-timeline div > p:not(.ai-timeline__source) { margin-top: 8px; color: var(--ink-secondary); font-size: 1rem; line-height: 1.75; }
.ai-timeline a { display: inline-block; margin-top: 10px; color: var(--accent-terracotta-dark); font-size: 0.72rem; text-decoration: underline; text-underline-offset: 3px; }
.ai-detail__foot { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-muted); font-size: 0.68rem; }
.ai-detail__foot a { margin-left: 6px; color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 640px) {
  .ai-detail__lead { padding: 22px 18px; }
  .ai-story > header { align-items: start; flex-direction: column; }
  .ai-timeline li { grid-template-columns: 1fr; gap: 7px; }
}
</style>
