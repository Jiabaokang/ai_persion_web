<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: posts } = await useFetch<any[]>('/api/contents', {
  credentials: 'include',
  default: () => [],
})

const total = computed(() => posts.value.length)
const published = computed(() => posts.value.filter(post => post.status === 'published').length)
const drafts = computed(() => posts.value.filter(post => post.status === 'draft').length)
const recent = computed(() => posts.value.slice(0, 5))
</script>

<template>
  <!-- 管理概览：用编辑部数字摘要与近期内容代替浮动统计卡片。 -->
  <div class="admin-dashboard">
    <header class="admin-page-head">
      <div>
        <p class="paper-kicker">
          Writing desk overview
        </p>
        <h1>工作概览</h1>
      </div>
      <p>查看内容状态，并从最近一次书写继续。</p>
    </header>

    <section
      class="admin-stats"
      aria-label="内容统计"
    >
      <div>
        <span>01</span>
        <small>全部内容</small>
        <strong>{{ total }}</strong>
      </div>
      <div>
        <span>02</span>
        <small>已经发布</small>
        <strong>{{ published }}</strong>
      </div>
      <div>
        <span>03</span>
        <small>仍在草稿</small>
        <strong>{{ drafts }}</strong>
      </div>
    </section>

    <section class="admin-quick-actions">
      <header>
        <div>
          <p class="paper-kicker">
            Quick actions
          </p>
          <h2>开始书写</h2>
        </div>
      </header>
      <div>
        <NuxtLink to="/admin/posts/new">
          <span
            class="i-carbon-document-add"
            aria-hidden="true"
          />
          <strong>新建内容</strong>
          <small>文章、笔记、公众号或灵感</small>
          <span aria-hidden="true">→</span>
        </NuxtLink>
        <NuxtLink to="/admin/posts">
          <span
            class="i-carbon-list-boxes"
            aria-hidden="true"
          />
          <strong>管理内容</strong>
          <small>检视发布状态和可见性</small>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>

    <section class="admin-recent">
      <header>
        <h2>最近内容</h2>
        <NuxtLink to="/admin/posts">查看全部</NuxtLink>
      </header>
      <div v-if="recent.length">
        <NuxtLink
          v-for="post in recent"
          :key="post.id"
          :to="`/admin/posts/${post.id}`"
        >
          <span>{{ post.type }}</span>
          <strong>{{ post.title }}</strong>
          <small>{{ post.status === 'published' ? '已发布' : '草稿' }}</small>
        </NuxtLink>
      </div>
      <p
        v-else
        class="editorial-empty"
      >
        暂无内容。
      </p>
    </section>
  </div>
</template>

<style scoped>
.admin-dashboard { display: grid; gap: 48px; }
.admin-page-head { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 36px; align-items: end; padding-bottom: 28px; border-bottom: 1px solid var(--rule-strong); }
.admin-page-head h1 { margin-top: 7px; font-size: clamp(2.8rem, 6vw, 5.2rem); font-weight: 500; letter-spacing: -0.055em; }
.admin-page-head > p { margin: 0; color: var(--ink-secondary); line-height: 1.8; }
.admin-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule-strong); }
.admin-stats > div { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: baseline; padding: 24px 20px; border-right: 1px solid var(--rule-color); }
.admin-stats > div:last-child { border-right: 0; }
.admin-stats span { color: var(--ink-faint); font-family: var(--font-mono); font-size: 0.65rem; }
.admin-stats small { color: var(--ink-secondary); }
.admin-stats strong { color: var(--accent-terracotta); font-family: var(--font-display); font-size: 2.5rem; font-weight: 500; }
.admin-quick-actions > header,
.admin-recent > header { display: flex; align-items: end; justify-content: space-between; padding-bottom: 13px; border-bottom: 1px solid var(--rule-strong); }
.admin-quick-actions h2,
.admin-recent h2 { margin-top: 4px; font-size: 1.5rem; font-weight: 600; }
.admin-quick-actions > div { display: grid; grid-template-columns: 1fr 1fr; }
.admin-quick-actions a { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 12px; align-items: center; min-height: 92px; padding: 16px 20px; border-bottom: 1px solid var(--rule-color); }
.admin-quick-actions a:first-child { border-right: 1px solid var(--rule-color); }
.admin-quick-actions a > strong,
.admin-quick-actions a > small { grid-column: 2; }
.admin-quick-actions a > small { color: var(--ink-muted); font-size: 0.72rem; }
.admin-quick-actions a > span:last-child { grid-column: 3; grid-row: 1 / span 2; color: var(--accent-terracotta); }
.admin-quick-actions a:hover { background: var(--paper-muted); }
.admin-recent header a { color: var(--accent-terracotta-dark); font-size: 0.75rem; text-decoration: underline; text-underline-offset: 3px; }
.admin-recent > div { display: grid; }
.admin-recent > div a { display: grid; grid-template-columns: 80px minmax(0, 1fr) auto; gap: 16px; align-items: center; min-height: 52px; border-bottom: 1px solid var(--rule-color); }
.admin-recent span,
.admin-recent small { color: var(--ink-muted); font-size: 0.7rem; }
@media (max-width: 700px) {
  .admin-page-head { grid-template-columns: 1fr; }
  .admin-stats { grid-template-columns: 1fr; }
  .admin-stats > div { border-right: 0; border-bottom: 1px solid var(--rule-color); }
  .admin-stats > div:last-child { border-bottom: 0; }
  .admin-quick-actions > div { grid-template-columns: 1fr; }
  .admin-quick-actions a:first-child { border-right: 0; }
}
</style>
