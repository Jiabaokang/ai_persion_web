<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents`, {
  query: { type: 'inspiration' }, credentials: 'include',
  transform: (list: any[]) => list.find((p: any) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404 })
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
      <div
        class="prose max-w-none"
        v-html="post.contentHtml"
      />
    </div>
  </article>
</template>
