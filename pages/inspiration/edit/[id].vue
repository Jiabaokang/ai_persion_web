<script setup lang="ts">
import InspirationForm from '~/components/inspiration/InspirationForm.vue'

const route = useRoute()
const { data: post } = await useFetch<any>(`/api/contents/${route.params.id}`, { credentials: 'include' })

if (!post.value || post.value.type !== 'inspiration') {
  throw createError({ statusCode: 404 })
}
</script>

<template>
  <div class="container section">
    <h1 class="text-3xl font-bold mb-6">
      编辑灵感
    </h1>
    <InspirationForm
      :id="Number(route.params.id)"
      :initial="post"
    />
  </div>
</template>

