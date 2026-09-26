import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import Home from '../../../pages/index.vue'
import ContentList from '../../../components/content/ContentList.vue'
import { nuxtStubs } from '../../helpers'

afterEach(() => vi.unstubAllGlobals())

// 只替换网络边界，实际运行首页与内容列表，检查请求隐私条件和可见结果。
async function renderHome(newsUnavailable = false) {
  vi.stubGlobal('useHead', () => {})
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('ref', ref)
  const publicNote = { id: 1, slug: 'public-note', type: 'note', title: '公开笔记', summary: '公开摘要', status: 'published', visibility: 'public', tags: [{ name: '技术' }] }
  const privateNote = { ...publicNote, id: 2, slug: 'private-note', title: '私密笔记', visibility: 'private' }
  const publicArticle = { ...publicNote, id: 3, slug: 'article', type: 'blog', title: '公开文章' }
  vi.stubGlobal('useFetch', async (url: string, options: { query?: { status: string, visibility: string } }) => {
    if (url === '/api/ai-nav') {
      return {
        data: ref(newsUnavailable ? null : { items: [{ id: 'news-1', title: 'AI 新闻标题', summary: 'AI 新闻摘要', source: '官方博客', publishedAt: '2026-09-21T00:00:00Z' }] }),
        status: ref(newsUnavailable ? 'error' : 'success'),
        error: ref(newsUnavailable ? new Error('network') : null),
        refresh: async () => {},
      }
    }
    // 登录用户的接口可能返回私密内容：页面必须主动请求 public + published。
    const publicOnly = options.query?.visibility === 'public' && options.query?.status === 'published'
    return { data: ref(publicOnly ? [publicNote, publicArticle] : [publicNote, privateNote, publicArticle]), error: ref(null), refresh: async () => {} }
  })
  const wrapper = mount(defineComponent({ components: { Home }, template: '<Suspense><Home /></Suspense>' }), {
    global: { components: { ContentList }, stubs: nuxtStubs },
  })
  await flushPromises()
  return wrapper
}

describe('个人阅读首页', () => {
  it('优先展示可进入详情的 AI 资讯，并只展示公开笔记和文章', async () => {
    const wrapper = await renderHome()
    expect(wrapper.find('.garden-news a').attributes('href')).toBe('/ai/news-1')
    expect(wrapper.text().indexOf('AI 新闻标题')).toBeLessThan(wrapper.text().indexOf('公开笔记'))
    expect(wrapper.find('a[href="/notes/public-note"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/blog/article"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('私密笔记')
    await wrapper.find('.garden-tags button:nth-child(2)').trigger('click')
    expect(wrapper.find('.garden-tags button:nth-child(2)').attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('公开笔记')
    wrapper.unmount()
  })

  it('资讯服务失败仍显示笔记，并提供重试入口', async () => {
    const wrapper = await renderHome(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('暂时没有送达')
    expect(wrapper.find('[role="alert"] button').text()).toBe('重新读取')
    expect(wrapper.text()).toContain('公开笔记')
    wrapper.unmount()
  })
})

describe('公开阅读路由与写作权限', () => {
  it('访客可以进入笔记，而灵感和后台仍要求登录', async () => {
    vi.stubGlobal('defineNuxtRouteMiddleware', (handler: unknown) => handler)
    const fetchMe = vi.fn(async () => null)
    vi.stubGlobal('useAuth', () => ({ user: ref(null), fetchMe }))
    vi.stubGlobal('navigateTo', (path: string) => path)
    const { default: guard } = await import('../../../middleware/auth.global')
    const run = guard as unknown as (to: { path: string, fullPath: string }) => Promise<string | undefined>
    expect(await run({ path: '/notes', fullPath: '/notes' })).toBeUndefined()
    expect(await run({ path: '/notes/public-note', fullPath: '/notes/public-note' })).toBeUndefined()
    expect(fetchMe).not.toHaveBeenCalled()
    expect(await run({ path: '/inspiration', fullPath: '/inspiration' })).toBe('/login?redirect=%2Finspiration')
    expect(await run({ path: '/admin/posts', fullPath: '/admin/posts' })).toBe('/login?redirect=%2Fadmin%2Fposts')
  })
})
