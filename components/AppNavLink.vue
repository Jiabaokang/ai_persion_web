<script setup lang="ts">
/**
 * 导航链接组件
 * 自动根据当前路由计算 active 状态
 * 父组件无需手动传递 active
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  to: string
  page: 'home' | 'blog' | 'notes' | 'wechat' | 'ai'
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.page === 'home') return route.path === '/'
  return route.path === props.to || route.path.startsWith(`${props.to}/`)
})
</script>

<template>
  <NuxtLink
    :to="to"
    :data-nav-link="page"
    class="nav-link"
    :class="{ 'is-active': isActive }"
  >
    <slot />
  </NuxtLink>
</template>
