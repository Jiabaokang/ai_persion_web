// 任务 I2 - 移动端抽屉状态管理
//
// 共享 drawer open/close 状态（避免 Header 和 Drawer 各自管理）
// ESC 键关闭、body 滚动锁定

import { ref, readonly } from 'vue'

export function useDrawer() {
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  function close() {
    isOpen.value = false
    document.body.style.overflow = ''
  }

  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) close()
  }

  if (typeof window !== 'undefined') {
    document.addEventListener('keydown', onKeydown)
  }

  return { isOpen: readonly(isOpen), open, close, toggle }
}
