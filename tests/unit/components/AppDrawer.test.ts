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

  it('渲染 4 个导航链接', () => {
    const wrapper = mountDrawer({ open: true })
    const links = wrapper.findAll('.drawer-link')
    expect(links.length).toBeGreaterThanOrEqual(4)
  })
})
