<script setup lang="ts">
useHead({
  title: '博客 · 智识花园',
  meta: [
    { name: 'description', content: '记录技术实践、知识笔记与持续思考。' },
  ],
})

const { data: posts } = await useFetch<any[]>('/api/contents?type=blog&status=published&visibility=public', {
  default: () => [],
})
</script>

<template>
  <!-- 文章索引：保留完整博客归档。 -->
  <div class="editorial-index">
    <header class="editorial-index__header">
      <div>
        <p class="paper-kicker">
          Long-form writing
        </p>
        <h1>文章</h1>
      </div>
      <p>完整展开一个问题，也记录答案生成之前的犹疑与路径。</p>
    </header>
    <ContentList
      v-if="posts.length"
      :items="posts"
    />
    <p
      v-if="!posts.length"
      class="editorial-empty"
    >
      还没有博客文章
    </p>
  </div>
</template>
