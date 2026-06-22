<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { data: post } = await useFetch(`/api/contents/${route.params.id}`, { credentials: 'include' })
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      编辑文章
    </h2>
    <PostForm
      v-if="post"
      :id="Number(route.params.id)"
      :initial="post"
    />
  </div>
</template>
