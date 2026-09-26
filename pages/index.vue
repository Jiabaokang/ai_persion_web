<script setup lang="ts">
useHead({
  title: '智识花园 · 阅读、实践、留下笔记',
  meta: [{ name: 'description', content: '我的 AI 阅读与技术手记，把读过的变成自己的。' }],
})

const { data: news, status: newsStatus, error: newsError, refresh: refreshNews } = await useFetch('/api/ai-nav', {
  key: 'garden-ai-preview', lazy: true,
})
const { data: entries, error: entriesError, refresh: refreshEntries } = await useFetch<any[]>('/api/contents', {
  query: { status: 'published', visibility: 'public' },
  default: () => [],
})
const notes = computed(() => entries.value.filter(item => item.type === 'note'))
const articles = computed(() => entries.value.filter(item => item.type === 'blog').slice(0, 2))
const activeTag = ref('')
const tags = computed(() => [...new Set<string>(notes.value.flatMap(item => (item.tags || []).map((tag: { name: string }) => tag.name)))].slice(0, 3))
const visibleNotes = computed(() => notes.value.filter(item => !activeTag.value || item.tags?.some((tag: { name: string }) => tag.name === activeTag.value)).slice(0, 2))

// 使用资讯自身的日期，避免把较早发布的内容标成今日新闻。
function newsDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date)
}
</script>

<template>
  <!-- 个人阅读首页：AI 资讯优先，笔记和文章承接沉淀。 -->
  <div class="garden-home">
    <header class="garden-intro">
      <div>
        <h1>把读过的，变成自己的。</h1>
        <p>在技术的流动中，找到自己的节奏。<br>这里记录我的 AI 阅读、实践与思考。</p>
      </div>
      <img
        src="/images/20260921142000_水墨枝叶.webp"
        alt=""
        width="116"
        height="142"
      >
    </header>

    <!-- 只显示真实接口数据，读取失败不影响下面的个人内容。 -->
    <section
      class="garden-section"
      aria-labelledby="garden-news-title"
    >
      <header class="garden-section__head">
        <h2 id="garden-news-title">
          今日 AI 资讯
        </h2>
        <NuxtLink to="/ai">全部资讯 <span aria-hidden="true">→</span></NuxtLink>
      </header>
      <div
        v-if="newsError"
        class="garden-state"
        role="alert"
      >
        <p>资讯暂时没有送达，稍后再来看看。</p>
        <button
          type="button"
          class="paper-link"
          @click="refreshNews()"
        >
          重新读取
        </button>
      </div>
      <p
        v-else-if="newsStatus === 'pending' && !news"
        class="garden-state"
        role="status"
      >
        正在整理 AI 资讯……
      </p>
      <ol
        v-else-if="news?.items.length"
        class="garden-news"
      >
        <li
          v-for="(item, index) in news.items.slice(0, 3)"
          :key="item.id"
        >
          <span
            class="garden-news__number"
            aria-hidden="true"
          >{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h3><NuxtLink :to="`/ai/${item.id}`">{{ item.title }}</NuxtLink></h3>
            <p
              v-if="item.summary"
              class="garden-news__summary"
            >
              {{ item.summary }}
            </p>
            <div class="garden-news__meta">
              <time :datetime="item.publishedAt">{{ newsDate(item.publishedAt) }}</time>
              <span>{{ item.source }}</span>
            </div>
          </div>
        </li>
      </ol>
      <p
        v-else
        class="garden-state"
      >
        暂时没有新的资讯。
      </p>
      <p class="garden-source">
        数据来源：AIHOT · 内容版权归原作者所有
      </p>
    </section>

    <!-- 公开笔记按已有标签筛选，保留私密内容原有访问边界。 -->
    <section
      class="garden-section"
      aria-labelledby="garden-notes-title"
    >
      <header class="garden-section__head">
        <div>
          <h2 id="garden-notes-title">
            笔记正在生长
          </h2>
          <p>记录实践中的思考，留下下次用得上的线索。</p>
        </div>
        <NuxtLink to="/notes">全部笔记 <span aria-hidden="true">→</span></NuxtLink>
      </header>
      <div
        v-if="tags.length"
        class="garden-tags"
        role="group"
        aria-label="笔记主题"
      >
        <button
          type="button"
          :aria-pressed="!activeTag"
          @click="activeTag = ''"
        >
          全部
        </button>
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          :aria-pressed="activeTag === tag"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
      </div>
      <div
        v-if="entriesError"
        class="garden-state"
        role="alert"
      >
        <p>笔记暂时无法读取。</p>
        <button
          type="button"
          class="paper-link"
          @click="refreshEntries()"
        >
          重试
        </button>
      </div>
      <ContentList
        v-else-if="visibleNotes.length"
        :items="visibleNotes"
        density="compact"
        class="garden-notes"
      />
      <p
        v-else
        class="garden-state"
      >
        一些想法还在酝酿，公开笔记会慢慢更新。
      </p>
    </section>

    <section
      v-if="articles.length"
      class="garden-section"
      aria-labelledby="garden-articles-title"
    >
      <header class="garden-section__head">
        <h2 id="garden-articles-title">
          写得长一点
        </h2>
        <NuxtLink to="/blog">全部文章 <span aria-hidden="true">→</span></NuxtLink>
      </header>
      <ContentList
        :items="articles"
        density="compact"
      />
    </section>
  </div>
</template>

<style scoped>
.garden-intro { display: flex; min-height: 144px; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 32px; padding-bottom: 28px; border-bottom: 1px solid var(--rule-color); }
.garden-intro h1 { display: inline; border-bottom: 2px solid var(--accent-terracotta); padding-bottom: 10px; font-size: clamp(1.7rem, 3vw, 2.5rem); font-weight: 500; line-height: 1.8; letter-spacing: .02em; }
.garden-intro p { margin: 22px 0 0; color: var(--ink-secondary); font-size: .9rem; }
.garden-intro img { width: 116px; height: 142px; flex: 0 0 auto; object-fit: contain; mix-blend-mode: multiply; }
.garden-section + .garden-section { margin-top: 36px; }
.garden-section__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 16px; }
.garden-section__head h2 { font-size: clamp(1.45rem, 2.5vw, 2rem); font-weight: 600; }
.garden-section__head p { margin: 8px 0 0; color: var(--ink-secondary); font-size: .9rem; }
.garden-section__head > a { display: inline-flex; min-height: 44px; align-items: center; gap: 8px; flex-shrink: 0; color: var(--accent-terracotta-dark); font-size: .85rem; }
.garden-news { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--rule-color); }
.garden-news li { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 24px; padding: 24px 0; border-bottom: 1px solid var(--rule-color); }
.garden-news__number { border-right: 1px solid var(--rule-color); color: var(--accent-terracotta-dark); font-family: var(--font-display); font-size: 2.2rem; font-style: italic; line-height: 1.3; }
.garden-news h3 { font-size: 1.25rem; line-height: 1.5; text-wrap: pretty; }
.garden-news h3 a:hover { color: var(--accent-terracotta-dark); }
.garden-news__summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 8px 0; color: var(--ink-secondary); font-size: 1rem; line-height: 1.7; }
.garden-news__meta { display: flex; flex-wrap: wrap; gap: 4px 12px; color: var(--ink-secondary); font-size: .75rem; }
.garden-news__meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.garden-source { margin: 12px 0 0; color: var(--ink-secondary); font-size: .7rem; }
.garden-tags { display: flex; gap: 12px; overflow-x: auto; margin-bottom: 12px; }
.garden-tags button { flex-shrink: 0; min-height: 44px; padding: 8px 12px; color: var(--ink-secondary); border-bottom: 2px solid transparent; }
.garden-tags button[aria-pressed='true'] { color: var(--accent-terracotta-dark); border-color: currentColor; }
.garden-state { padding: 28px 0; border-top: 1px solid var(--rule-color); color: var(--ink-secondary); }
.garden-state button { min-height: 44px; }
.garden-notes :deep(.content-list__item) { padding-block: 22px; }
@media (min-width: 1100px) {
  .garden-notes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
}
@media (max-width: 600px) {
  .garden-intro { min-height: 108px; gap: 10px; margin-bottom: 24px; padding-bottom: 20px; }
  .garden-intro h1 { font-size: 1.3rem; letter-spacing: 0; padding-bottom: 6px; }
  .garden-intro p { margin-top: 16px; font-size: .78rem; }
  .garden-intro img { width: 60px; height: 90px; }
  .garden-section__head { gap: 8px; padding-bottom: 10px; }
  .garden-section__head > a { font-size: .75rem; }
  .garden-section__head p { font-size: .82rem; }
  .garden-news li { grid-template-columns: 30px minmax(0, 1fr); gap: 14px; padding: 18px 0; }
  .garden-news li:nth-child(n+3) { display: none; }
  .garden-news__number { font-size: 1.6rem; border-right: 0; }
  .garden-news h3 { font-size: 1.08rem; }
  .garden-news__summary { font-size: .95rem; }
  .garden-news__meta { font-size: .7rem; }
  .garden-section + .garden-section { margin-top: 28px; }
}
</style>
