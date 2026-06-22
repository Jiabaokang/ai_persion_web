// 任务 I2 - useTagFilter composable 测试
// 验证标签筛选 + 文本查询 AND 逻辑

import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { withSetup } from '../helpers'
import { useTagFilter } from '../../composables/useTagFilter'

function setupFilterDOM() {
  document.body.innerHTML = `
    <div data-tag-filter>
      <button data-tag="vue" />
      <button data-tag="ssr" />
      <button data-tag-clear />
    </div>
    <div data-cards>
      <div data-card data-tags="vue">A Vue 介绍</div>
      <div data-card data-tags="vue,ssr">B Vue 和 SSR</div>
      <div data-card data-tags="ssr">C SSR 指南</div>
    </div>
    <div data-result-count></div>
    <div data-empty hidden></div>
  `
  history.replaceState(null, '', '/')
}

function getVisibleCount() {
  return document.querySelectorAll('[data-card]:not([hidden])').length
}

function getCards() {
  return document.querySelector('[data-cards]') as HTMLElement
}

function getFilter() {
  return document.querySelector('[data-tag-filter]') as HTMLElement
}

describe('useTagFilter', () => {
  beforeEach(setupFilterDOM)

  it('无筛选时显示全部卡片', () => {
    const { visibleCount } = withSetup(() => useTagFilter({
      container: getCards(),
      filterBar: getFilter(),
    }))
    expect(visibleCount.value).toBe(3)
  })

  it('按单个标签筛选（OR 匹配）', async () => {
    const filter = getFilter()
    withSetup(() => useTagFilter({
      container: getCards(),
      filterBar: filter,
    }))
    const tag = filter.querySelector('[data-tag="vue"]') as HTMLElement
    tag.click()
    await nextTick()
    expect(getVisibleCount()).toBe(2)
  })

  it('文本查询 + 标签 AND 逻辑', async () => {
    const filter = getFilter()
    const result = withSetup(() => useTagFilter({
      container: getCards(),
      filterBar: filter,
    }))
    const tag = filter.querySelector('[data-tag="ssr"]') as HTMLElement
    tag.click()
    await nextTick()
    expect(getVisibleCount()).toBe(2)
    result.setQuery('Vue')
    await nextTick()
    // query "Vue" + tag "ssr" → 只有卡片 B 同时匹配
    expect(getVisibleCount()).toBe(1)
  })

  it('清除按钮恢复全部', async () => {
    const filter = getFilter()
    const result = withSetup(() => useTagFilter({
      container: getCards(),
      filterBar: filter,
    }))
    const tag = filter.querySelector('[data-tag="ssr"]') as HTMLElement
    tag.click()
    await nextTick()
    expect(getVisibleCount()).toBe(2)
    result.clear()
    await nextTick()
    expect(getVisibleCount()).toBe(3)
  })

  it('结果计数器更新', async () => {
    const filter = getFilter()
    withSetup(() => useTagFilter({
      container: getCards(),
      filterBar: filter,
      resultCount: document.querySelector('[data-result-count]') as HTMLElement,
    }))
    const tag = filter.querySelector('[data-tag="ssr"]') as HTMLElement
    tag.click()
    await nextTick()
    expect(document.querySelector('[data-result-count]')!.textContent).toContain('2')
  })
})
