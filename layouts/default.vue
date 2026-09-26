<script setup lang="ts">
const route = useRoute()
const { isOpen } = useDrawer()
// 只在内容详情中加载阅读目录，首页和列表保留完整正文宽度。
const hasReadingGuide = computed(() => /^\/(blog|notes|wechat)\/[^/]+$/.test(route.path))
</script>

<template>
  <!-- 暖纸个人书桌：窄侧栏和正文，阅读索引按需显示。 -->
  <div class="paper-app">
    <a
      class="skip-link"
      href="#main-content"
    >跳到主要内容</a>
    <AppHeader />

    <div
      class="paper-shell"
      :inert="isOpen"
    >
      <LayoutPaperSidebar />

      <div class="paper-shell__center">
        <main
          id="main-content"
          class="paper-shell__main"
          tabindex="-1"
        >
          <LayoutReadingAside v-if="hasReadingGuide" />
          <slot />
        </main>
        <AppFooter />
      </div>
    </div>
  </div>
</template>
