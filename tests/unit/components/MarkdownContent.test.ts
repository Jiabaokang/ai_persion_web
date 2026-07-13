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

  it('移除与页面标题完全相同的正文首个一级标题', () => {
    const wrapper = mount(MarkdownContent, {
      props: { html: '<h1 id="same">页面标题</h1><p>正文</p>', title: '页面标题' },
    })
    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.find('p').text()).toBe('正文')
  })

  it('保留与页面标题不同的正文一级标题', () => {
    const wrapper = mount(MarkdownContent, {
      props: { html: '<h1>章节标题</h1><p>正文</p>', title: '页面标题' },
    })
    expect(wrapper.find('h1').text()).toBe('章节标题')
  })

  it('标题含实体或行内格式时仍去除视觉文本相同的首个 H1', () => {
    const wrapper = mount(MarkdownContent, {
      props: { html: '<h1 id="same"><em>设计</em> &amp; Markdown</h1><p>正文</p>', title: '设计 & Markdown' },
    })
    expect(wrapper.find('h1').exists()).toBe(false)
  })
})
