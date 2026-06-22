// 任务 I1 - AppAuroraBackground 组件测试

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppAuroraBackground from '../../../components/AppAuroraBackground.vue'

describe('AppAuroraBackground', () => {
  it('渲染 .aurora-bg 容器', () => {
    const wrapper = mount(AppAuroraBackground)
    expect(wrapper.find('.aurora-bg').exists()).toBe(true)
  })

  it('包含动画 span', () => {
    const wrapper = mount(AppAuroraBackground)
    expect(wrapper.find('.aurora-bg > span').exists()).toBe(true)
  })

  it('aria-hidden=true 不被屏幕阅读器读出', () => {
    const wrapper = mount(AppAuroraBackground)
    expect(wrapper.find('.aurora-bg').attributes('aria-hidden')).toBe('true')
  })
})
