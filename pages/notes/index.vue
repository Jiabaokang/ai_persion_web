<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?type=note&status=published', {
  default: () => [], credentials: 'include',
})
</script>

<template>
  <!-- 笔记索引：用更紧凑的行距承载高密度知识条目。 -->
  <div class="editorial-index">
    <header class="editorial-index__header">
      <div>
        <p class="paper-kicker">
          Working notes
        </p>
        <h1>笔记</h1>
      </div>
      <p>仍在生长的知识切片，短、密、方便再次找到。</p>
    </header>
    <ContentList
      v-if="posts.length"
      :items="posts"
      density="compact"
    />
    <p
      v-if="!posts.length"
      class="editorial-empty"
    >
      还没有笔记
    </p>
  </div>
</template>
