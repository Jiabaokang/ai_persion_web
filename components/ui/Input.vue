<script setup lang="ts">
defineProps<{ modelValue: string, name: string, type?: string, placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :name="name"
    :type="type || 'text'"
    :placeholder="placeholder"
    :value="modelValue"
    class="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition focus:border-[rgba(34,211,238,0.55)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
