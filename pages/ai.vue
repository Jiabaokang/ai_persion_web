<script setup lang="ts">
/**
 * AI 网址导航
 *
 * 数据来源：tool.lu/nav/?node_id=27（由 scripts/scrape-ai-nav.mjs 离线抓取）
 * 通过 /api/ai-nav 暴露给前端
 *
 * 特性：
 *   - 顶部品牌区 + 实时搜索（按名称/描述过滤）
 *   - 左侧分组锚点目录（桌面端 sticky，移动端水平滚动）
 *   - 主区按分组渲染卡片网格
 *   - 图标加载失败时 fallback 到首字母色块
 */

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
    { name: 'description', content: '精选 AI 工具与资源导航：大语言模型、AI 工具、社区、微调模型、Embedding/Reranker、图像/音视频生成等' },
  ],
})

const { data, pending, error } = await useFetch<NavData>('/api/ai-nav', {
  default: () => ({ source: '', scrapedAt: '', groups: [], totalLinks: 0 }),
})

const query = ref('')
const activeGroup = ref<string>('')

// 搜索过滤后的分组（空分组自动隐藏）
const filteredGroups = computed<NavGroup[]>(() => {
  const groups = data.value?.groups ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return groups
  return groups
    .map(g => ({
      ...g,
      links: g.links.filter(l =>
        l.name.toLowerCase().includes(q)
        || l.description.toLowerCase().includes(q),
      ),
    }))
    .filter(g => g.links.length > 0)
})

const totalAfterFilter = computed(() =>
  filteredGroups.value.reduce((sum, g) => sum + g.links.length, 0),
)

// 滚动到分组
function scrollToGroup(id: string) {
  const el = document.getElementById(`group-${id}`)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 用 IntersectionObserver 高亮当前可见分组（仅客户端）
const observer = ref<IntersectionObserver | null>(null)
onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  observer.value = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) {
        const id = (visible[0].target as HTMLElement).dataset.groupId
        if (id) activeGroup.value = id
      }
    },
    { rootMargin: '-100px 0px -60% 0px', threshold: 0 },
  )
  document.querySelectorAll('[data-group-id]').forEach((el) => {
    observer.value!.observe(el)
  })
})
onBeforeUnmount(() => observer.value?.disconnect())

// 图标加载失败 fallback
function onIconError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) parent.classList.add('icon-fallback')
}

// 友好的更新时间
const updatedAt = computed(() => {
  if (!data.value?.scrapedAt) return ''
  try {
    return new Date(data.value.scrapedAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }
  catch {
    return ''
  }
})

function clearQuery() {
  query.value = ''
}
</script>

<template>
  <div class="container section">
    <!-- 头部 -->
    <header class="ai-head">
      <p class="ai-eyebrow">
        AI · NAVIGATION
      </p>
      <h1 class="ai-title gradient-text">
        AI 工具导航
      </h1>
      <p class="ai-subtitle">
        精选 AI 领域的工具、模型、社区和资源 ·
        共 <strong class="text-cyan">{{ data?.totalLinks ?? 0 }}</strong> 个站点
        <span
          v-if="updatedAt"
          class="ai-update"
        >· 数据更新于 {{ updatedAt }}</span>
      </p>

      <!-- 搜索 -->
      <div class="ai-search-wrap">
        <div class="ai-search">
          <svg
            class="ai-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            />
          </svg>
          <input
            v-model="query"
            type="search"
            placeholder="搜索 AI 工具，例如 ChatGPT、Cursor、Stable Diffusion…"
            class="ai-search-input"
            autocomplete="off"
            spellcheck="false"
          >
          <button
            v-if="query"
            type="button"
            class="ai-search-clear"
            aria-label="清空"
            @click="clearQuery"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p
          v-if="query"
          class="ai-search-count"
        >
          找到 {{ totalAfterFilter }} 个结果
        </p>
      </div>
    </header>

    <!-- 错误态 -->
    <div
      v-if="error"
      class="ai-state ai-state-error"
    >
      <p>加载失败：{{ error.statusMessage || '未知错误' }}</p>
      <p class="text-sm text-ink-2 mt-2">
        请在本地运行 <code>pnpm scrape:ai</code> 重新生成数据。
      </p>
    </div>

    <!-- 加载态 -->
    <div
      v-else-if="pending && !data?.groups?.length"
      class="ai-state"
    >
      <span class="ai-spinner" />
      加载中…
    </div>

    <!-- 空搜索结果 -->
    <div
      v-else-if="query && !totalAfterFilter"
      class="ai-state"
    >
      <p>没有找到匹配「{{ query }}」的工具</p>
      <button
        class="ai-state-action"
        @click="clearQuery"
      >
        清空搜索
      </button>
    </div>

    <!-- 主内容：侧栏 + 网格 -->
    <div
      v-else
      class="ai-layout"
    >
      <!-- 侧栏（桌面 sticky / 移动横滚） -->
      <aside class="ai-sidebar">
        <p class="ai-sidebar-title">
          分类导航
        </p>
        <ul class="ai-sidebar-list">
          <li
            v-for="g in filteredGroups"
            :key="g.id"
          >
            <button
              type="button"
              class="ai-sidebar-link"
              :class="{ 'is-active': activeGroup === g.id }"
              @click="scrollToGroup(g.id)"
            >
              <span>{{ g.title }}</span>
              <span class="ai-sidebar-count">{{ g.links.length }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- 主区 -->
      <main class="ai-main">
        <section
          v-for="g in filteredGroups"
          :id="`group-${g.id}`"
          :key="g.id"
          :data-group-id="g.id"
          class="ai-group"
        >
          <header class="ai-group-head">
            <h2 class="ai-group-title">
              {{ g.title }}
            </h2>
            <span class="ai-group-count">{{ g.links.length }}</span>
          </header>

          <div class="ai-grid">
            <a
              v-for="l in g.links"
              :key="l.url"
              :href="l.url"
              target="_blank"
              rel="noopener noreferrer"
              class="ai-card glass"
              :title="l.description"
            >
              <div
                class="ai-card-icon"
                :data-letter="l.name.charAt(0).toUpperCase()"
              >
                <img
                  v-if="l.icon"
                  :src="l.icon"
                  :alt="l.name"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="onIconError"
                >
              </div>
              <div class="ai-card-body">
                <h3 class="ai-card-name">
                  {{ l.name }}
                </h3>
                <p class="ai-card-desc">
                  {{ l.description || '暂无描述' }}
                </p>
              </div>
              <svg
                class="ai-card-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line
                  x1="7"
                  y1="17"
                  x2="17"
                  y2="7"
                />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </section>

        <!-- 致谢 -->
        <footer class="ai-footer">
          <p>
            数据来源：
            <a
              :href="data?.source || 'https://tool.lu/nav/'"
              target="_blank"
              rel="noopener noreferrer"
              class="ai-footer-link"
            >tool.lu</a>
            · 离线静态抓取，链接跳转保留中转避免反爬
          </p>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.ai-head {
  text-align: center;
  margin-bottom: 2.5rem;
}
.ai-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--accent-cyan);
  margin: 0 0 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(34, 211, 238, 0.08);
  border-radius: var(--radius-full);
  border: 1px solid rgba(34, 211, 238, 0.2);
}
.ai-title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}
.ai-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}
.ai-update {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* 搜索 */
.ai-search-wrap {
  margin-top: 1.75rem;
}
.ai-search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  backdrop-filter: blur(var(--glass-blur));
  transition: border-color var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}
.ai-search:focus-within {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12),
    0 0 32px rgba(34, 211, 238, 0.15);
}
.ai-search-icon {
  margin-left: 1rem;
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.ai-search-input {
  flex: 1;
  min-width: 0;
  padding: 0.875rem 0.625rem;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
}
.ai-search-input::placeholder {
  color: var(--text-faint);
}
.ai-search-input::-webkit-search-cancel-button {
  display: none;
}
.ai-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 0.25rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 50%;
  cursor: pointer;
  transition: color var(--duration-base) var(--ease-out),
    background var(--duration-base) var(--ease-out);
}
.ai-search-clear:hover {
  color: var(--text-primary);
  background: var(--glass-border);
}
.ai-search-clear svg {
  width: 16px;
  height: 16px;
}
.ai-search-count {
  margin: 0.75rem 0 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

/* 状态 */
.ai-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
}
.ai-state-error {
  color: #fda4d3;
}
.ai-state-action {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--duration-base) var(--ease-out);
}
.ai-state-action:hover {
  background: rgba(34, 211, 238, 0.1);
}
.ai-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  vertical-align: -3px;
  border: 2px solid var(--glass-border-strong);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 布局：侧栏 + 主区 */
.ai-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .ai-layout {
    grid-template-columns: 200px 1fr;
    gap: 2.5rem;
    align-items: start;
  }
}

/* 侧栏 */
.ai-sidebar {
  position: relative;
}
@media (min-width: 1024px) {
  .ai-sidebar {
    position: sticky;
    top: 96px;
    align-self: start;
  }
}

.ai-sidebar-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin: 0 0 0.75rem;
  padding: 0 0.5rem;
}

.ai-sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.5rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}
.ai-sidebar-list::-webkit-scrollbar { display: none; }
@media (min-width: 1024px) {
  .ai-sidebar-list {
    flex-direction: column;
    gap: 0.25rem;
    overflow: visible;
  }
}

.ai-sidebar-link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  width: auto;
  gap: 0.75rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.8125rem;
  font-family: inherit;
  white-space: nowrap;
  scroll-snap-align: start;
  transition: color var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out),
    background var(--duration-base) var(--ease-out);
}
@media (min-width: 1024px) {
  .ai-sidebar-link {
    width: 100%;
    border-radius: var(--radius-md);
    background: transparent;
    border: none;
    padding: 0.5rem 0.75rem;
  }
}
.ai-sidebar-link:hover {
  color: var(--text-primary);
  border-color: var(--glass-border-strong);
  background: var(--glass-bg-strong);
}
.ai-sidebar-link.is-active {
  color: var(--text-primary);
  border-color: rgba(34, 211, 238, 0.5);
  background: rgba(34, 211, 238, 0.08);
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.15);
}
@media (min-width: 1024px) {
  .ai-sidebar-link.is-active {
    background: rgba(34, 211, 238, 0.08);
    border: none;
    color: var(--accent-cyan);
  }
}

.ai-sidebar-count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
  background: var(--glass-border);
}

/* 主区分组 */
.ai-main {
  min-width: 0;
}
.ai-group {
  margin-bottom: 3rem;
}
.ai-group:last-child {
  margin-bottom: 1.5rem;
}
.ai-group-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--glass-border);
}
.ai-group-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}
.ai-group-count {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--glass-border);
}

/* 卡片网格 */
.ai-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 480px) {
  .ai-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 768px) {
  .ai-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1280px) {
  .ai-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 卡片 */
.ai-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  border-radius: var(--radius-lg);
  transition: transform var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
  overflow: hidden;
}
.ai-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, transparent 40%, rgba(34, 211, 238, 0.4) 80%, rgba(168, 85, 247, 0.4) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
  pointer-events: none;
}
.ai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px rgba(34, 211, 238, 0.18);
}
.ai-card:hover::before {
  opacity: 1;
}
.ai-card:hover .ai-card-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
  color: var(--accent-cyan);
}

.ai-card-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  position: relative;
}
.ai-card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ai-card-icon.icon-fallback {
  background: var(--gradient-aurora-soft);
}
.ai-card-icon.icon-fallback::after {
  content: attr(data-letter);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.ai-card-body {
  flex: 1;
  min-width: 0;
}
.ai-card-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-card-desc {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-card-arrow {
  position: absolute;
  top: 0.875rem;
  right: 0.875rem;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out),
    color var(--duration-base) var(--ease-out);
}

/* 页脚 */
.ai-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--glass-border);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8125rem;
}
.ai-footer-link {
  color: var(--accent-cyan);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
}
.ai-footer-link:hover {
  color: var(--accent-purple);
}

@media (prefers-reduced-motion: reduce) {
  .ai-card,
  .ai-card-arrow,
  .ai-sidebar-link {
    transition: none !important;
  }
  .ai-spinner {
    animation: none !important;
  }
}
</style>
