// 任务 I1 - AppHeader 组件测试
// 验证头部包含品牌、桌面导航、移动端菜单按钮、主题切换

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '../../../components/AppHeader.vue'
import { nuxtStubs } from '../../helpers'

// 简单的 stub 路由，让 useRoute() 不报错
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/blog', component: { template: '<div />' } },
    { path: '/notes', component: { template: '<div />' } },
    { path: '/wechat', component: { template: '<div />' } },
  ],
})

function mountHeader() {
  return mount(AppHeader, {
    global: {
      plugins: [router],
      stubs: {
        // stub 子组件：避免对真实 useRoute/useColorMode 的依赖
        AppThemeToggle: { template: '<button data-theme-toggle />' },
        AppNavLink: {
          template: '<a :href="to" :data-nav-link="page"><slot /></a>',
          props: ['to', 'page'],
        },
        AppDrawer: {
          template: '<div v-if="open" data-drawer><div data-drawer-overlay /><slot /></div>',
          props: ['open'],
        },
        ...nuxtStubs,
      },
    },
  })
}

describe('AppHeader', () => {
  it('渲染品牌区', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.nav-brand').exists()).toBe(true)
    expect(wrapper.find('.nav-brand-mark').text()).toBe('智')
    expect(wrapper.text()).toContain('智识花园')
  })

  it('渲染桌面导航链接', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-nav-link="home"]').exists()).toBe(true)
    expect(wrapper.find('[data-nav-link="blog"]').exists()).toBe(true)
    expect(wrapper.find('[data-nav-link="notes"]').exists()).toBe(true)
    expect(wrapper.find('[data-nav-link="wechat"]').exists()).toBe(true)
  })

  it('渲染移动端菜单按钮', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-menu-toggle]').exists()).toBe(true)
  })

  it('渲染主题切换按钮', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-theme-toggle]').exists()).toBe(true)
  })

  it('点击菜单按钮后抽屉出现', async () => {
    const wrapper = mountHeader()
    // 初始关闭
    expect(wrapper.find('[data-drawer]').exists()).toBe(false)
    // 点击菜单
    await wrapper.find('[data-menu-toggle]').trigger('click')
    // 抽屉出现
    expect(wrapper.find('[data-drawer]').exists()).toBe(true)
    expect(wrapper.find('[data-drawer-overlay]').exists()).toBe(true)
  })
})
