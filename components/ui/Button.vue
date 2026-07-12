<script setup lang="ts">
withDefaults(defineProps<{ type?: 'button' | 'submit', disabled?: boolean }>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <!-- 通用主操作按钮：使用暖纸体系的陶土红强调色。 -->
  <button
    :type="type"
    :disabled="disabled"
    class="ui-button"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid var(--accent-terracotta-dark);
  border-radius: var(--radius-sm);
  background: var(--accent-terracotta);
  color: var(--paper-surface);
  font-weight: 700;
  transition: background var(--duration-fast), opacity var(--duration-fast);
}

.ui-button:hover:not(:disabled) { background: var(--accent-terracotta-dark); }
.ui-button:disabled { cursor: not-allowed; opacity: 0.55; }
</style>
