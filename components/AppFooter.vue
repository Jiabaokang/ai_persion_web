<script setup lang="ts">
/**
 * 页脚：版权 + 主要链接
 * 移动端纵向排列，桌面端横向分布
 */

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div>© {{ year }} 智识花园 · Built with curiosity</div>
      <div class="footer-links">
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/blog">博客</NuxtLink>
        <NuxtLink to="/notes">笔记</NuxtLink>
        <NuxtLink to="/wechat">公众号</NuxtLink>
        <NuxtLink to="/login">登录</NuxtLink>
      </div>
    </div>
  </footer>
</template>
