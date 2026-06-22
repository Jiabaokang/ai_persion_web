<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents?type=blog&status=published&visibility=public`, {
  transform: (list: any[]) => list.find((p: any) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <article
    v-if="post"
    class="container section"
  >
    <div class="glass-strong p-8">
      <h1 class="text-3xl font-bold mb-2">
        {{ post.title }}
      </h1>
      <div class="text-sm text-ink-2 mb-6">
        {{ new Date(post.publishedAt).toLocaleDateString() }}
        <span
          v-if="post.readingTime"
          class="ml-2"
        >· {{ post.readingTime }} 分钟阅读</span>
      </div>
      <div
        class="prose max-w-none"
        v-html="post.contentHtml"
      />
    </div>
  </article>
</template>
