<script setup lang="ts">
import InspirationForm from '~/components/inspiration/InspirationForm.vue'
</script>

<template>
  <!-- 新建灵感工作区：标题轻量，编辑器保持主视觉。 -->
  <div class="inspiration-workspace">
    <header>
      <p class="paper-kicker">
        Capture a fragment
      </p>
      <h1>新建灵感</h1>
    </header>
    <InspirationForm />
  </div>
</template>

<style scoped>
.inspiration-workspace { padding: 24px 0 72px; }
.inspiration-workspace > header { margin-bottom: 30px; padding-bottom: 22px; border-bottom: 1px solid var(--rule-strong); }
.inspiration-workspace h1 { margin-top: 6px; font-size: clamp(2.5rem, 6vw, 4.6rem); font-weight: 500; }
</style>
