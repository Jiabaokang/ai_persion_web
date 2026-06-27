<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({ layout: 'admin' })

useHead({
  title: '新建内容 · 管理后台',
})
</script>

<template>
  <PostForm />
</template>
