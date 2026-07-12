import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContentList from '../../../components/content/ContentList.vue'

describe('ContentList', () => {
  const items = [
    { id: 1, slug: 'first', type: 'blog', title: '第一篇', summary: '摘要', readingTime: 3 },
    { id: 2, slug: 'memo', type: 'note', title: '一则笔记' },
  ]

  it('用连续分隔行呈现内容而不是独立卡片', () => {
    const wrapper = mount(ContentList, {
      props: { items },
      global: { stubs: { NuxtLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.findAll('.content-list__item')).toHaveLength(2)
    expect(wrapper.get('.content-list').classes()).toContain('content-list--editorial')
    expect(wrapper.text()).toContain('第一篇')
  })

  it('支持紧凑笔记密度', () => {
    const wrapper = mount(ContentList, {
      props: { items, density: 'compact' },
      global: { stubs: { NuxtLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.get('.content-list').classes()).toContain('content-list--compact')
  })
})
