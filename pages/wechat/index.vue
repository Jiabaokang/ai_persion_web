<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?type=wechat&status=published&visibility=public', {
  default: () => [],
})
</script>

<template>
  <!-- 公众号索引：保留刊物语义，并复用编辑部行列表。 -->
  <div class="editorial-index">
    <header class="editorial-index__header">
      <div>
        <p class="paper-kicker">
          Published elsewhere
        </p>
        <h1>公众号</h1>
      </div>
      <p>从公众号归档回来的文章，在这里保持可检索与可重读。</p>
    </header>
    <ContentContentList
      v-if="posts.length"
      :items="posts"
    />
    <p
      v-if="!posts.length"
      class="editorial-empty"
    >
      还没有公众号文章
    </p>
  </div>
</template>
