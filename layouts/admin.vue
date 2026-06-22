<script setup lang="ts">
const { user, fetchMe, logout } = useAuth()
await fetchMe()
if (!user.value) await navigateTo('/login')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold">
        管理后台
      </h1>
      <div class="flex items-center gap-4 text-sm">
        <span>{{ user?.username }}</span>
        <button
          class="text-red-500 hover:underline"
          @click="logout"
        >
          登出
        </button>
      </div>
    </header>
    <div class="flex">
      <nav class="w-48 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4 space-y-1 text-sm">
        <NuxtLink
          to="/admin"
          class="block px-3 py-2 rounded hover:bg-gray-100"
        >仪表盘</NuxtLink>
        <NuxtLink
          to="/admin/posts"
          class="block px-3 py-2 rounded hover:bg-gray-100"
        >文章管理</NuxtLink>
      </nav>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
