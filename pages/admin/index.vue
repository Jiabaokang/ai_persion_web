<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: posts } = await useFetch('/api/contents', { credentials: 'include' })
const total = computed(() => posts.value?.length ?? 0)
const published = computed(() => posts.value?.filter((p: any) => p.status === 'published').length ?? 0)
const drafts = computed(() => posts.value?.filter((p: any) => p.status === 'draft').length ?? 0)
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">
      仪表盘
    </h2>
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">
          总文章
        </div>
        <div class="text-3xl font-bold mt-2">
          {{ total }}
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">
          已发布
        </div>
        <div class="text-3xl font-bold mt-2 text-green-600">
          {{ published }}
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">
          草稿
        </div>
        <div class="text-3xl font-bold mt-2 text-yellow-600">
          {{ drafts }}
        </div>
      </div>
    </div>
  </div>
</template>
