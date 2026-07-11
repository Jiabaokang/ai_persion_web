<script setup lang="ts">
const { links, isActive } = usePublicNavigation()
</script>

<template>
  <!-- 桌面端品牌与主导航侧栏 -->
  <aside class="paper-sidebar" aria-label="主导航">
    <NuxtLink to="/" class="paper-brand">
      <span class="paper-brand__mark" aria-hidden="true">智</span>
      <span class="paper-brand__copy">
        <strong>智识花园</strong>
        <small>Editorial Notebook</small>
      </span>
    </NuxtLink>

    <nav class="paper-sidebar__nav">
      <NuxtLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="paper-sidebar__link"
        :class="{ 'is-active': isActive(item.to) }"
      >
        <span :class="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="paper-sidebar__foot">
      <NuxtLink to="/login" class="paper-sidebar__account">
        <span class="i-carbon-user-avatar" aria-hidden="true" />
        <span>进入写作后台</span>
      </NuxtLink>
      <p>慢慢写，慢慢长。</p>
    </div>
  </aside>
</template>
