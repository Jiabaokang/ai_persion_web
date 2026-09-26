<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useDrawer } from '~/composables/useDrawer'
import { publicNavigation } from '~/composables/usePublicNavigation'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const links = publicNavigation
const { close: closeDrawer } = useDrawer()
const closeButton = ref<HTMLButtonElement | null>(null)

// 将键盘焦点限制在打开的导航内，避免进入遮罩后的页面。
function trapFocus(event: KeyboardEvent) {
  const dialog = event.currentTarget as HTMLElement
  const items = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button'))
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

// 关闭抽屉并把键盘焦点交还给菜单按钮
function close() {
  emit('update:open', false)
  closeDrawer()
  nextTick(() => {
    const trigger = document.querySelector<HTMLElement>('[data-menu-toggle]')
    trigger?.focus()
  })
}

// 打开抽屉后聚焦关闭按钮，避免键盘用户丢失位置
watch(() => props.open, (open) => {
  if (open) nextTick(() => closeButton.value?.focus())
})
</script>

<template>
  <Teleport to="body">
    <!-- 移动端导航遮罩 -->
    <div
      v-if="open"
      class="drawer-overlay is-open"
      data-drawer-overlay
      @click="close"
    />

    <!-- 移动端暖纸导航抽屉 -->
    <aside
      v-if="open"
      class="paper-drawer drawer is-open"
      data-drawer
      role="dialog"
      aria-modal="true"
      aria-label="移动端导航"
      @keydown.tab="trapFocus"
    >
      <div class="drawer-header">
        <NuxtLink
          to="/"
          class="nav-brand"
          @click="close"
        >
          <span
            class="nav-brand-mark"
            aria-hidden="true"
          >智</span>
          <span>智识花园</span>
        </NuxtLink>
        <button
          ref="closeButton"
          class="paper-icon-button"
          data-drawer-close
          aria-label="关闭菜单"
          @click="close"
        >
          <span
            class="i-carbon-close"
            aria-hidden="true"
          />
        </button>
      </div>

      <nav class="drawer-links">
        <NuxtLink
          v-for="item in links"
          :key="item.to"
          :to="item.to"
          class="drawer-link"
          @click="close"
        >
          <span
            :class="item.icon"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="drawer-account">
        <NuxtLink
          to="/login"
          class="drawer-link"
          @click="close"
        >进入写作后台</NuxtLink>
      </div>
    </aside>
  </Teleport>
</template>
