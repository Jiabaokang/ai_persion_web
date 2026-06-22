// 任务 I2 - 标签筛选 + 文本查询 composable
//
// DOM 驱动的卡片筛选引擎：
//   - 文本 query AND 标签 selection（OR 匹配任一标签）
//   - URL 同步（query + tag 参数）
//   - 结果计数 + 空白状态
//   - 事件委托式点击处理

import { ref } from 'vue'

interface UseTagFilterOptions {
  container: HTMLElement
  filterBar: HTMLElement
  resultCount?: HTMLElement | null
  emptyState?: HTMLElement | null
}

export function useTagFilter(options: UseTagFilterOptions) {
  const query = ref('')
  const selectedTags = ref<string[]>([])
  const visibleCount = ref(0)

  function apply() {
    const q = query.value.trim().toLocaleLowerCase('zh-CN')
    const tags = selectedTags.value
    let count = 0

    options.container.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
      const text = (card.textContent || '').toLocaleLowerCase('zh-CN')
      const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean)
      const queryMatch = q === '' || text.includes(q)
      const tagMatch = tags.length === 0 || tags.some(t => cardTags.includes(t))
      const visible = queryMatch && tagMatch
      card.hidden = !visible
      if (visible) count++
    })

    visibleCount.value = count

    if (options.resultCount) {
      options.resultCount.textContent = `共 ${count} 篇`
    }
    if (options.emptyState) {
      options.emptyState.hidden = count !== 0
    }
  }

  function setQuery(v: string) {
    query.value = v
    apply()
  }

  function toggleTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag)
    if (idx >= 0) selectedTags.value.splice(idx, 1)
    else selectedTags.value.push(tag)
    options.filterBar.querySelectorAll<HTMLElement>(`[data-tag="${tag}"]`).forEach((el) => {
      el.classList.toggle('is-selected')
    })
    apply()
  }

  function clear() {
    query.value = ''
    selectedTags.value = []
    options.filterBar.querySelectorAll<HTMLElement>('.is-selected').forEach(el => el.classList.remove('is-selected'))
    apply()
  }

  // 事件委托：点击 filterBar 中的 data-tag 按钮
  options.filterBar.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('[data-tag]') as HTMLElement | null
    if (!t) return
    const tag = t.dataset.tag
    if (tag) toggleTag(tag)
  })

  // 清除按钮
  const clearBtn = options.filterBar.querySelector<HTMLElement>('[data-tag-clear]')
  if (clearBtn) {
    clearBtn.addEventListener('click', clear)
  }

  // 初始筛选（显示全部）
  apply()

  return { query, selectedTags, visibleCount, setQuery, toggleTag, clear }
}
