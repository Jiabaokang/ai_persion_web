<script setup lang="ts">
const { data: posts, refresh } = await useFetch<any[]>('/api/contents', {
  query: { type: 'inspiration' },
  default: () => [],
  credentials: 'include',
})

const drafts = computed(() => (posts.value || []).filter(p => p.status === 'draft'))
const published = computed(() => (posts.value || []).filter(p => p.status === 'published'))

// 删除前明确确认，并在成功后刷新当前私密灵感列表。
async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}
</script>

<template>
  <!-- 灵感档案：碎片与已整理内容沿同一条时间线展开。 -->
  <div class="inspiration-index">
    <header class="inspiration-index__header">
      <div>
        <p class="paper-kicker">
          Private fragments
        </p>
        <h1>灵感</h1>
        <p>先抓住一闪而过的念头，再慢慢决定它会长成什么。</p>
      </div>
      <NuxtLink
        to="/inspiration/new"
        class="inspiration-create"
      >
        <span
          class="i-carbon-add"
          aria-hidden="true"
        />
        记下灵感
      </NuxtLink>
    </header>

    <div
      v-if="drafts.length || published.length"
      class="inspiration-timeline"
    >
      <section
        v-if="drafts.length"
        class="inspiration-group"
      >
        <header class="inspiration-group__header">
          <h2>尚未整理</h2>
          <span>{{ drafts.length }} 则碎片</span>
        </header>
        <article
          v-for="p in drafts"
          :key="p.id"
          class="inspiration-entry"
        >
          <span
            class="inspiration-entry__dot"
            aria-hidden="true"
          />
          <div class="inspiration-entry__body">
            <p class="inspiration-entry__date">
              {{ p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('zh-CN') : '待整理' }}
            </p>
            <h3><NuxtLink :to="`/inspiration/${p.slug}`">{{ p.title }}</NuxtLink></h3>
            <p
              v-if="p.summary"
              class="inspiration-entry__summary"
            >
              {{ p.summary }}
            </p>
          </div>
          <div class="inspiration-entry__actions">
            <NuxtLink :to="`/inspiration/edit/${p.id}`">编辑</NuxtLink>
            <button
              type="button"
              @click="remove(p.id)"
            >
              删除
            </button>
          </div>
        </article>
      </section>

      <section
        v-if="published.length"
        class="inspiration-group"
      >
        <header class="inspiration-group__header">
          <h2>已经整理</h2>
          <span>{{ published.length }} 则记录</span>
        </header>
        <article
          v-for="p in published"
          :key="p.id"
          class="inspiration-entry is-organized"
        >
          <span
            class="inspiration-entry__dot"
            aria-hidden="true"
          />
          <div class="inspiration-entry__body">
            <p class="inspiration-entry__date">
              {{ p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('zh-CN') : '已归档' }}
            </p>
            <h3><NuxtLink :to="`/inspiration/${p.slug}`">{{ p.title }}</NuxtLink></h3>
            <p
              v-if="p.summary"
              class="inspiration-entry__summary"
            >
              {{ p.summary }}
            </p>
          </div>
          <div class="inspiration-entry__actions">
            <NuxtLink :to="`/inspiration/edit/${p.id}`">编辑</NuxtLink>
            <button
              type="button"
              @click="remove(p.id)"
            >
              删除
            </button>
          </div>
        </article>
      </section>
    </div>

    <p
      v-if="!drafts.length && !published.length"
      class="editorial-empty"
    >
      还没有灵感，先记下一个未完成的念头。
    </p>
  </div>
</template>

<style scoped>
.inspiration-index { padding: 26px 0 72px; }
.inspiration-index__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--rule-strong);
}
.inspiration-index__header h1 { margin-top: 6px; font-size: clamp(3rem, 8vw, 6rem); font-weight: 500; }
.inspiration-index__header p:not(.paper-kicker) { max-width: 36em; margin: 14px 0 0; color: var(--ink-secondary); }
.inspiration-create {
  display: inline-flex; min-height: 44px; align-items: center; gap: 8px; padding: 9px 16px;
  border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm);
  background: var(--accent-terracotta); color: var(--paper-surface); font-weight: 700; white-space: nowrap;
}
.inspiration-timeline { position: relative; padding: 42px 0 0 28px; }
.inspiration-timeline::before { position: absolute; top: 48px; bottom: 12px; left: 6px; width: 1px; background: var(--rule-strong); content: ''; }
.inspiration-group + .inspiration-group { margin-top: 50px; }
.inspiration-group__header { display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--rule-color); }
.inspiration-group__header h2 { font-size: 1.05rem; }
.inspiration-group__header span { color: var(--ink-muted); font-size: 0.72rem; }
.inspiration-entry { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; padding: 24px 0; border-bottom: 1px solid var(--rule-color); }
.inspiration-entry__dot { position: absolute; top: 30px; left: -27px; width: 11px; height: 11px; border: 2px solid var(--paper-base); border-radius: 50%; background: var(--accent-terracotta); box-shadow: 0 0 0 1px var(--rule-strong); }
.inspiration-entry.is-organized .inspiration-entry__dot { background: var(--accent-moss); }
.inspiration-entry__date { margin: 0 0 5px; color: var(--ink-muted); font-size: 0.68rem; letter-spacing: 0.08em; }
.inspiration-entry h3 { font-size: clamp(1.22rem, 2.5vw, 1.62rem); font-weight: 600; }
.inspiration-entry h3 a:hover { color: var(--accent-terracotta-dark); }
.inspiration-entry__summary { max-width: 54ch; margin: 8px 0 0; color: var(--ink-secondary); font-size: 0.9rem; }
.inspiration-entry__actions { display: flex; align-items: start; gap: 14px; color: var(--ink-muted); font-size: 0.75rem; }
.inspiration-entry__actions a:hover,
.inspiration-entry__actions button:hover { color: var(--accent-terracotta); }
@media (max-width: 600px) {
  .inspiration-index__header { align-items: start; flex-direction: column; }
  .inspiration-entry { grid-template-columns: 1fr; gap: 12px; }
}
</style>
