// 任务 I2 - useScrollSpy composable 测试
// 验证 IntersectionObserver 驱动章节高亮

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { withSetup } from '../helpers'
import { useScrollSpy } from '../../composables/useScrollSpy'

describe('useScrollSpy', () => {
  it('初始 activeId 为空', () => {
    const headings = ref<HTMLElement[]>([])
    const { activeId } = withSetup(() => useScrollSpy(headings))
    expect(activeId.value).toBe('')
  })

  it('接受 HTMLElement 数组', () => {
    const h1 = document.createElement('h2')
    h1.id = 'section-1'
    document.body.appendChild(h1)
    const headings = ref([h1])
    const { activeId } = withSetup(() => useScrollSpy(headings))
    expect(activeId.value).toBe('')
  })
})
