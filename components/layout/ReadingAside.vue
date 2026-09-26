<script setup lang="ts">
import { extractHeadingOutline } from '~/utils/reading-aside'

const route = useRoute()
const contentType = computed(() => route.path.split('/')[1] === 'notes' ? 'note' : route.path.split('/')[1])
const { data: entries } = await useFetch<any[]>('/api/contents', {
  query: { type: contentType, slug: computed(() => route.params.slug) },
  credentials: 'include',
  default: () => [],
})
const outline = computed(() => extractHeadingOutline(entries.value[0]?.contentHtml ?? ''))
</script>

<template>
  <!-- 原生折叠目录在手机和桌面都可访问，不占用固定右栏。 -->
  <details
    v-if="outline.length"
    class="reading-guide"
  >
    <summary>本文目录 <span>{{ outline.length }} 个章节</span></summary>
    <nav aria-label="文章目录">
      <a
        v-for="heading in outline"
        :key="heading.id"
        :href="`#${heading.id}`"
        :class="{ 'is-subsection': heading.level === 3 }"
      >{{ heading.text }}</a>
    </nav>
  </details>
</template>
