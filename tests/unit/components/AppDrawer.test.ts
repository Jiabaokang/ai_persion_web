// 任务 I1 - AppDrawer 组件测试
// 验证抽屉的开关、链接、关闭交互

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppDrawer from '../../../components/AppDrawer.vue'
import { nuxtStubs } from '../../helpers'

function mountDrawer(props: { open: boolean } = { open: false }) {
  return mount(AppDrawer, { props, global: { stubs: nuxtStubs } })
}

describe('AppDrawer', () => {
  it('open=false 时不渲染', () => {
    const wrapper = mountDrawer({ open: false })
    expect(wrapper.find('[data-drawer]').exists()).toBe(false)
    expect(wrapper.find('[data-drawer-overlay]').exists()).toBe(false)
  })

  it('open=true 时渲染抽屉和遮罩', () => {
    const wrapper = mountDrawer({ open: true })
    expect(wrapper.find('[data-drawer]').exists()).toBe(true)
    expect(wrapper.find('[data-drawer-overlay]').exists()).toBe(true)
  })

  it('点击关闭按钮触发 update:open(false)', async () => {
    const wrapper = mountDrawer({ open: true })
    await wrapper.find('[data-drawer-close]').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('点击遮罩触发 update:open(false)', async () => {
    const wrapper = mountDrawer({ open: true })
    await wrapper.find('[data-drawer-overlay]').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('全部 5 个栏目和后台入口都提供标题与简介', () => {
    const wrapper = mountDrawer({ open: true })
    const links = wrapper.findAll('.drawer-links .drawer-link')
    expect(links).toHaveLength(5)
    expect(links.map(link => link.find('strong').text())).toEqual(['AI 资讯', '笔记', '文章', '灵感', '公众号'])
    for (const link of [...links, wrapper.find('.drawer-account .drawer-link')]) {
      expect(link.find('small').text().length).toBeGreaterThan(0)
    }
  })

  it('抽屉使用暖纸语义且不包含内联 SVG', () => {
    const wrapper = mountDrawer({ open: true })
    expect(wrapper.find('.paper-drawer').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
