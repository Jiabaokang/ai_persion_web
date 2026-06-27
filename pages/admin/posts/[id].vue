<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { data: post } = await useFetch(`/api/contents/${route.params.id}`, { credentials: 'include' })

useHead({
  title: '编辑内容 · 管理后台',
})
</script>

<template>
  <PostForm
    v-if="post"
    :id="Number(route.params.id)"
    :initial="post"
  />
</template>
