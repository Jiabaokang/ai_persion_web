<script setup lang="ts">
import { useDrawer } from '~/composables/useDrawer'
import { usePublicNavigation } from '~/composables/usePublicNavigation'

const { isOpen, open } = useDrawer()
const { links, isActive } = usePublicNavigation()
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
      <span class="nav-brand-copy">智识花园<small>阅读、实践、留下笔记</small></span>
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

  <!-- 常用入口固定在拇指可触达的位置，其他页面通过原有抽屉进入。 -->
  <nav
    class="paper-bottom-nav"
    aria-label="快捷导航"
    :inert="isOpen"
  >
    <NuxtLink
      v-for="item in links.slice(0, 3)"
      :key="item.to"
      :to="item.to"
      :class="{ 'is-active': isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <span
        :class="item.icon"
        aria-hidden="true"
      />
      <span>{{ item.label }}</span>
    </NuxtLink>
    <button
      type="button"
      :aria-expanded="isOpen"
      aria-label="打开更多导航"
      @click="open"
    >
      <span
        class="i-carbon-overflow-menu-horizontal"
        aria-hidden="true"
      />
      <span>更多</span>
    </button>
  </nav>
</template>
