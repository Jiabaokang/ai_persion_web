<script setup lang="ts">
import { buildRelatedEntries, extractHeadingOutline } from '~/utils/reading-aside'

const route = useRoute()
const now = new Date()
const dateParts = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
}).formatToParts(now)

const month = dateParts.find(part => part.type === 'month')?.value ?? ''
const day = dateParts.find(part => part.type === 'day')?.value ?? ''
const weekday = dateParts.find(part => part.type === 'weekday')?.value ?? ''

const { data: entries } = await useFetch<any[]>('/api/contents', {
  credentials: 'include',
  default: () => [],
})

const recentPrivate = computed(() => entries.value
  .filter(item => item.type === 'note' || item.type === 'inspiration')
  .slice(0, 3))

const detailTypeByRoute: Record<string, string> = {
  blog: 'blog',
  inspiration: 'inspiration',
  notes: 'note',
  wechat: 'wechat',
}

const currentEntry = computed(() => {
  const [routeBase, routeSlug] = route.path.split('/').filter(Boolean)
  const type = detailTypeByRoute[routeBase]
  if (!type || !routeSlug) return undefined
  return entries.value.find(item => item.type === type && item.slug === decodeURIComponent(routeSlug))
})

const currentOutline = computed(() => extractHeadingOutline(currentEntry.value?.contentHtml ?? ''))
const relatedEntries = computed(() => currentEntry.value
  ? buildRelatedEntries(entries.value, currentEntry.value)
  : [])

const detailDate = computed(() => {
  const value = currentEntry.value?.publishedAt || currentEntry.value?.updatedAt
  return value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(value)) : '未发布'
})

// 右栏近期条目根据内容类型落到笔记或灵感详情页。
function entryPath(item: { type: string, slug: string }) {
  return `/${item.type === 'note' ? 'notes' : 'inspiration'}/${item.slug}`
}

// 详情相关内容覆盖四类内容路由。
function contentPath(item: { type: string, slug: string }) {
  const base = item.type === 'note' ? 'notes' : item.type
  return `/${base}/${item.slug}`
}
</script>

<template>
  <!-- 桌面端阅读索引与知识摘录 -->
  <aside
    class="reading-aside"
    aria-label="阅读索引"
  >
    <div class="reading-aside__date">
      <strong>{{ month }} / {{ day }}</strong>
      <span>{{ now.getFullYear() }} · {{ weekday }}</span>
    </div>

    <section
      v-if="currentEntry"
      class="reading-aside__section reading-aside__detail"
    >
      <p class="paper-kicker">
        Reading guide
      </p>
      <h2>本文索引</h2>
      <dl class="reading-aside__meta">
        <div>
          <dt>发布日期</dt>
          <dd>{{ detailDate }}</dd>
        </div>
        <div>
          <dt>阅读时长</dt>
          <dd>{{ currentEntry.readingTime || 1 }} 分钟</dd>
        </div>
      </dl>
      <nav
        v-if="currentOutline.length"
        class="reading-aside__toc"
        aria-label="文章目录"
      >
        <a
          v-for="heading in currentOutline"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="{ 'is-subsection': heading.level === 3 }"
        >{{ heading.text }}</a>
      </nav>
      <p
        v-else
        class="reading-aside__empty"
      >
        本文暂无二级目录
      </p>
      <div
        v-if="relatedEntries.length"
        class="reading-aside__related"
      >
        <strong>相关内容</strong>
        <NuxtLink
          v-for="item in relatedEntries"
          :key="item.id"
          :to="contentPath(item)"
        >{{ item.title }}</NuxtLink>
      </div>
    </section>

    <section
      v-else
      class="reading-aside__section"
    >
      <p class="paper-kicker">
        阅读索引
      </p>
      <h2>近期笔记与灵感</h2>
      <nav
        v-if="recentPrivate.length"
        class="reading-aside__links"
      >
        <NuxtLink
          v-for="item in recentPrivate"
          :key="item.id"
          :to="entryPath(item)"
        >
          <small>{{ item.type === 'note' ? '笔记' : '灵感' }}</small>
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>
      <nav
        v-else
        class="reading-aside__links"
      >
        <NuxtLink to="/">查看最新长文</NuxtLink>
        <NuxtLink to="/notes">翻阅知识笔记</NuxtLink>
        <NuxtLink to="/inspiration">拾取灵感碎片</NuxtLink>
      </nav>
    </section>

    <blockquote
      v-if="!currentEntry"
      class="reading-aside__quote"
    >
      <span aria-hidden="true">“</span>
      <p>真正的知识不是记住多少，而是能随时找到并为我所用。</p>
      <cite>— 智识花园</cite>
    </blockquote>
  </aside>
</template>

<style scoped>
.reading-aside__meta { display: grid; gap: 8px; margin: 18px 0; }
.reading-aside__meta > div { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--rule-color); }
.reading-aside__meta dt { color: var(--ink-muted); font-size: 0.66rem; }
.reading-aside__meta dd { margin: 0; color: var(--ink-secondary); font-size: 0.7rem; }
.reading-aside__toc { display: grid; border-top: 1px solid var(--rule-color); }
.reading-aside__toc a { padding: 9px 0; border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); font-size: 0.72rem; line-height: 1.5; }
.reading-aside__toc a.is-subsection { padding-left: 14px; color: var(--ink-muted); }
.reading-aside__toc a:hover { color: var(--accent-terracotta-dark); }
.reading-aside__empty { margin: 16px 0 0; color: var(--ink-muted); font-size: 0.7rem; }
.reading-aside__related { display: grid; gap: 8px; margin-top: 22px; }
.reading-aside__related strong { color: var(--ink-muted); font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; }
.reading-aside__related a { color: var(--ink-secondary); font-size: 0.72rem; line-height: 1.5; }
</style>
