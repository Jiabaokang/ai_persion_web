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
  title: 'AI 资讯 · 智识花园',
  meta: [
    { name: 'description', content: '来自 AIHOT 的 AI 行业精选、热点与每日动态。' },
  ],
})

const { data, pending, error, refresh } = await useFetch<AihotNavigationData>('/api/ai-nav', {
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
  <!-- AI 资讯主体：沿用暖纸视觉，采用分类、热点与时间流布局。 -->
  <div class="ai-news">
    <header class="ai-head">
      <div>
        <h1>AI 资讯</h1>
        <p class="ai-head__intro">
          模型、产品与实践，每天读一点。
        </p>
      </div>
      <p class="ai-head__meta">
        <span>{{ data?.items.length ?? 0 }} 条精选</span>
        <small v-if="updatedAt">更新于 {{ updatedAt }}</small>
        <NuxtLink
          to="/ai/daily"
          class="paper-link"
        >阅读 AI 日报 →</NuxtLink>
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
          :aria-pressed="activeCategory === category.value"
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
      <button
        type="button"
        @click="refresh()"
      >
        重新读取
      </button>
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
      <details class="ai-extras">
        <summary>热点、日报与 Codex 动态</summary>
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
      </details>

      <!-- AI 资讯时间流 -->
      <section
        class="ai-feed"
        aria-labelledby="ai-feed-heading"
      >
        <header class="ai-section-head ai-feed__head">
          <div>
            <h2 id="ai-feed-heading">
              精选动态
            </h2>
          </div>
          <span>{{ filteredItems.length }} 条</span>
        </header>

        <article
          v-for="(item, index) in filteredItems"
          :key="item.id"
          class="ai-item"
        >
          <span
            class="ai-item__number"
            aria-hidden="true"
          >{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="ai-item__body">
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
            <div class="ai-item__meta">
              <time :datetime="item.publishedAt">{{ formatDate(item.publishedAt, { month: '2-digit', day: '2-digit' }) }}</time>
              <span
                v-if="item.category"
                class="ai-item__category"
              >{{ categoryLabels[item.category] || '其他' }}</span>
              <span class="ai-item__source">{{ item.source }}</span>
            </div>
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
.ai-news { padding: 0 0 32px; }
.ai-extras { border-bottom: 1px solid var(--rule-color); }
.ai-extras summary { min-height: 44px; padding: 12px 0; cursor: pointer; color: var(--ink-secondary); font-size: .85rem; }
.ai-extras[open] { padding-bottom: 24px; }
.ai-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--rule-strong); }
.ai-head h1 { margin-top: 6px; font-size: clamp(2rem, 4vw, 3rem); font-weight: 500; letter-spacing: -0.055em; }
.ai-head__intro { max-width: 38em; margin-top: 10px; color: var(--ink-secondary); line-height: 1.75; }
.ai-head__meta { display: grid; justify-items: end; gap: 4px; padding-bottom: 8px; color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.72rem; }
.ai-head__meta small { color: var(--ink-secondary); }
.ai-controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); gap: 22px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--rule-color); }
.ai-categories { display: flex; flex-wrap: wrap; gap: 4px; }
.ai-categories button { min-height: 44px; padding: 8px 12px; border-bottom: 2px solid transparent; color: var(--ink-secondary); font-size: .85rem; }
.ai-categories button:hover,
.ai-categories button.is-active { border-color: var(--accent-terracotta); color: var(--accent-terracotta-dark); }
.ai-search { display: flex; min-height: 44px; align-items: center; gap: 10px; padding: 0 12px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: var(--paper-surface); }
.ai-search:focus-within { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.ai-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink-primary); }
.ai-search button { display: inline-flex; width: 44px; height: 44px; align-items: center; justify-content: center; color: var(--ink-secondary); }
.ai-hot { margin-top: 28px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: rgba(248, 242, 231, 0.55); }
.ai-section-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 14px 18px; border-bottom: 1px solid var(--rule-color); }
.ai-section-head h2 { font-size: 1.15rem; font-weight: 600; }
.ai-section-head > a { color: var(--accent-moss); font-size: 0.72rem; font-weight: 700; }
.ai-hot ol { margin: 0; padding: 0; list-style: none; }
.ai-hot li { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px 18px; border-top: 1px solid var(--rule-color); }
.ai-hot li:first-child { border-top: 0; }
.ai-hot__rank { color: var(--accent-terracotta); font-family: var(--font-mono); font-weight: 700; }
.ai-hot a { font-family: var(--font-display); font-size: 0.92rem; line-height: 1.45; }
.ai-hot small { color: var(--ink-secondary); font-size: 0.68rem; }
.ai-briefs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.ai-brief { padding: 22px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: rgba(248, 242, 231, 0.38); }
.ai-brief h2 { margin-top: 5px; font-size: 1.35rem; font-weight: 600; }
.ai-brief > time { display: block; margin-top: 18px; color: var(--accent-terracotta-dark); font-family: var(--font-mono); font-size: 0.7rem; }
.ai-brief h3 { margin-top: 8px; font-family: var(--font-display); font-size: 1.05rem; line-height: 1.5; }
.ai-brief > p:not(.paper-kicker, .ai-brief__empty) { margin-top: 10px; color: var(--ink-secondary); font-size: .85rem; line-height: 1.7; }
.ai-brief footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--rule-color); color: var(--ink-secondary); font-size: 0.7rem; }
.ai-brief footer a { color: var(--accent-moss); font-weight: 700; }
.ai-resets { margin: 14px 0 0; padding: 0; list-style: none; }
.ai-resets li { display: grid; grid-template-columns: minmax(74px, auto) minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--rule-color); font-size: 0.72rem; }
.ai-resets span { color: var(--accent-moss); }
.ai-resets strong { font-weight: 500; }
.ai-resets time,
.ai-brief__empty { color: var(--ink-secondary); font-family: var(--font-mono); font-size: 0.66rem; }
.ai-feed { margin-top: 16px; }
.ai-feed__head { padding-right: 0; padding-left: 0; border-bottom-color: var(--rule-strong); }
.ai-feed__head h2 { margin-top: 0; font-size: clamp(1.4rem, 2.5vw, 1.8rem); font-weight: 500; }
.ai-feed__head > span { color: var(--ink-secondary); font-family: var(--font-mono); font-size: 0.7rem; }
.ai-item { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 22px; padding: 24px 0; border-bottom: 1px solid var(--rule-color); }
.ai-item__number { border-right: 1px solid var(--rule-color); color: var(--accent-terracotta-dark); font-family: var(--font-display); font-size: 2rem; font-style: italic; }
.ai-item__body { min-width: 0; }
.ai-item__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; color: var(--ink-secondary); font-size: .75rem; }
.ai-item__category { color: var(--accent-moss); }
.ai-item__source { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ai-item__title { display: block; font-family: var(--font-display); font-size: clamp(1.08rem, 2.2vw, 1.34rem); font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.ai-item__title:hover { color: var(--accent-terracotta-dark); }
.ai-item__summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 8px 0 10px; color: var(--ink-secondary); font-size: 1rem; line-height: 1.75; }
.ai-state { display: grid; justify-items: center; gap: 10px; padding: 68px 20px; border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); text-align: center; }
.ai-state button { color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
.ai-spin { animation: ai-spin 0.9s linear infinite; }
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-secondary); font-size: 0.68rem; }
.ai-footer a { margin-left: 8px; color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 760px) {
  .ai-head { align-items: start; flex-direction: column; gap: 8px; }
  .ai-head__intro { margin-bottom: 0; }
  .ai-head__meta { display: flex; flex-wrap: wrap; justify-items: start; gap: 8px 14px; padding: 0; margin: 0; }
  .ai-controls { grid-template-columns: 1fr; gap: 8px; }
  .ai-search { grid-row: 1; }
  .ai-categories { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  .ai-categories button { flex: 0 0 auto; min-height: 44px; }
  .ai-hot li { grid-template-columns: 22px minmax(0, 1fr); }
  .ai-hot small { grid-column: 2; }
  .ai-briefs { grid-template-columns: 1fr; }
  .ai-resets li { grid-template-columns: minmax(70px, auto) minmax(0, 1fr); }
  .ai-resets time { grid-column: 2; }
  .ai-item { grid-template-columns: 28px minmax(0, 1fr); gap: 14px; padding: 18px 0; }
  .ai-item__number { border: 0; font-size: 1.6rem; }
}
</style>
