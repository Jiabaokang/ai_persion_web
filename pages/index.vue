<script setup lang="ts">
useHead({ title: '智识花园 - 个人网站' })

const { data: posts } = await useFetch<any[]>('/api/contents?status=published&visibility=public', {
  default: () => [],
})
const latest = computed(() => posts.value?.slice(0, 6) ?? [])
</script>

<template>
  <!-- 首页编辑手记：宣言、写作入口与最新内容形成一条连续阅读流。 -->
  <div class="home-editorial">
    <header class="home-manifesto">
      <div class="home-manifesto__copy">
        <p class="paper-kicker">
          Editor's notebook · 2026
        </p>
        <h1>记录思考，<br>让知识缓慢生长。</h1>
        <p>
          这里收集技术实践、知识笔记与偶然闪现的灵感。
          不追逐喧闹，只留下值得再次翻阅的文字。
        </p>
        <div class="home-manifesto__actions">
          <NuxtLink
            to="/admin/posts/new"
            class="home-primary-action"
          >
            写一篇文章 <span aria-hidden="true">→</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/posts/new?import=1"
            class="paper-link"
          >
            导入 Markdown
          </NuxtLink>
        </div>
      </div>
      <img
        src="/images/ink-plant.webp"
        alt=""
        class="home-manifesto__plant"
        aria-hidden="true"
      >
    </header>

    <section
      class="home-latest"
      aria-labelledby="latest-heading"
    >
      <div class="editorial-section-head">
        <div>
          <p class="paper-kicker">
            Latest writing
          </p>
          <h2 id="latest-heading">
            近期书写
          </h2>
        </div>
        <NuxtLink
          to="/blog"
          class="paper-link"
        >查看全部</NuxtLink>
      </div>
      <ContentList
        v-if="latest.length"
        :items="latest"
      />
      <p
        v-if="!latest.length"
        class="editorial-empty"
      >
        第一篇文字正在路上。
      </p>
    </section>
  </div>
</template>

<style scoped>
.home-editorial {
  padding-bottom: 48px;
}

.home-manifesto {
  position: relative;
  min-height: 440px;
  padding: clamp(28px, 6vw, 72px) 0 clamp(52px, 8vw, 88px);
  overflow: hidden;
  border-bottom: 1px solid var(--rule-strong);
}

.home-manifesto__copy {
  position: relative;
  z-index: 1;
  max-width: 620px;
}

.home-manifesto h1 {
  max-width: 9em;
  margin-top: 16px;
  font-size: clamp(3rem, 8vw, 6.2rem);
  font-weight: 500;
  line-height: 1.04;
  letter-spacing: -0.055em;
}

.home-manifesto__copy > p:not(.paper-kicker) {
  max-width: 38em;
  margin: 28px 0 0;
  color: var(--ink-secondary);
  line-height: 1.9;
}

.home-manifesto__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-top: 34px;
}

.home-primary-action {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  gap: 20px;
  padding: 10px 18px;
  border: 1px solid var(--accent-terracotta-dark);
  border-radius: var(--radius-sm);
  background: var(--accent-terracotta);
  color: var(--paper-surface);
  font-weight: 700;
}

.home-primary-action:hover {
  background: var(--accent-terracotta-dark);
}

.home-manifesto__plant {
  position: absolute;
  right: -30%;
  bottom: -8%;
  width: min(680px, 78%);
  mix-blend-mode: multiply;
  opacity: 0.3;
  pointer-events: none;
}

.home-latest {
  padding-top: clamp(42px, 7vw, 76px);
}

.editorial-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.editorial-section-head h2 {
  margin-top: 5px;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 500;
}

.editorial-empty {
  padding: 44px 0;
  border-top: 1px solid var(--rule-strong);
  border-bottom: 1px solid var(--rule-color);
  color: var(--ink-muted);
}

@media (max-width: 640px) {
  .home-manifesto { min-height: 510px; }
  .home-manifesto__plant { right: -55%; width: 120%; }
}
</style>
