<script setup lang="ts">
import { computed } from 'vue'
import { htmlToText } from '~/utils/html'

const props = defineProps<{
  html: string
  title?: string
}>()

// 详情页标题已由阅读页头展示时，移除正文中完全相同的首个一级标题。
const renderedHtml = computed(() => {
  if (!props.title) return props.html
  const firstHeading = props.html.match(/^\s*<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i)
  if (!firstHeading || htmlToText(firstHeading[1]) !== props.title.trim()) return props.html
  return props.html.slice(firstHeading[0].length)
})
</script>

<template>
  <!-- Markdown 正文：仅承接服务端已经清理过的 HTML。 -->
  <div
    class="markdown-content"
    v-html="renderedHtml"
  />
</template>
