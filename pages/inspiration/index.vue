<script setup lang="ts">
const { data: posts, refresh } = await useFetch<any[]>('/api/contents', {
  query: { type: 'inspiration' },
  default: () => [],
  credentials: 'include',
})

const drafts = computed(() => (posts.value || []).filter(p => p.status === 'draft'))
const published = computed(() => (posts.value || []).filter(p => p.status === 'published'))

async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}
</script>

<template>
  <div class="container section">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">
        灵感
      </h1>
      <NuxtLink
        to="/inspiration/new"
        class="px-4 py-2 bg-primary-500 text-white rounded"
      >
        新建灵感
      </NuxtLink>
    </div>

    <section
      v-if="drafts.length"
      class="mb-10"
    >
      <h2 class="text-lg font-semibold mb-3 text-ink-2">
        碎片
      </h2>
      <div class="stack-lg">
        <article
          v-for="p in drafts"
          :key="p.id"
          class="glass p-6 hover:translate-y-[-2px] transition"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-xl font-display font-semibold mb-2 text-ink truncate">
                <NuxtLink
                  :to="`/inspiration/${p.slug}`"
                  class="hover:text-cyan transition"
                >
                  {{ p.title }}
                </NuxtLink>
              </h3>
              <p
                v-if="p.summary"
                class="text-ink-2"
              >
                {{ p.summary }}
              </p>
            </div>
            <div class="shrink-0 flex items-center gap-3 text-sm">
              <NuxtLink
                :to="`/inspiration/edit/${p.id}`"
                class="text-primary-500 hover:underline"
              >
                编辑
              </NuxtLink>
              <button
                class="text-red-500 hover:underline"
                @click="remove(p.id)"
              >
                删除
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-if="published.length">
      <h2 class="text-lg font-semibold mb-3 text-ink-2">
        已整理
      </h2>
      <div class="stack-lg">
        <article
          v-for="p in published"
          :key="p.id"
          class="glass p-6 hover:translate-y-[-2px] transition"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="text-xl font-display font-semibold mb-2 text-ink truncate">
                <NuxtLink
                  :to="`/inspiration/${p.slug}`"
                  class="hover:text-cyan transition"
                >
                  {{ p.title }}
                </NuxtLink>
              </h3>
              <p
                v-if="p.summary"
                class="text-ink-2"
              >
                {{ p.summary }}
              </p>
            </div>
            <div class="shrink-0 flex items-center gap-3 text-sm">
              <NuxtLink
                :to="`/inspiration/edit/${p.id}`"
                class="text-primary-500 hover:underline"
              >
                编辑
              </NuxtLink>
              <button
                class="text-red-500 hover:underline"
                @click="remove(p.id)"
              >
                删除
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div
      v-if="!drafts.length && !published.length"
      class="text-center py-12 text-ink-2"
    >
      还没有灵感
    </div>
  </div>
</template>
