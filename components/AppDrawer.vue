<script setup lang="ts">
/**
 * 移动端抽屉
 * 使用 useDrawer composable 与 AppHeader 共享开关状态
 * 同时 emit update:open 保持 v-model 兼容
 */
import { useDrawer } from '~/composables/useDrawer'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { close: closeDrawer } = useDrawer()

function close() {
  emit('update:open', false)
  closeDrawer()
}
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <div
      v-if="open"
      class="drawer-overlay is-open"
      data-drawer-overlay
      @click="close"
    />
    <!-- 抽屉主体 -->
    <aside
      v-if="open"
      class="drawer is-open"
      data-drawer
      role="dialog"
      aria-modal="true"
      aria-label="移动端导航"
    >
      <div class="drawer-header">
        <NuxtLink
          to="/"
          class="nav-brand"
          @click="close"
        >
          <span class="nav-brand-mark">智</span>
          <span>智识花园</span>
        </NuxtLink>
        <button
          class="nav-icon-btn"
          data-drawer-close
          aria-label="关闭菜单"
          @click="close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="drawer-links">
        <NuxtLink
          to="/"
          class="drawer-link"
          @click="close"
        >首页</NuxtLink>
        <NuxtLink
          to="/blog"
          class="drawer-link"
          @click="close"
        >博客</NuxtLink>
        <NuxtLink
          to="/notes"
          class="drawer-link"
          @click="close"
        >笔记</NuxtLink>
        <NuxtLink
          to="/wechat"
          class="drawer-link"
          @click="close"
        >公众号</NuxtLink>
      </nav>
    </aside>
  </Teleport>
</template>
