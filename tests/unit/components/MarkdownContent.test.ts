import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownContent from '../../../components/content/MarkdownContent.vue'

describe('MarkdownContent', () => {
  it('在统一的阅读边界内渲染服务端 HTML', () => {
    const wrapper = mount(MarkdownContent, {
      props: { html: '<h2 id="section">标题</h2><p>正文</p>' },
    })

    expect(wrapper.find('.markdown-content').exists()).toBe(true)
    expect(wrapper.find('h2#section').text()).toBe('标题')
    expect(wrapper.find('p').text()).toBe('正文')
  })

  it('空内容保持可渲染且不产生占位文案', () => {
    const wrapper = mount(MarkdownContent, { props: { html: '' } })
    expect(wrapper.find('.markdown-content').text()).toBe('')
  })
})
