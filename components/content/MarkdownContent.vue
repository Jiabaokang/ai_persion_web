<script setup lang="ts">
defineProps<{
  html: string
}>()
</script>

<template>
  <!-- Markdown 正文：仅承接服务端已经清理过的 HTML。 -->
  <div
    class="markdown-content"
    v-html="html"
  />
</template>
