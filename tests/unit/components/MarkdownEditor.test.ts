import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MarkdownEditor from '../../../components/content/MarkdownEditor.vue'

vi.mock('md-editor-v3', () => ({
  MdEditor: defineComponent({
    name: 'MdEditor',
    props: ['modelValue', 'preview'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () => h('button', {
        'class': 'md-editor-stub',
        'data-preview': String(props.preview),
        'onClick': () => emit('update:modelValue', '# 已修改'),
      }, String(props.modelValue))
    },
  }),
  MdPreview: defineComponent({
    name: 'MdPreview',
    props: ['modelValue'],
    setup(props) {
      return () => h('div', { class: 'md-preview-stub' }, String(props.modelValue))
    },
  }),
}))

describe('MarkdownEditor', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  it('桌面默认显示分屏，并可切换编辑和预览模式', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: '# 标题' } })

    expect(wrapper.find('[data-mode="split"]').exists()).toBe(true)
    expect(wrapper.find('.md-editor-stub').attributes('data-preview')).toBe('true')

    await wrapper.get('button[data-editor-mode="preview"]').trigger('click')
    expect(wrapper.find('.md-preview-stub').text()).toBe('# 标题')

    await wrapper.get('button[data-editor-mode="edit"]').trigger('click')
    expect(wrapper.find('.md-editor-stub').attributes('data-preview')).toBe('false')
  })

  it('向表单透传 Markdown 文本变更', async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: '# 原文' } })
    await wrapper.get('.md-editor-stub').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['# 已修改'])
  })
})
