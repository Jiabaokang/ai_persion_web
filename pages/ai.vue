<script setup lang="ts">
interface NavLink {
  name: string
  description: string
  url: string
  icon: string
}

interface NavGroup {
  id: string
  title: string
  links: NavLink[]
}

interface NavData {
  source: string
  scrapedAt: string
  groups: NavGroup[]
  totalLinks: number
}

useHead({
  title: 'AI 导航 · 智识花园',
  meta: [
    { name: 'description', content: '精选 AI 工具、模型、社区与学习资源导航。' },
  ],
})

const tutorialLink = {
  title: 'AI教程',
  description: '系统化学习 AI 工具、工作流与落地实践，适合快速补齐知识路径。',
  href: 'https://ai.codefather.cn/library/2010994846520700929',
}

const { data, pending, error } = await useFetch<NavData>('/api/ai-nav', {
  default: () => ({ source: '', scrapedAt: '', groups: [], totalLinks: 0 }),
})

const query = ref('')
const activeGroup = ref('')
const observer = ref<IntersectionObserver | null>(null)

const filteredGroups = computed<NavGroup[]>(() => {
  const groups = data.value?.groups ?? []
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return groups

  return groups
    .map(group => ({
      ...group,
      links: group.links.filter(link =>
        link.name.toLowerCase().includes(keyword)
        || link.description.toLowerCase().includes(keyword),
      ),
    }))
    .filter(group => group.links.length)
})

const totalAfterFilter = computed(() =>
  filteredGroups.value.reduce((total, group) => total + group.links.length, 0),
)

const updatedAt = computed(() => {
  if (!data.value?.scrapedAt) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(data.value.scrapedAt))
})

// 平滑滚动到所选工具分类，并预留移动顶部栏空间。
function scrollToGroup(id: string) {
  const target = document.getElementById(`group-${id}`)
  if (!target) return
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - 88,
    behavior: 'smooth',
  })
}

// 隐藏加载失败的站点图标，让底层通用应用图标自然显露。
function onIconError(event: Event) {
  const image = event.target as HTMLImageElement
  image.hidden = true
}

// 清除关键词并恢复完整工具书架。
function clearQuery() {
  query.value = ''
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  observer.value = new IntersectionObserver((entries) => {
    const current = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (current) activeGroup.value = (current.target as HTMLElement).dataset.groupId ?? ''
  }, { rootMargin: '-90px 0px -65% 0px' })

  document.querySelectorAll('[data-group-id]').forEach((element) => {
    observer.value?.observe(element)
  })
})

onBeforeUnmount(() => observer.value?.disconnect())
</script>

<template>
  <!-- AI 工具书架：保留搜索和分类行为，以纸面索引替代发光卡片。 -->
  <div class="ai-library">
    <header class="ai-head">
      <div class="ai-head__title">
        <p class="paper-kicker">
          Curated tool index
        </p>
        <h1>AI 工具导航</h1>
      </div>
      <div class="ai-head__meta">
        <strong>{{ data?.totalLinks ?? 0 }}</strong>
        <span>个精选站点</span>
        <small v-if="updatedAt">更新于 {{ updatedAt }}</small>
      </div>
    </header>

    <a
      :href="tutorialLink.href"
      target="_blank"
      rel="noopener noreferrer"
      class="ai-tutorial"
      data-ai-tutorial
    >
      <span class="ai-tutorial__number">Editor's pick · 01</span>
      <span class="ai-tutorial__copy">
        <strong>{{ tutorialLink.title }}</strong>
        <small>{{ tutorialLink.description }}</small>
      </span>
      <span class="ai-tutorial__action">立即查看教程 ↗</span>
    </a>

    <div class="ai-search-wrap">
      <label class="ai-search">
        <span
          class="i-carbon-search"
          aria-hidden="true"
        />
        <span class="sr-only">搜索 AI 工具</span>
        <input
          v-model="query"
          type="search"
          placeholder="搜索 ChatGPT、Cursor、图像生成……"
          autocomplete="off"
          spellcheck="false"
        >
        <button
          v-if="query"
          type="button"
          aria-label="清空搜索"
          @click="clearQuery"
        >
          <span
            class="i-carbon-close"
            aria-hidden="true"
          />
        </button>
      </label>
      <p v-if="query">
        找到 {{ totalAfterFilter }} 个结果
      </p>
    </div>

    <div
      v-if="error"
      class="ai-state"
      role="alert"
    >
      <strong>工具目录暂时无法读取</strong>
      <span>{{ error.statusMessage || '请稍后重试' }}</span>
    </div>
    <div
      v-else-if="pending && !data?.groups?.length"
      class="ai-state"
    >
      <span
        class="i-carbon-progress-bar-round ai-spin"
        aria-hidden="true"
      />
      <span>正在整理工具目录……</span>
    </div>
    <div
      v-else-if="query && !totalAfterFilter"
      class="ai-state"
    >
      <strong>没有找到「{{ query }}」</strong>
      <button
        type="button"
        @click="clearQuery"
      >
        清空搜索
      </button>
    </div>

    <div
      v-else
      class="ai-layout"
    >
      <aside
        class="ai-catalog"
        aria-label="AI 工具分类"
      >
        <p>分类索引</p>
        <button
          v-for="group in filteredGroups"
          :key="group.id"
          type="button"
          :class="{ 'is-active': activeGroup === group.id }"
          @click="scrollToGroup(group.id)"
        >
          <span>{{ group.title }}</span>
          <small>{{ group.links.length }}</small>
        </button>
      </aside>

      <section class="ai-main">
        <section
          v-for="(group, groupIndex) in filteredGroups"
          :id="`group-${group.id}`"
          :key="group.id"
          :data-group-id="group.id"
          class="ai-group"
        >
          <header class="ai-group__head">
            <span>{{ String(groupIndex + 1).padStart(2, '0') }}</span>
            <h2>{{ group.title }}</h2>
            <small>{{ group.links.length }} entries</small>
          </header>
          <div class="ai-shelf">
            <a
              v-for="link in group.links"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="ai-tool"
            >
              <span class="ai-tool__icon">
                <span
                  class="i-carbon-application-web"
                  aria-hidden="true"
                />
                <img
                  v-if="link.icon"
                  :src="link.icon"
                  :alt="`${link.name} 图标`"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="onIconError"
                >
              </span>
              <span class="ai-tool__copy">
                <strong>{{ link.name }}</strong>
                <small>{{ link.description || '暂无描述' }}</small>
              </span>
              <span
                class="ai-tool__arrow"
                aria-hidden="true"
              >↗</span>
            </a>
          </div>
        </section>

        <footer class="ai-footer">
          数据来源：
          <a
            :href="data?.source || 'https://tool.lu/nav/'"
            target="_blank"
            rel="noopener noreferrer"
          >tool.lu</a>
          · 离线静态整理
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ai-library { padding: 26px 0 72px; }
.ai-head { display: flex; align-items: end; justify-content: space-between; gap: 28px; padding-bottom: 30px; border-bottom: 1px solid var(--rule-strong); }
.ai-head h1 { margin-top: 7px; font-size: clamp(3rem, 8vw, 6rem); font-weight: 500; letter-spacing: -0.055em; }
.ai-head__meta { display: grid; justify-items: end; padding-bottom: 8px; color: var(--ink-muted); }
.ai-head__meta strong { color: var(--accent-terracotta); font-family: var(--font-display); font-size: 2.6rem; font-weight: 500; line-height: 1; }
.ai-head__meta span { color: var(--ink-secondary); font-size: 0.8rem; }
.ai-head__meta small { margin-top: 5px; font-size: 0.66rem; }
.ai-tutorial { display: grid; grid-template-columns: 130px minmax(0, 1fr) auto; gap: 20px; align-items: center; margin-top: 24px; padding: 18px 0; border-top: 1px solid var(--rule-color); border-bottom: 1px solid var(--rule-color); }
.ai-tutorial__number { color: var(--accent-moss); font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; }
.ai-tutorial__copy { display: grid; gap: 4px; }
.ai-tutorial__copy strong { font-family: var(--font-display); font-size: 1.35rem; }
.ai-tutorial__copy small { color: var(--ink-secondary); line-height: 1.65; }
.ai-tutorial__action { color: var(--accent-terracotta-dark); font-size: 0.78rem; font-weight: 700; }
.ai-tutorial:hover .ai-tutorial__copy strong { color: var(--accent-terracotta-dark); }
.ai-search-wrap { margin: 34px 0 44px; }
.ai-search { display: flex; max-width: 680px; min-height: 50px; align-items: center; gap: 11px; padding: 0 14px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: var(--paper-surface); }
.ai-search:focus-within { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.ai-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink-primary); }
.ai-search button { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; color: var(--ink-muted); }
.ai-search-wrap > p { margin: 8px 0 0; color: var(--ink-muted); font-size: 0.72rem; }
.ai-layout { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: clamp(26px, 5vw, 58px); align-items: start; }
.ai-catalog { position: sticky; top: 24px; display: grid; border-top: 1px solid var(--rule-strong); }
.ai-catalog > p { margin: 0; padding: 13px 4px; color: var(--ink-muted); font-size: 0.68rem; letter-spacing: 0.1em; }
.ai-catalog button { display: flex; min-height: 40px; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 4px; border-top: 1px solid var(--rule-color); color: var(--ink-secondary); text-align: left; font-size: 0.77rem; }
.ai-catalog button.is-active,
.ai-catalog button:hover { color: var(--accent-terracotta-dark); }
.ai-catalog small { color: var(--ink-faint); font-family: var(--font-mono); }
.ai-group + .ai-group { margin-top: 56px; }
.ai-group__head { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 12px; align-items: baseline; padding-bottom: 13px; border-bottom: 1px solid var(--rule-strong); }
.ai-group__head > span,
.ai-group__head small { color: var(--ink-muted); font-family: var(--font-mono); font-size: 0.64rem; }
.ai-group__head h2 { font-size: 1.5rem; font-weight: 600; }
.ai-shelf { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ai-tool { display: grid; grid-template-columns: 36px minmax(0, 1fr) 16px; gap: 12px; align-items: start; min-height: 92px; padding: 18px 12px 18px 0; border-bottom: 1px solid var(--rule-color); }
.ai-tool:nth-child(odd) { padding-right: 22px; border-right: 1px solid var(--rule-color); }
.ai-tool:nth-child(even) { padding-left: 22px; }
.ai-tool:hover { background: rgba(233, 222, 204, 0.32); }
.ai-tool__icon { position: relative; display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; color: var(--ink-muted); font-size: 1.25rem; }
.ai-tool__icon img { position: absolute; inset: 3px; width: 28px; height: 28px; object-fit: contain; }
.ai-tool__copy { display: grid; gap: 4px; min-width: 0; }
.ai-tool__copy strong { font-family: var(--font-display); font-size: 0.98rem; }
.ai-tool__copy small { display: -webkit-box; overflow: hidden; color: var(--ink-secondary); font-size: 0.72rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.ai-tool__arrow { color: var(--accent-terracotta); font-size: 0.72rem; }
.ai-state { display: grid; justify-items: center; gap: 10px; padding: 72px 20px; border-top: 1px solid var(--rule-color); border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); text-align: center; }
.ai-state button { color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
.ai-spin { animation: ai-spin 0.9s linear infinite; }
@keyframes ai-spin { to { transform: rotate(360deg); } }
.ai-footer { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--rule-strong); color: var(--ink-muted); font-size: 0.68rem; }
.ai-footer a { color: var(--accent-terracotta-dark); text-decoration: underline; }
@media (max-width: 720px) {
  .ai-head { align-items: start; flex-direction: column; }
  .ai-head__meta { justify-items: start; }
  .ai-tutorial { grid-template-columns: 1fr; gap: 8px; }
  .ai-layout { grid-template-columns: 1fr; }
  .ai-catalog { position: static; display: flex; overflow-x: auto; border-bottom: 1px solid var(--rule-color); }
  .ai-catalog > p { display: none; }
  .ai-catalog button { flex: 0 0 auto; gap: 10px; padding: 10px 12px; border-top: 0; }
  .ai-shelf { grid-template-columns: 1fr; }
  .ai-tool:nth-child(odd),
  .ai-tool:nth-child(even) { padding-right: 0; padding-left: 0; border-right: 0; }
}
</style>
