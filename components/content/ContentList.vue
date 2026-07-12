<script setup lang="ts">
interface ContentListItem {
  id: number
  slug: string
  type: string
  title: string
  summary?: string
  publishedAt?: string
  updatedAt?: string
  readingTime?: number
  tags?: Array<{ name: string }>
}

const props = withDefaults(defineProps<{
  items: ContentListItem[]
  density?: 'editorial' | 'compact'
}>(), {
  density: 'editorial',
})

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// 根据内容类型生成稳定详情路由，兼容 note 的复数路由命名。
function itemPath(item: ContentListItem) {
  const base = item.type === 'note' ? 'notes' : item.type
  return `/${base}/${item.slug}`
}

// 统一格式化接口返回的发布时间或更新时间。
function itemDate(item: ContentListItem) {
  const value = item.publishedAt || item.updatedAt
  return value ? dateFormatter.format(new Date(value)) : ''
}
</script>

<template>
  <!-- 编辑部内容流：项目之间只使用档案分隔线，不堆叠独立卡片。 -->
  <div
    class="content-list"
    :class="`content-list--${props.density}`"
  >
    <article
      v-for="(item, index) in items"
      :key="item.id || item.slug"
      class="content-list__item"
    >
      <div
        class="content-list__index"
        aria-hidden="true"
      >
        {{ String(index + 1).padStart(2, '0') }}
      </div>
      <div class="content-list__body">
        <div class="content-list__meta">
          <time v-if="itemDate(item)">{{ itemDate(item) }}</time>
          <span v-if="item.readingTime">{{ item.readingTime }} 分钟阅读</span>
          <span
            v-for="tag in item.tags?.slice(0, 2)"
            :key="tag.name"
          ># {{ tag.name }}</span>
        </div>
        <h2>
          <NuxtLink :to="itemPath(item)">
            {{ item.title }}
            <span
              class="content-list__arrow"
              aria-hidden="true"
            >↗</span>
          </NuxtLink>
        </h2>
        <p v-if="item.summary">
          {{ item.summary }}
        </p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.content-list {
  border-top: 1px solid var(--rule-strong);
}

.content-list__item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: clamp(14px, 3vw, 28px);
  padding: clamp(22px, 4vw, 36px) 0;
  border-bottom: 1px solid var(--rule-color);
}

.content-list__index {
  padding-top: 0.35rem;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.content-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-bottom: 9px;
  color: var(--ink-muted);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
}

.content-list h2 {
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.025em;
}

.content-list h2 a {
  display: inline;
  transition: color var(--duration-fast) var(--ease-out);
}

.content-list h2 a:hover {
  color: var(--accent-terracotta-dark);
}

.content-list__arrow {
  display: inline-block;
  margin-left: 0.3em;
  color: var(--accent-terracotta);
  font-family: var(--font-body);
  font-size: 0.65em;
  transition: transform var(--duration-fast) var(--ease-out);
}

.content-list h2 a:hover .content-list__arrow {
  transform: translate(2px, -2px);
}

.content-list__body > p {
  max-width: 64ch;
  margin: 10px 0 0;
  color: var(--ink-secondary);
  font-size: 0.94rem;
  line-height: 1.75;
}

.content-list--compact .content-list__item {
  padding: 18px 0;
}

.content-list--compact h2 {
  font-size: clamp(1.1rem, 2vw, 1.38rem);
}

.content-list--compact .content-list__body > p {
  margin-top: 6px;
  font-size: 0.85rem;
}

@media (max-width: 560px) {
  .content-list__item {
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 10px;
  }

  .content-list__meta {
    gap: 4px 10px;
  }
}
</style>
