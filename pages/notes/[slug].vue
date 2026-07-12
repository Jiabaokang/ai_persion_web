<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents`, {
  query: { type: 'note' }, credentials: 'include',
  transform: (list: any[]) => list.find((p: any) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404 })
</script>

<template>
  <!-- 笔记书页：以紧凑元信息和统一正文组件呈现。 -->
  <article
    v-if="post"
    class="reading-page reading-article"
  >
    <header class="reading-header">
      <div class="reading-meta">
        <span>笔记</span>
        <span v-if="post.updatedAt">更新于 {{ new Date(post.updatedAt).toLocaleDateString('zh-CN') }}</span>
      </div>
      <h1>
        {{ post.title }}
      </h1>
    </header>
    <ContentMarkdownContent :html="post.contentHtml || ''" />
  </article>
</template>
