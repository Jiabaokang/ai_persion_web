<script setup lang="ts">
const route = useRoute()
const { user, fetchMe, logout } = useAuth()
const mobileOpen = ref(false)

if (!user.value) await fetchMe()

const links = [
  { to: '/admin', label: '概览', icon: 'i-carbon-dashboard' },
  { to: '/admin/posts', label: '内容', icon: 'i-carbon-document-multiple-01' },
  { to: '/admin/posts?focus=tags', label: '标签', icon: 'i-carbon-tag-group' },
]

// 判断管理导航是否对应当前页面，查询参数入口只在完整地址匹配时高亮。
function isActive(path: string) {
  if (path.includes('?')) return route.fullPath === path
  const pathname = path.split('?')[0]
  if (pathname === '/admin') return route.path === '/admin'
  return route.path === pathname || route.path.startsWith(`${pathname}/`)
}

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <!-- 管理后台纸面框架：固定任务侧栏、宽内容桌面与移动抽屉。 -->
  <div class="admin-shell">
    <aside
      class="admin-sidebar"
      aria-label="管理后台导航"
    >
      <NuxtLink
        to="/admin"
        class="admin-brand"
      >
        <span>智</span>
        <strong>写作后台</strong>
      </NuxtLink>
      <nav class="admin-nav">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ 'is-active': isActive(link.to) }"
        >
          <span
            :class="link.icon"
            aria-hidden="true"
          />
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="admin-sidebar__foot">
        <NuxtLink to="/">
          <span
            class="i-carbon-arrow-up-left"
            aria-hidden="true"
          />
          返回网站
        </NuxtLink>
        <button
          type="button"
          @click="logout"
        >
          <span
            class="i-carbon-logout"
            aria-hidden="true"
          />
          退出登录
        </button>
      </div>
    </aside>

    <div class="admin-body">
      <header class="admin-topbar">
        <button
          type="button"
          class="admin-menu-button"
          aria-label="打开管理导航"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          <span
            class="i-carbon-menu"
            aria-hidden="true"
          />
        </button>
        <div>
          <small>当前账号</small>
          <strong>{{ user?.username || 'Administrator' }}</strong>
        </div>
        <NuxtLink
          to="/admin/posts/new"
          class="admin-new-button"
        >
          <span
            class="i-carbon-add"
            aria-hidden="true"
          />
          新建内容
        </NuxtLink>
      </header>
      <main class="admin-workspace">
        <slot />
      </main>
    </div>

    <Transition name="admin-drawer">
      <div
        v-if="mobileOpen"
        class="admin-mobile-nav"
      >
        <button
          type="button"
          class="admin-mobile-nav__overlay"
          aria-label="关闭管理导航"
          @click="mobileOpen = false"
        />
        <aside
          class="admin-mobile-nav__panel"
          aria-label="移动管理导航"
        >
          <header>
            <strong>写作后台</strong>
            <button
              type="button"
              aria-label="关闭"
              @click="mobileOpen = false"
            >
              <span
                class="i-carbon-close"
                aria-hidden="true"
              />
            </button>
          </header>
          <nav>
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
            >
              <span
                :class="link.icon"
                aria-hidden="true"
              />
              {{ link.label }}
            </NuxtLink>
            <NuxtLink to="/">
              <span
                class="i-carbon-arrow-up-left"
                aria-hidden="true"
              />
              返回网站
            </NuxtLink>
          </nav>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 100vh; background: var(--paper-base) url('/images/paper-texture.webp') repeat; background-size: 1024px auto; }
.admin-sidebar { position: sticky; top: 0; display: flex; height: 100vh; padding: 26px 18px 22px; flex-direction: column; border-right: 1px solid var(--rule-strong); }
.admin-brand { display: flex; align-items: center; gap: 11px; font-family: var(--font-display); }
.admin-brand > span { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); }
.admin-nav { display: grid; gap: 4px; margin-top: 52px; }
.admin-nav a,
.admin-sidebar__foot a,
.admin-sidebar__foot button { display: flex; min-height: 42px; align-items: center; gap: 10px; padding: 9px 10px; border-left: 2px solid transparent; color: var(--ink-secondary); font-size: 0.82rem; }
.admin-nav a:hover,
.admin-nav a.is-active { border-left-color: var(--accent-terracotta); background: var(--paper-muted); color: var(--ink-primary); }
.admin-sidebar__foot { display: grid; gap: 2px; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--rule-color); }
.admin-sidebar__foot a:hover,
.admin-sidebar__foot button:hover { color: var(--accent-terracotta-dark); }
.admin-body { min-width: 0; }
.admin-topbar { position: sticky; top: 0; z-index: 30; display: flex; min-height: 68px; align-items: center; justify-content: flex-end; gap: 20px; padding: 0 clamp(18px, 4vw, 48px); border-bottom: 1px solid var(--rule-color); background: rgba(248, 242, 231, 0.94); }
.admin-topbar > div { display: grid; margin-right: auto; }
.admin-topbar small { color: var(--ink-muted); font-size: 0.62rem; }
.admin-topbar strong { font-size: 0.8rem; }
.admin-menu-button { display: none; width: 42px; height: 42px; align-items: center; justify-content: center; border: 1px solid var(--rule-color); border-radius: var(--radius-sm); }
.admin-new-button { display: inline-flex; min-height: 40px; align-items: center; gap: 7px; padding: 8px 13px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-size: 0.78rem; font-weight: 700; }
.admin-workspace { width: 100%; max-width: 1440px; margin: 0 auto; padding: clamp(26px, 5vw, 56px) clamp(18px, 4vw, 48px) 72px; }
.admin-mobile-nav { position: fixed; inset: 0; z-index: 100; }
.admin-mobile-nav__overlay { position: absolute; inset: 0; width: 100%; height: 100%; background: rgba(42, 36, 29, 0.35); }
.admin-mobile-nav__panel { position: absolute; top: 0; bottom: 0; left: 0; width: min(320px, 86vw); padding: 22px; background: var(--paper-surface) url('/images/paper-texture.webp') repeat; background-size: 1024px auto; box-shadow: var(--shadow-float); }
.admin-mobile-nav__panel header { display: flex; min-height: 48px; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid var(--rule-color); }
.admin-mobile-nav__panel header button { width: 42px; height: 42px; }
.admin-mobile-nav__panel nav { display: grid; margin-top: 20px; }
.admin-mobile-nav__panel nav a { display: flex; min-height: 46px; align-items: center; gap: 10px; border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); }
.admin-drawer-enter-active,
.admin-drawer-leave-active { transition: opacity 0.2s; }
.admin-drawer-enter-from,
.admin-drawer-leave-to { opacity: 0; }
@media (max-width: 800px) {
  .admin-shell { grid-template-columns: 1fr; }
  .admin-sidebar { display: none; }
  .admin-menu-button { display: inline-flex; }
  .admin-topbar > div { display: none; }
}
</style>
