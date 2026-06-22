<script setup lang="ts">
withDefaults(defineProps<{ type?: 'button' | 'submit', disabled?: boolean }>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
  >
    <slot />
  </button>
</template>
