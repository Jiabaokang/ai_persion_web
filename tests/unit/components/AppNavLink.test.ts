// 任务 I1 - AppNavLink 组件测试
// 验证 active 状态根据当前路由计算

import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppNavLink from '../../../components/AppNavLink.vue'
import { nuxtStubs } from '../../helpers'

async function mountWithRoute(initialPath: string) {
  const router = createRouter({
    history: createMemoryHistory(initialPath),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/blog', component: { template: '<div />' } },
      { path: '/blog/:slug', component: { template: '<div />' } },
      { path: '/notes', component: { template: '<div />' } },
    ],
  })
  // 必须先 await isReady()，否则 useRoute() 拿不到初始路径
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(AppNavLink, {
    props: { to: '/blog', page: 'blog' },
    global: { plugins: [router], stubs: nuxtStubs },
    slots: { default: '博客' },
  })
  await flushPromises()
  return { router, wrapper }
}

describe('AppNavLink', () => {
  it('渲染链接文本和 href', async () => {
    const { wrapper } = await mountWithRoute('/blog')
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/blog')
    expect(link.text()).toBe('博客')
  })

  it('当前路径完全匹配时是 active', async () => {
    const { wrapper } = await mountWithRoute('/blog')
    const link = wrapper.find('a')
    expect(link.classes()).toContain('is-active')
  })

  it('当前路径是子路径时也是 active', async () => {
    const { wrapper } = await mountWithRoute('/blog/some-slug')
    const link = wrapper.find('a')
    expect(link.classes()).toContain('is-active')
  })

  it('当前路径不匹配时不是 active', async () => {
    const { wrapper } = await mountWithRoute('/')
    const link = wrapper.find('a')
    expect(link.classes()).not.toContain('is-active')
  })

  it('带 data-nav-link 属性供样式钩子使用', async () => {
    const { wrapper } = await mountWithRoute('/blog')
    expect(wrapper.find('[data-nav-link="blog"]').exists()).toBe(true)
  })
})
