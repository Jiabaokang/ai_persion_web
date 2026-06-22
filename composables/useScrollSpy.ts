// 任务 I2 - TOC 滚动监听 composable
//
// 基于 IntersectionObserver 检测当前可见章节
// 用于文章页目录高亮

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollSpy(headings: Ref<HTMLElement[]>) {
  const activeId = ref<string>('')

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeId.value = entry.target.id
      })
    }, { rootMargin: '-30% 0px -60% 0px' })
    headings.value.forEach(el => io.observe(el))
    onUnmounted(() => io.disconnect())
  })

  return { activeId }
}
