<template>
  <!-- 全站暖纸三栏布局 -->
  <div class="paper-app">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <AppHeader />

    <div class="paper-shell">
      <LayoutPaperSidebar />

      <div class="paper-shell__center">
        <main id="main-content" class="paper-shell__main" tabindex="-1">
          <slot />
        </main>
        <AppFooter />
      </div>

      <LayoutReadingAside />
    </div>
  </div>
</template>
