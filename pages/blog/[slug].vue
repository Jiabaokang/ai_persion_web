<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents?type=blog&status=published&visibility=public`, {
  transform: (list: any[]) => list.find((p: any) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <!-- 博客书页：统一文章标题、阅读元信息和 Markdown 正文边界。 -->
  <article
    v-if="post"
    class="reading-page reading-article"
  >
    <header class="reading-header">
      <div class="reading-meta">
        <span>博客</span>
        <span v-if="post.publishedAt">{{ new Date(post.publishedAt).toLocaleDateString('zh-CN') }}</span>
        <span v-if="post.readingTime">{{ post.readingTime }} 分钟阅读</span>
      </div>
      <h1>
        {{ post.title }}
      </h1>
    </header>
    <ContentMarkdownContent
      :html="post.contentHtml || ''"
      :title="post.title"
    />
  </article>
</template>
