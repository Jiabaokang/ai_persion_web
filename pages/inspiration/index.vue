<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?type=inspiration&status=published', {
  default: () => [], credentials: 'include',
})
</script>

<template>
  <div class="container section">
    <h1 class="text-3xl font-bold mb-6">
      灵感
    </h1>
    <div class="stack-lg">
      <article
        v-for="p in posts"
        :key="p.slug"
        class="glass p-6 hover:translate-y-[-2px] transition"
      >
        <h3 class="text-xl font-display font-semibold mb-2 text-ink">
          <NuxtLink
            :to="`/inspiration/${p.slug}`"
            class="hover:text-cyan transition"
          >
            {{ p.title }}
          </NuxtLink>
        </h3>
        <p
          v-if="p.summary"
          class="text-ink-2 mb-3"
        >
          {{ p.summary }}
        </p>
      </article>
    </div>
    <div
      v-if="!posts.length"
      class="text-center py-12 text-ink-2"
    >
      还没有灵感
    </div>
  </div>
</template>
