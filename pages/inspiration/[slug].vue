<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch<any>('/api/contents', {
  query: { type: 'inspiration', slug: route.params.slug },
  credentials: 'include',
  transform: (list: any[]) => list[0],
})
if (!post.value) throw createError({ statusCode: 404 })

async function remove() {
  if (!post.value) return
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${post.value.id}`, { method: 'DELETE', credentials: 'include' })
  await navigateTo('/inspiration')
}
</script>

<template>
  <article
    v-if="post"
    class="container section"
  >
    <div class="glass-strong p-8">
      <div class="flex items-center justify-between mb-6 text-sm">
        <NuxtLink
          to="/inspiration"
          class="text-ink-2 hover:underline"
        >
          返回列表
        </NuxtLink>
        <div class="flex items-center gap-3">
          <NuxtLink
            :to="`/inspiration/edit/${post.id}`"
            class="text-primary-500 hover:underline"
          >
            编辑
          </NuxtLink>
          <button
            class="text-red-500 hover:underline"
            @click="remove"
          >
            删除
          </button>
        </div>
      </div>
      <h1 class="text-3xl font-bold mb-2">
        {{ post.title }}
      </h1>
      <div
        class="prose max-w-none"
        v-html="post.contentHtml"
      />
    </div>
  </article>
</template>
