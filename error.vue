<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number, message: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <h1 class="text-6xl font-bold text-cyan mb-4">
      {{ props.error.statusCode }}
    </h1>
    <p class="text-xl text-ink-2 mb-8">
      {{ props.error.message }}
    </p>
    <button
      class="px-6 py-3 rounded-full bg-cyan text-base font-medium hover:opacity-80 transition"
      @click="handleError"
    >
      回到首页
    </button>
  </div>
</template>
