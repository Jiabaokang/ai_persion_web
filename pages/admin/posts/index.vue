<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface AdminContentRow {
  id: number
  slug: string
  type: string
  title: string
  visibility: string
  status: string
  updatedAt?: string | number | Date | null
}

const { data: posts, pending, error, refresh } = await useFetch<AdminContentRow[]>('/api/contents', {
  credentials: 'include',
  default: () => [],
})

const list = computed(() => posts.value ?? [])

// 删除内容前二次确认，并在接口成功后刷新表格。
async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}

// 将接口枚举翻译为后台可读标签。
function label(value: string) {
  const labels: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    public: '公开',
    private: '私密',
    note: '笔记',
    inspiration: '灵感',
    blog: '博客',
    wechat: '公众号',
  }
  return labels[value] ?? value
}

// 使用语义类表达状态，避免把颜色逻辑散落到表格模板。
function badgeClass(value: string) {
  return ['admin-badge', `is-${value}`]
}
</script>

<template>
  <!-- 内容档案表：在同一行检视类型、可见性、发布状态与操作。 -->
  <div class="admin-content-page">
    <header class="admin-content-head">
      <div>
        <p class="paper-kicker">
          Content archive
        </p>
        <h1>内容管理</h1>
        <p>统一管理博客、公众号、笔记与灵感。</p>
      </div>
      <NuxtLink
        to="/admin/posts/new"
        class="admin-content-create"
      >
        <span
          class="i-carbon-add"
          aria-hidden="true"
        />
        新建内容
      </NuxtLink>
    </header>

    <div class="admin-content-toolbar">
      <span>共 {{ list.length }} 条记录</span>
      <button
        type="button"
        @click="refresh()"
      >
        <span
          class="i-carbon-renew"
          aria-hidden="true"
        />
        刷新
      </button>
    </div>

    <div
      v-if="error"
      class="admin-content-state"
      role="alert"
    >
      <span
        class="i-carbon-warning-alt"
        aria-hidden="true"
      />
      <div><strong>列表加载失败</strong><p>{{ error.message }}</p></div>
    </div>
    <div
      v-else-if="pending"
      class="admin-content-state"
    >
      <span
        class="i-carbon-progress-bar-round admin-spin"
        aria-hidden="true"
      />
      正在整理内容档案……
    </div>
    <div
      v-else-if="!list.length"
      class="admin-content-state"
    >
      <span
        class="i-carbon-document-blank"
        aria-hidden="true"
      />
      <div><strong>还没有内容</strong><p>先创建一条内容，写点东西。</p></div>
      <NuxtLink to="/admin/posts/new">新建内容</NuxtLink>
    </div>

    <div
      v-else
      class="admin-content-table-wrap"
    >
      <table class="admin-content-table">
        <thead>
          <tr>
            <th>标题 / 路径</th>
            <th>类型</th>
            <th>可见性</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in list"
            :key="p.id"
          >
            <td>
              <NuxtLink :to="`/admin/posts/${p.id}`">{{ p.title }}</NuxtLink>
              <small>/{{ p.slug }}</small>
            </td>
            <td><span class="admin-type">{{ label(p.type) }}</span></td>
            <td><span :class="badgeClass(p.visibility)">{{ label(p.visibility) }}</span></td>
            <td><span :class="badgeClass(p.status)">{{ label(p.status) }}</span></td>
            <td>
              <div class="admin-row-actions">
                <NuxtLink :to="`/admin/posts/${p.id}`">
                  <span
                    class="i-carbon-edit"
                    aria-hidden="true"
                  />
                  编辑
                </NuxtLink>
                <button
                  type="button"
                  @click="remove(p.id)"
                >
                  <span
                    class="i-carbon-trash-can"
                    aria-hidden="true"
                  />
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-content-page { display: grid; gap: 0; }
.admin-content-head { display: flex; align-items: end; justify-content: space-between; gap: 30px; padding-bottom: 28px; border-bottom: 1px solid var(--rule-strong); }
.admin-content-head h1 { margin-top: 7px; font-size: clamp(2.8rem, 6vw, 5.2rem); font-weight: 500; letter-spacing: -0.055em; }
.admin-content-head > div > p:last-child { margin: 12px 0 0; color: var(--ink-secondary); }
.admin-content-create { display: inline-flex; min-height: 42px; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-size: 0.78rem; font-weight: 700; }
.admin-content-toolbar { display: flex; min-height: 56px; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--rule-color); color: var(--ink-muted); font-size: 0.72rem; }
.admin-content-toolbar button { display: inline-flex; min-height: 38px; align-items: center; gap: 7px; padding: 6px 10px; color: var(--ink-secondary); }
.admin-content-table-wrap { overflow-x: auto; }
.admin-content-table { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 0.8rem; }
.admin-content-table th { padding: 13px 14px; color: var(--ink-muted); font-size: 0.67rem; font-weight: 650; letter-spacing: 0.08em; text-align: left; }
.admin-content-table td { padding: 17px 14px; border-top: 1px solid var(--rule-color); vertical-align: middle; }
.admin-content-table tbody tr:hover { background: rgba(233, 222, 204, 0.35); }
.admin-content-table td:first-child a { display: block; font-family: var(--font-display); font-size: 0.98rem; font-weight: 600; }
.admin-content-table td:first-child a:hover { color: var(--accent-terracotta-dark); }
.admin-content-table td:first-child small { display: block; margin-top: 4px; color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.62rem; }
.admin-type { color: var(--ink-secondary); }
.admin-badge { display: inline-flex; min-height: 24px; align-items: center; padding: 3px 8px; border: 1px solid var(--rule-color); border-radius: var(--radius-full); color: var(--ink-secondary); font-size: 0.67rem; }
.admin-badge.is-published,
.admin-badge.is-public { border-color: rgba(102, 118, 83, 0.38); background: var(--accent-moss-soft); color: #4f5e3e; }
.admin-badge.is-draft,
.admin-badge.is-private { background: var(--paper-muted); }
.admin-row-actions { display: flex; align-items: center; gap: 8px; }
.admin-row-actions a,
.admin-row-actions button { display: inline-flex; min-height: 36px; align-items: center; gap: 6px; padding: 6px 9px; border: 1px solid var(--rule-color); border-radius: var(--radius-sm); color: var(--ink-secondary); font-size: 0.7rem; }
.admin-row-actions a:hover { border-color: var(--accent-moss); color: var(--accent-moss); }
.admin-row-actions button:hover { border-color: var(--accent-terracotta); color: var(--accent-terracotta-dark); }
.admin-content-state { display: flex; min-height: 180px; align-items: center; justify-content: center; gap: 14px; padding: 30px; border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); text-align: left; }
.admin-content-state p { margin: 3px 0 0; color: var(--ink-muted); font-size: 0.74rem; }
.admin-content-state a { color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
.admin-spin { animation: admin-spin 0.9s linear infinite; }
@keyframes admin-spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) {
  .admin-content-head { align-items: start; flex-direction: column; }
}
</style>
