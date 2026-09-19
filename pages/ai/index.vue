<script setup lang="ts">
interface AihotItem {
  id: string
  title: string
  summary: string
  source: string
  href: string
  originalHref: string
  publishedAt: string
  category: string
  score: number | null
  reason: string
}

interface AihotHotTopic {
  rank: number
  id: string
  title: string
  sourceCount: number
  storyId: string
}

interface AihotDaily {
  date: string
  generatedAt: string
  title: string
  leadParagraph: string
  sections: Array<{ label: string, items: unknown[] }>
  flashes: unknown[]
}

interface AihotReset {
  id: string
  title: string
  label: string
  status: string
  updatedAt: string
  occurredOn: string
}

interface AihotNavigationData {
  source: string
  fetchedAt: string
  items: AihotItem[]
  hotTopics: AihotHotTopic[]
  latestDaily: AihotDaily
  resets: AihotReset[]
  sync: { asOf: string, changeCount: number }
}

const categories = [
  { value: '', label: '全部资讯' },
  { value: 'ai-models', label: '模型' },
  { value: 'ai-products', label: '产品' },
  { value: 'industry', label: '行业' },
  { value: 'paper', label: '论文' },
  { value: 'tip', label: '教程' },
]

const categoryLabels = Object.fromEntries(categories.map(item => [item.value, item.label]))

useHead({
  title: 'AI 导航 · 智识花园',
  meta: [
    { name: 'description', content: '来自 AIHOT 的 AI 行业精选、热点与每日动态。' },
  ],
})

const { data, pending, error } = await useFetch<AihotNavigationData>('/api/ai-nav', {
  default: () => ({
    source: 'https://aihot.news/',
    fetchedAt: '',
    items: [],
    hotTopics: [],
    latestDaily: { date: '', generatedAt: '', title: '', leadParagraph: '', sections: [], flashes: [] },
    resets: [],
    sync: { asOf: '', changeCount: 0 },
  }),
})

const activeCategory = ref('')
const query = ref('')

const filteredItems = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  return (data.value?.items ?? []).filter((item) => {
    const matchesCategory = !activeCategory.value || item.category === activeCategory.value
    const matchesKeyword = !keyword
      || `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase().includes(keyword)
    return matchesCategory && matchesKeyword
  })
})

const updatedAt = computed(() => formatDate(data.value?.fetchedAt, {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}))

const dailyCount = computed(() => (data.value?.latestDaily.sections ?? [])
  .reduce((count, section) => count + section.items.length, data.value?.latestDaily.flashes.length ?? 0))

// 精选快照的同步水位，用于展示服务端增量同步到哪一刻。
const syncedAt = computed(() => formatDate(data.value?.sync.asOf, {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}))

// 将接口时间转换为本地中文日期，异常值直接隐藏。
function formatDate(value: string | undefined, options: Intl.DateTimeFormatOptions) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-CN', options).format(date)
}

// 清除搜索词并恢复当前分类下的完整资讯。
function clearQuery() {
  query.value = ''
}
</script>

<template>
  <!-- AI 导航主体：沿用暖纸视觉，采用分类、热点与时间流布局。 -->
  <div class="ai-news">
    <header class="ai-head">
      <div>
        <p class="paper-kicker">
          AI intelligence desk
        </p>
        <h1>AI 导航</h1>
        <p class="ai-head__intro">
          聚合值得关注的模型、产品、论文与行业动态。
        </p>
      </div>
      <p class="ai-head__meta">
        <span>{{ data?.items.length ?? 0 }} 条精选</span>
        <small v-if="updatedAt">更新于 {{ updatedAt }}</small>
      </p>
    </header>

    <!-- 分类与搜索区域 -->
    <section
      class="ai-controls"
      aria-label="资讯筛选"
    >
      <div
        class="ai-categories"
        role="group"
        aria-label="资讯分类"
      >
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          :class="{ 'is-active': activeCategory === category.value }"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>
      <label class="ai-search">
        <span
          class="i-carbon-search"
          aria-hidden="true"
        />
        <span class="sr-only">搜索 AI 资讯</span>
        <input
          v-model="query"
          type="search"
          placeholder="搜索标题、摘要或来源"
          autocomplete="off"
        >
        <button
          v-if="query"
          type="button"
          aria-label="清空搜索"
          @click="clearQuery"
        >
          <span
            class="i-carbon-close"
            aria-hidden="true"
          />
        </button>
      </label>
    </section>

    <div
      v-if="error"
      class="ai-state"
      role="alert"
    >
      <strong>AI 资讯暂时无法读取</strong>
      <span>请稍后刷新页面。</span>
    </div>
    <div
      v-else-if="pending && !data?.items.length"
      class="ai-state"
    >
      <span
        class="i-carbon-progress-bar-round ai-spin"
        aria-hidden="true"
      />
      <span>正在整理今日 AI 动态……</span>
    </div>

    <template v-else>
      <!-- 当前热点榜 -->
      <section
        v-if="data?.hotTopics.length"
        class="ai-hot"
        aria-labelledby="ai-hot-heading"
      >
        <header class="ai-section-head">
          <h2 id="ai-hot-heading">
            当前热点
          </h2>
          <NuxtLink to="/ai/daily">AI 日报归档 →</NuxtLink>
        </header>
        <ol>
          <li
            v-for="topic in data.hotTopics"
            :key="topic.id"
          >
            <span class="ai-hot__rank">{{ topic.rank }}</span>
            <NuxtLink :to="`/ai/${topic.id}`">
              {{ topic.title }}
            </NuxtLink>
            <small>{{ topic.sourceCount }} 个信源</small>
          </li>
        </ol>
      </section>

      <!-- 日报与 Codex 重置信息面板 -->
      <section
        class="ai-briefs"
        aria-label="AIHOT 专题信息"
      >
        <article
          v-if="data?.latestDaily.date"
          class="ai-brief"
        >
          <p class="paper-kicker">
            Daily briefing
          </p>
          <h2>AI 日报</h2>
          <time :datetime="data.latestDaily.date">{{ data.latestDaily.date }}</time>
          <h3>{{ data.latestDaily.title }}</h3>
          <p v-if="data.latestDaily.leadParagraph">
            {{ data.latestDaily.leadParagraph }}
          </p>
          <footer>
            <span>{{ dailyCount }} 条动态</span>
            <NuxtLink :to="`/ai/daily/${data.latestDaily.date}`">阅读日报 →</NuxtLink>
          </footer>
        </article>

        <article class="ai-brief">
          <p class="paper-kicker">
            Codex resets
          </p>
          <h2>Codex 重置动态</h2>
          <ul
            v-if="data?.resets.length"
            class="ai-resets"
          >
            <li
              v-for="reset in data.resets"
              :key="reset.id"
            >
              <span>{{ reset.label || reset.status }}</span>
              <strong>{{ reset.title }}</strong>
              <time :datetime="reset.updatedAt || reset.occurredOn">
                {{ formatDate(reset.updatedAt || reset.occurredOn, { month: '2-digit', day: '2-digit' }) }}
              </time>
            </li>
          </ul>
          <p
            v-else
            class="ai-brief__empty"
          >
            暂无重置动态
          </p>
        </article>
      </section>

      <!-- AI 资讯时间流 -->
      <section
        class="ai-feed"
        aria-labelledby="ai-feed-heading"
      >
        <header class="ai-section-head ai-feed__head">
          <div>
            <p class="paper-kicker">
              Selected timeline
            </p>
            <h2 id="ai-feed-heading">
              精选动态
            </h2>
          </div>
          <span>{{ filteredItems.length }} 条</span>
        </header>

        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="ai-item"
        >
          <time :datetime="item.publishedAt">
            {{ formatDate(item.publishedAt, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
          </time>
          <span
            class="ai-item__rail"
            aria-hidden="true"
          />
          <div class="ai-item__body">
            <header class="ai-item__meta">
              <span>{{ item.source }}</span>
              <span
                v-if="item.category"
                class="ai-item__category"
              >
                {{ categoryLabels[item.category] || '其他' }}
              </span>
              <span
                v-if="item.score !== null"
                class="ai-item__score"
              >AI 评分 {{ item.score }}/100</span>
            </header>
            <NuxtLink
              :to="`/ai/${item.id}`"
              class="ai-item__title"
            >{{ item.title }}</NuxtLink>
            <p
              v-if="item.summary"
              class="ai-item__summary"
            >
              {{ item.summary }}
            </p>
            <p
              v-if="item.reason"
              class="ai-item__reason"
            >
              <strong>推荐理由：</strong>{{ item.reason }}
            </p>
          </div>
        </article>

        <div
          v-if="!filteredItems.length"
          class="ai-state"
        >
          <strong>没有找到匹配资讯</strong>
          <button
            type="button"
            @click="clearQuery"
          >
            清空搜索
          </button>
        </div>
      </section>
    </template>

    <footer class="ai-footer">
      数据来源：AIHOT
      <span v-if="syncedAt"> · 精选同步于 {{ syncedAt }}</span>
      <span v-if="data?.sync.changeCount"> · 本轮 {{ data.sync.changeCount }} 项变化</span>
      · 内容版权归原作者所有
      <a
        :href="data?.source || 'https://aihot.news/'"
        target="_blank"
        rel="noopener noreferrer"
      >访问原站 ↗</a>
    </footer>
  </div>
</template>

<style scoped>
.ai-news { padding: 24px 0 72px; }
.ai-head { display: flex; align-items: end; justify-content: space-between; gap: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--rule-strong); }
.ai-head h1 { margin-top: 6px; font-size: clamp(3rem, 8vw, 6rem); font-weight: 500; letter-spacing: -0.055em; }
.ai-head__intro { max-width: 38em; margin-top: 14px; color: var(--ink-secondary); line-height: 1.75; }
.ai-head__meta { display: grid; justify-items: end; gap: 4px; padding-bottom: 8px; color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.72rem; }
.ai-head__meta small { color: var(--ink-muted); }
.ai-controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); gap: 22px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--rule-color); }
.ai-categories { display: flex; flex-wrap: wrap; gap: 4px; }
.ai-categories button { min-height: 40px; padding: 8px 12px; border-bottom: 2px solid transparent; color: var(--ink-secondary); font-size: 0.78rem; }
.ai-categories button:hover,
.ai-categories button.is-active { border-color: var(--accent-terracotta); color: var(--accent-terracotta-dark); }
.ai-search { display: flex; min-height: 44px; align-items: center; gap: 10px; padding: 0 12px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: var(--paper-surface); }
.ai-search:focus-within { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.ai-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink-primary); }
.ai-search button { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; color: var(--ink-muted); }
.ai-hot { margin-top: 28px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: rgba(248, 242, 231, 0.55); }
.ai-section-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 14px 18px; border-bottom: 1px solid var(--rule-color); }
.ai-section-head h2 { font-size: 1.15rem; font-weight: 600; }
.ai-section-head > a { color: var(--accent-moss); font-size: 0.72rem; font-weight: 700; }
.ai-hot ol { margin: 0; padding: 0; list-style: none; }
.ai-hot li { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px 18px; border-top: 1px solid var(--rule-color); }
.ai-hot li:first-child { border-top: 0; }
.ai-hot__rank { color: var(--accent-terracotta); font-family: var(--font-mono); font-weight: 700; }
.ai-hot a { font-family: var(--font-display); font-size: 0.92rem; line-height: 1.45; }
.ai-hot small { color: var(--ink-muted); font-size: 0.68rem; }
.ai-briefs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.ai-brief { padding: 22px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: rgba(248, 242, 231, 0.38); }
.ai-brief h2 { margin-top: 5px; font-size: 1.35rem; font-weight: 600; }
.ai-brief > time { display: block; margin-top: 18px; color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.7rem; }
.ai-brief h3 { margin-top: 8px; font-family: var(--font-display); font-size: 1.05rem; line-height: 1.5; }
.ai-brief > p:not(.paper-kicker, .ai-brief__empty) { margin-top: 10px; color: var(--ink-secondary); font-size: 0.78rem; line-height: 1.7; }
.ai-brief footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--rule-color); color: var(--ink-muted); font-size: 0.7rem; }
.ai-brief footer a { color: var(--accent-moss); font-weight: 700; }
.ai-resets { margin: 14px 0 0; padding: 0; list-style: none; }
.ai-resets li { display: grid; grid-template-columns: minmax(74px, auto) minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--rule-color); font-size: 0.72rem; }
.ai-resets span { color: var(--accent-moss); }
.ai-resets strong { font-weight: 500; }
.ai-resets time,
.ai-brief__empty { color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.66rem; }
.ai-feed { margin-top: 54px; }
.ai-feed__head { padding-right: 0; padding-left: 0; border-bottom-color: var(--rule-strong); }
.ai-feed__head h2 { margin-top: 4px; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 500; }
.ai-feed__head > span { color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.7rem; }
.ai-item { display: grid; grid-template-columns: 86px 16px minmax(0, 1fr); align-items: stretch; }
.ai-item > time { padding: 24px 12px 0 0; color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.66rem; text-align: right; }
.ai-item__rail { position: relative; border-left: 1px solid var(--rule-strong); }
.ai-item__rail::before { position: absolute; top: 28px; left: -4px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent-terracotta); content: ''; }
.ai-item__body { padding: 22px 0 26px 18px; border-bottom: 1px solid var(--rule-color); }
.ai-item__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--ink-muted); font-size: 0.68rem; }
.ai-item__category { padding: 2px 7px; border: 1px solid var(--rule-color); color: var(--accent-moss); }
.ai-item__score { margin-left: auto; color: var(--accent-moss); font-family: var(--font-mono); }
.ai-item__title { display: block; margin-top: 12px; font-family: var(--font-display); font-size: clamp(1.08rem, 2.2vw, 1.34rem); font-weight: 600; line-height: 1.5; }
.ai-item__title:hover { color: var(--accent-terracotta-dark); }
.ai-item__summary { margin-top: 9px; color: var(--ink-secondary); font-size: 0.83rem; line-height: 1.75; }
.ai-item__reason { margin-top: 11px; padding: 10px 12px; border-left: 2px solid var(--accent-moss); background: rgba(102, 118, 83, 0.07); color: var(--ink-secondary); font-size: 0.74rem; line-height: 1.65; }
.ai-item__reason strong { color: var(--accent-moss); }
.ai-state { display: grid; justify-items: center; gap: 10px; padding: 68px 20px; border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); text-align: center; }
.ai-state button { color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
.ai-spin { animation: ai-spin 0.9s linear infinite; }
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-muted); font-size: 0.68rem; }
.ai-footer a { margin-left: 8px; color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 760px) {
  .ai-head { align-items: start; flex-direction: column; }
  .ai-head__meta { justify-items: start; }
  .ai-controls { grid-template-columns: 1fr; }
  .ai-categories { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  .ai-categories button { flex: 0 0 auto; min-height: 44px; }
  .ai-hot li { grid-template-columns: 22px minmax(0, 1fr); }
  .ai-hot small { grid-column: 2; }
  .ai-briefs { grid-template-columns: 1fr; }
  .ai-resets li { grid-template-columns: minmax(70px, auto) minmax(0, 1fr); }
  .ai-resets time { grid-column: 2; }
  .ai-item { grid-template-columns: 16px minmax(0, 1fr); }
  .ai-item > time { grid-column: 2; padding: 20px 0 0 14px; text-align: left; }
  .ai-item__rail { grid-row: 1 / span 2; }
  .ai-item__body { padding-top: 8px; padding-left: 14px; }
  .ai-item__score { width: 100%; margin-left: 0; }
}
</style>
