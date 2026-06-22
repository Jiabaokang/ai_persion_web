<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      新建文章
    </h2>
    <PostForm />
  </div>
</template>
