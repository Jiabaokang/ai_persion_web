<script setup lang="ts">
/**
 * 顶部导航
 * 整合 brand + 桌面导航 + 主题切换 + 移动端菜单触发
 * 抽屉状态由 useDrawer composable 共享管理
 */
import { useDrawer } from '~/composables/useDrawer'

const { isOpen, open } = useDrawer()
</script>

<template>
  <nav
    class="nav"
    aria-label="主导航"
  >
    <div class="nav-inner">
      <!-- 品牌 -->
      <NuxtLink
        to="/"
        class="nav-brand"
      >
        <span class="nav-brand-mark">智</span>
        <span>智识花园</span>
      </NuxtLink>

      <!-- 桌面导航 -->
      <div class="nav-links">
        <AppNavLink
          to="/"
          page="home"
        >
          首页
        </AppNavLink>
        <AppNavLink
          to="/blog"
          page="blog"
        >
          博客
        </AppNavLink>
        <AppNavLink
          to="/notes"
          page="notes"
        >
          笔记
        </AppNavLink>
        <AppNavLink
          to="/wechat"
          page="wechat"
        >
          公众号
        </AppNavLink>
      </div>

      <!-- 操作区：主题切换 + 移动端菜单按钮 -->
      <div class="nav-actions">
        <AppThemeToggle />
        <button
          class="nav-icon-btn nav-menu-btn"
          data-menu-toggle
          aria-label="打开菜单"
          @click="open"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- 移动端抽屉 -->
  <AppDrawer v-model:open="isOpen" />
</template>
