<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch<any>('/api/contents', {
  query: { type: 'inspiration', slug: route.params.slug },
  credentials: 'include',
  transform: (list: any[]) => list[0],
})
if (!post.value) throw createError({ statusCode: 404 })

// 删除当前灵感后返回索引页，避免停留在已失效的详情路由。
async function remove() {
  if (!post.value) return
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${post.value.id}`, { method: 'DELETE', credentials: 'include' })
  await navigateTo('/inspiration')
}
</script>

<template>
  <!-- 灵感书页：编辑操作与正文阅读保持视觉分离。 -->
  <article
    v-if="post"
    class="reading-page reading-article"
  >
    <header class="reading-header">
      <div class="reading-actions">
        <NuxtLink
          to="/inspiration"
        >
          ← 返回灵感
        </NuxtLink>
        <div class="reading-actions__group">
          <NuxtLink
            :to="`/inspiration/edit/${post.id}`"
          >
            编辑
          </NuxtLink>
          <button
            type="button"
            @click="remove"
          >
            删除
          </button>
        </div>
      </div>
      <div class="reading-meta">
        <span>灵感</span>
        <span v-if="post.updatedAt">更新于 {{ new Date(post.updatedAt).toLocaleDateString('zh-CN') }}</span>
      </div>
      <h1>
        {{ post.title }}
      </h1>
    </header>
    <ContentMarkdownContent
      :html="post.contentHtml || ''"
      :title="post.title"
    />
  </article>
</template>
