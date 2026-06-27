<script setup lang="ts">
definePageMeta({ layout: 'admin' })
type AdminContentRow = {
  id: number
  slug: string
  type: 'note' | 'inspiration' | 'blog' | 'wechat' | (string & {})
  title: string
  visibility: 'public' | 'private' | (string & {})
  status: 'draft' | 'published' | (string & {})
  updatedAt?: string | number | Date | null
  createdAt?: string | number | Date | null
}

const { data: posts, pending, error, refresh } = await useFetch<AdminContentRow[]>('/api/contents', {
  credentials: 'include',
})

const list = computed(() => posts.value ?? [])

async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}

function badgeClass(kind: 'status' | 'visibility', value: string) {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-600 border'
  if (kind === 'status') {
    if (value === 'published') return `${base} bg-[rgba(34,211,238,0.12)] border-[rgba(34,211,238,0.28)] text-[var(--text-primary)]`
    return `${base} bg-[rgba(168,85,247,0.10)] border-[rgba(168,85,247,0.25)] text-[var(--text-primary)]`
  }
  if (value === 'public') return `${base} bg-[rgba(16,185,129,0.10)] border-[rgba(16,185,129,0.22)] text-[var(--text-primary)]`
  return `${base} bg-[rgba(236,72,153,0.10)] border-[rgba(236,72,153,0.22)] text-[var(--text-primary)]`
}

function label(value: string) {
  const map: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    public: '公开',
    private: '私密',
    note: '笔记',
    inspiration: '灵感',
    blog: '博客',
    wechat: '公众号',
  }
  return map[value] ?? value
}
</script>

<template>
  <div class="stack-lg">
    <div class="flex items-end justify-between gap-4 flex-wrap">
      <div class="min-w-60">
        <h2 class="text-2xl md:text-3xl font-800 tracking--0.3">
          <span class="gradient-text">文章管理</span>
        </h2>
        <div class="mt-1 text-sm text-[var(--text-muted)]">
          统一管理 note / inspiration / blog / wechat 等内容
        </div>
      </div>

      <NuxtLink
        to="/admin/posts/new"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-800 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition"
      >
        <span class="i-carbon-add w-5 h-5" />
        <span>新建内容</span>
      </NuxtLink>
    </div>

    <div
      v-if="error"
      class="glass-strong p-5 flex items-start gap-3"
    >
      <span class="i-carbon-warning-alt w-5 h-5 text-[var(--accent-pink)]" />
      <div>
        <div class="font-700">
          列表加载失败
        </div>
        <div class="text-sm text-[var(--text-secondary)] mt-1">
          {{ error.message }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="glass-strong overflow-hidden"
    >
      <div class="px-4 md:px-6 py-4 border-b border-[rgba(255,255,255,0.10)] flex items-center justify-between gap-3">
        <div class="text-sm text-[var(--text-secondary)]">
          共 {{ list.length }} 条
        </div>
        <button
          class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
          @click="refresh()"
        >
          <span class="i-carbon-renew w-4 h-4" />
          刷新
        </button>
      </div>

      <div
        v-if="pending"
        class="p-4 md:p-6 space-y-3"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-14 rounded-2xl bg-[rgba(255,255,255,0.06)] animate-pulse"
        />
      </div>

      <div
        v-else-if="list.length === 0"
        class="p-10 md:p-14 text-center"
      >
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)]">
          <span class="i-carbon-document-blank w-7 h-7 text-[var(--text-secondary)]" />
        </div>
        <div class="mt-4 text-lg font-800">
          还没有内容
        </div>
        <div class="mt-1 text-sm text-[var(--text-muted)]">
          先创建一条内容，写点东西。
        </div>
        <div class="mt-6">
          <NuxtLink
            to="/admin/posts/new"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-800 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition"
          >
            <span class="i-carbon-add w-5 h-5" />
            新建内容
          </NuxtLink>
        </div>
      </div>

      <div v-else>
        <div class="hidden md:block">
          <table class="w-full text-sm">
            <thead class="text-left text-[var(--text-muted)]">
              <tr>
                <th class="px-6 py-4 font-600">
                  标题
                </th>
                <th class="px-6 py-4 font-600">
                  类型
                </th>
                <th class="px-6 py-4 font-600">
                  可见性
                </th>
                <th class="px-6 py-4 font-600">
                  状态
                </th>
                <th class="px-6 py-4 font-600 text-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in list"
                :key="p.id"
                class="border-t border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition"
              >
                <td class="px-6 py-4">
                  <div class="font-700 text-[var(--text-primary)] leading-tight">
                    <NuxtLink
                      :to="`/admin/posts/${p.id}`"
                      class="hover:underline decoration-[rgba(34,211,238,0.6)] underline-offset-4"
                    >
                      {{ p.title }}
                    </NuxtLink>
                  </div>
                  <div class="mt-1 text-xs text-[var(--text-muted)] font-mono truncate max-w-180">
                    /{{ p.slug }}
                  </div>
                </td>
                <td class="px-6 py-4 text-[var(--text-secondary)]">
                  {{ label(p.type) }}
                </td>
                <td class="px-6 py-4">
                  <span :class="badgeClass('visibility', p.visibility)">
                    {{ label(p.visibility) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="badgeClass('status', p.status)">
                    {{ label(p.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      :to="`/admin/posts/${p.id}`"
                      class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
                    >
                      <span class="i-carbon-edit w-4 h-4" />
                      编辑
                    </NuxtLink>
                    <button
                      class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[rgba(236,72,153,0.14)] hover:border-[rgba(236,72,153,0.30)] hover:text-[var(--text-primary)] transition"
                      @click="remove(p.id)"
                    >
                      <span class="i-carbon-trash-can w-4 h-4" />
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden p-4 space-y-3">
          <div
            v-for="p in list"
            :key="p.id"
            class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <NuxtLink
                  :to="`/admin/posts/${p.id}`"
                  class="block font-800 leading-snug truncate"
                >
                  {{ p.title }}
                </NuxtLink>
                <div class="mt-1 text-xs text-[var(--text-muted)] font-mono truncate">
                  /{{ p.slug }}
                </div>
              </div>
              <span
                class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)]"
              >
                <span class="i-carbon-document w-5 h-5 text-[var(--text-secondary)]" />
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-700 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)] text-[var(--text-secondary)]">
                {{ label(p.type) }}
              </span>
              <span :class="badgeClass('visibility', p.visibility)">
                {{ label(p.visibility) }}
              </span>
              <span :class="badgeClass('status', p.status)">
                {{ label(p.status) }}
              </span>
            </div>

            <div class="mt-4 flex items-center gap-2">
              <NuxtLink
                :to="`/admin/posts/${p.id}`"
                class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
              >
                <span class="i-carbon-edit w-4 h-4" />
                编辑
              </NuxtLink>
              <button
                class="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[rgba(236,72,153,0.14)] hover:border-[rgba(236,72,153,0.30)] hover:text-[var(--text-primary)] transition"
                @click="remove(p.id)"
              >
                <span class="i-carbon-trash-can w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
