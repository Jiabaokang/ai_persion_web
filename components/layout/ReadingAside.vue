<script setup lang="ts">
const now = new Date()
const dateParts = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
}).formatToParts(now)

const month = dateParts.find(part => part.type === 'month')?.value ?? ''
const day = dateParts.find(part => part.type === 'day')?.value ?? ''
const weekday = dateParts.find(part => part.type === 'weekday')?.value ?? ''
</script>

<template>
  <!-- 桌面端阅读索引与知识摘录 -->
  <aside class="reading-aside" aria-label="阅读索引">
    <div class="reading-aside__date">
      <strong>{{ month }} / {{ day }}</strong>
      <span>{{ now.getFullYear() }} · {{ weekday }}</span>
    </div>

    <section class="reading-aside__section">
      <p class="paper-kicker">阅读索引</p>
      <h2>近期阅读</h2>
      <nav class="reading-aside__links">
        <NuxtLink to="/blog">查看最新长文</NuxtLink>
        <NuxtLink to="/notes">翻阅知识笔记</NuxtLink>
        <NuxtLink to="/inspiration">拾取灵感碎片</NuxtLink>
      </nav>
    </section>

    <blockquote class="reading-aside__quote">
      <span aria-hidden="true">“</span>
      <p>真正的知识不是记住多少，而是能随时找到并为我所用。</p>
      <cite>— 智识花园</cite>
    </blockquote>
  </aside>
</template>
