<script setup lang="ts">
const route = useRoute()
const { user, fetchMe, logout } = useAuth()

if (!user.value) await fetchMe()

type NavLink = {
  to: string
  label: string
  icon: string
}

const links: NavLink[] = [
  { to: '/admin', label: '仪表盘', icon: 'i-carbon-dashboard' },
  { to: '/admin/posts', label: '文章', icon: 'i-carbon-document' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function linkClass(path: string) {
  const base = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm transition'
  if (isActive(path)) {
    return `${base} bg-[var(--gradient-aurora-soft)] text-[var(--text-primary)] border border-[var(--glass-border)]`
  }
  return `${base} text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]`
}
</script>

<template>
  <div class="min-h-screen text-[var(--text-primary)]">
    <div
      class="aurora-bg"
      aria-hidden="true"
    >
      <span />
    </div>

    <header class="sticky top-4 z-50">
      <div class="container">
        <div class="glass-strong !rounded-full px-4 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/admin"
              class="flex items-center gap-3"
            >
              <div class="w-9 h-9 rounded-xl bg-[var(--gradient-aurora)] text-[var(--bg-base)] flex items-center justify-center font-800 shadow-[var(--shadow-glow-cyan)]">
                智
              </div>
              <div class="hidden sm:block">
                <div class="text-sm font-700 tracking-0.2">
                  管理后台
                </div>
                <div class="text-xs text-[var(--text-muted)]">
                  内容系统
                </div>
              </div>
            </NuxtLink>
          </div>

          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              :class="linkClass(l.to)"
            >
              <span
                :class="l.icon"
                class="w-4 h-4"
              />
              <span>{{ l.label }}</span>
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-2">
            <NuxtLink
              to="/admin/posts/new"
              class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-800 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition"
            >
              <span class="i-carbon-add w-5 h-5" />
              <span class="hidden sm:inline">新建内容</span>
            </NuxtLink>
            <div class="hidden sm:flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span class="truncate max-w-40">{{ user?.username }}</span>
            </div>
            <button
              class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
              @click="logout"
            >
              <span class="i-carbon-logout w-4 h-4" />
              <span class="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>

        <nav class="md:hidden mt-3 flex items-center gap-2 flex-wrap">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            :class="linkClass(l.to)"
          >
            <span
              :class="l.icon"
              class="w-4 h-4"
            />
            <span>{{ l.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <div class="container pt-7 md:pt-10 pb-14">
      <div class="glass p-5 md:p-7">
        <slot />
      </div>
    </div>
  </div>
</template>
