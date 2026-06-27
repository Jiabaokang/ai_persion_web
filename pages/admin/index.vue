<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: posts } = await useFetch('/api/contents', { credentials: 'include' })
const total = computed(() => posts.value?.length ?? 0)
const published = computed(() => posts.value?.filter((p: any) => p.status === 'published').length ?? 0)
const drafts = computed(() => posts.value?.filter((p: any) => p.status === 'draft').length ?? 0)
</script>

<template>
  <div class="stack-lg">
    <div>
      <h2 class="text-2xl md:text-3xl font-800">
        <span class="gradient-text">仪表盘</span>
      </h2>
      <div class="mt-1 text-sm text-[var(--text-muted)]">
        快速查看内容概况
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-[var(--text-secondary)] font-600">
            总内容
          </div>
          <span class="i-carbon-stack-limitation w-5 h-5 text-[var(--text-muted)]" />
        </div>
        <div class="text-3xl font-900 mt-3">
          {{ total }}
        </div>
      </div>

      <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(34,211,238,0.06)] p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-[var(--text-secondary)] font-600">
            已发布
          </div>
          <span class="i-carbon-checkmark-outline w-5 h-5 text-[var(--accent-cyan)]" />
        </div>
        <div class="text-3xl font-900 mt-3">
          {{ published }}
        </div>
      </div>

      <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(168,85,247,0.06)] p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-[var(--text-secondary)] font-600">
            草稿
          </div>
          <span class="i-carbon-edit-off w-5 h-5 text-[var(--accent-purple)]" />
        </div>
        <div class="text-3xl font-900 mt-3">
          {{ drafts }}
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] p-5 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div class="text-sm text-[var(--text-secondary)] font-700">
          快捷入口
        </div>
        <div class="mt-1 text-sm text-[var(--text-muted)]">
          去文章列表开始编辑
        </div>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/posts/new"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-900 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition"
        >
          <span class="i-carbon-add w-5 h-5" />
          <span>新建内容</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/posts"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
        >
          <span class="i-carbon-arrow-right w-5 h-5" />
          <span>进入文章管理</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
