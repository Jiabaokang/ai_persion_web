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
    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
