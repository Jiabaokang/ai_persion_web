<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { data: posts, refresh } = await useFetch<any[]>('/api/contents', { credentials: 'include' })

async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">
        文章管理
      </h2>
      <NuxtLink
        to="/admin/posts/new"
        class="px-4 py-2 bg-primary-500 text-white rounded"
      >新建</NuxtLink>
    </div>
    <div class="bg-white rounded shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-3">
              标题
            </th>
            <th class="text-left p-3">
              类型
            </th>
            <th class="text-left p-3">
              可见性
            </th>
            <th class="text-left p-3">
              状态
            </th>
            <th class="text-left p-3">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in posts"
            :key="p.id"
            class="border-t border-gray-100"
          >
            <td class="p-3">
              {{ p.title }}
            </td>
            <td class="p-3">
              {{ p.type }}
            </td>
            <td class="p-3">
              {{ p.visibility }}
            </td>
            <td class="p-3">
              {{ p.status }}
            </td>
            <td class="p-3 space-x-2">
              <NuxtLink
                :to="`/admin/posts/${p.id}`"
                class="text-primary-500 hover:underline"
              >编辑</NuxtLink>
              <button
                class="text-red-500 hover:underline"
                @click="remove(p.id)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
