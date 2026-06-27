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
    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-900 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>
