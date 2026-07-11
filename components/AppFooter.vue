<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <!-- 中栏底部版权与辅助链接 -->
  <footer class="footer">
    <div class="footer-inner">
      <div>© {{ year }} 智识花园 · 用好奇心浇灌的小角落</div>
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
