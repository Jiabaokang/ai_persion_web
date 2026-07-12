<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents?type=wechat&status=published&visibility=public`, {
  transform: (list: any[]) => list.find((p: any) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <!-- 公众号书页：保留来源语义，并复用统一 Markdown 阅读体验。 -->
  <article
    v-if="post"
    class="reading-page reading-article"
  >
    <header class="reading-header">
      <div class="reading-meta">
        <span>公众号</span>
        <span v-if="post.publishedAt">{{ new Date(post.publishedAt).toLocaleDateString('zh-CN') }}</span>
        <span v-if="post.readingTime">{{ post.readingTime }} 分钟阅读</span>
      </div>
      <h1>
        {{ post.title }}
      </h1>
    </header>
    <ContentMarkdownContent :html="post.contentHtml || ''" />
  </article>
</template>
