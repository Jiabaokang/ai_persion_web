<script setup lang="ts">
import { useDrawer } from '~/composables/useDrawer'

const { isOpen, open } = useDrawer()
</script>

<template>
  <!-- 移动端顶部品牌栏，桌面端由侧栏承载导航 -->
  <header class="paper-mobile-header">
    <NuxtLink
      to="/"
      class="nav-brand"
    >
      <span
        class="nav-brand-mark"
        aria-hidden="true"
      >智</span>
      <span>智识花园</span>
    </NuxtLink>

    <button
      class="paper-icon-button"
      data-menu-toggle
      aria-label="打开菜单"
      :aria-expanded="isOpen"
      @click="open"
    >
      <span
        class="i-carbon-menu"
        aria-hidden="true"
      />
    </button>
  </header>

  <AppDrawer v-model:open="isOpen" />
</template>
