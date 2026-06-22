// 任务 I1 - AppFooter 组件测试
// 验证页脚渲染版权和导航链接

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppFooter from '../../../components/AppFooter.vue'
import { nuxtStubs } from '../../helpers'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:catchAll(.*)', component: { template: '<div />' } }],
})

function mountFooter() {
  return mount(AppFooter, { global: { plugins: [router], stubs: nuxtStubs } })
}

describe('AppFooter', () => {
  it('渲染版权文本', () => {
    const wrapper = mountFooter()
    expect(wrapper.text()).toContain('智识花园')
    expect(wrapper.text()).toContain('Built with curiosity')
  })

  it('包含当前年份', () => {
    const wrapper = mountFooter()
    const year = String(new Date().getFullYear())
    expect(wrapper.text()).toContain(year)
  })

  it('渲染 5 个页脚链接', () => {
    const wrapper = mountFooter()
    const links = wrapper.findAll('.footer-links a')
    expect(links.length).toBe(5)
  })

  it('使用 <footer> 语义化标签', () => {
    const wrapper = mountFooter()
    expect(wrapper.find('footer').exists()).toBe(true)
  })
})
