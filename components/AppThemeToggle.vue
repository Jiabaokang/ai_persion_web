<script setup lang="ts">
/**
 * 主题切换按钮（light / dark）
 * 基于 VueUse useColorMode，自动持久化到 localStorage
 * 任务 I2 将抽取 useTheme composable；当前为 inline 实现
 */
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const color = useColorMode({
  attribute: 'data-theme',
  modes: {
    light: 'light',
    dark: 'dark',
  },
})

const isLight = computed(() => color.value === 'light')

function toggle() {
  color.value = isLight.value ? 'dark' : 'light'
}
</script>

<template>
  <button
    class="nav-icon-btn"
    :aria-label="isLight ? '切换到深色模式' : '切换到浅色模式'"
    data-theme-toggle
    @click="toggle"
  >
    <!-- 月亮图标（isLight 为真 = 当前是浅色，点击切到深色） -->
    <svg
      v-if="isLight"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <!-- 太阳图标（当前是深色，点击切到浅色） -->
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="5"
      />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="3"
      />
      <line
        x1="12"
        y1="21"
        x2="12"
        y2="23"
      />
      <line
        x1="4.22"
        y1="4.22"
        x2="5.64"
        y2="5.64"
      />
      <line
        x1="18.36"
        y1="18.36"
        x2="19.78"
        y2="19.78"
      />
      <line
        x1="1"
        y1="12"
        x2="3"
        y2="12"
      />
      <line
        x1="21"
        y1="12"
        x2="23"
        y2="12"
      />
      <line
        x1="4.22"
        y1="19.78"
        x2="5.64"
        y2="18.36"
      />
      <line
        x1="18.36"
        y1="5.64"
        x2="19.78"
        y2="4.22"
      />
    </svg>
  </button>
</template>
