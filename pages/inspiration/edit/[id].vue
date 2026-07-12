<script setup lang="ts">
import InspirationForm from '~/components/inspiration/InspirationForm.vue'

const route = useRoute()
const { data: post } = await useFetch<any>(`/api/contents/${route.params.id}`, { credentials: 'include' })

if (!post.value || post.value.type !== 'inspiration') {
  throw createError({ statusCode: 404 })
}
</script>

<template>
  <!-- 编辑灵感工作区：复用统一表单且保留当前内容数据。 -->
  <div class="inspiration-workspace">
    <header>
      <p class="paper-kicker">
        Refine a fragment
      </p>
      <h1>编辑灵感</h1>
    </header>
    <InspirationForm
      :id="Number(route.params.id)"
      :initial="post"
    />
  </div>
</template>

<style scoped>
.inspiration-workspace { padding: 24px 0 72px; }
.inspiration-workspace > header { margin-bottom: 30px; padding-bottom: 22px; border-bottom: 1px solid var(--rule-strong); }
.inspiration-workspace h1 { margin-top: 6px; font-size: clamp(2.5rem, 6vw, 4.6rem); font-weight: 500; }
</style>
