<script setup lang="ts">
defineProps<{ modelValue: string, name: string, type?: string, placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <!-- 通用文本输入：清晰边界、纸面底色和陶土色聚焦反馈。 -->
  <input
    :name="name"
    :type="type || 'text'"
    :placeholder="placeholder"
    :value="modelValue"
    class="ui-input"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<style scoped>
.ui-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius-sm);
  outline: 0;
  background: var(--paper-surface);
  color: var(--ink-primary);
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.ui-input::placeholder { color: var(--ink-faint); }
.ui-input:focus { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
</style>
