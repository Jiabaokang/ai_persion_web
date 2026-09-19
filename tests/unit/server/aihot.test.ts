import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineCachedEventHandler', (handler: unknown) => handler)
vi.stubGlobal('createError', (input: { statusMessage?: string }) => new Error(input.statusMessage))

const { fetchAihotNavigation } = await import('../../../server/api/ai-nav.get')

describe('AIHOT 数据接入', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('过滤非 HTTPS 链接并保留有效资讯', async () => {
    vi.stubGlobal('$fetch', vi.fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: 'safe-item',
            title: '安全资讯',
            summary: '摘要',
            source: { name: '官方来源' },
            links: { aihot: 'https://aihot.news/items/safe-item', original: 'javascript:alert(1)' },
            publishedAt: '2026-09-19T08:00:00.000Z',
            category: 'industry',
            score: 80,
            reason: '值得阅读',
          },
          {
            id: 'unsafe-item',
            title: '危险链接',
            source: { name: '未知来源' },
            links: { aihot: 'javascript:alert(1)' },
          },
        ],
      })
      .mockResolvedValueOnce({ items: [] }))

    const result = await fetchAihotNavigation()

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: 'safe-item',
      href: 'https://aihot.news/items/safe-item',
      originalHref: '',
    })
  })

  it('上游结构异常时明确失败', async () => {
    vi.stubGlobal('$fetch', vi.fn()
      .mockResolvedValueOnce({ message: 'unexpected' })
      .mockResolvedValueOnce({ items: [] }))

    await expect(fetchAihotNavigation()).rejects.toThrow('Invalid AIHOT response')
  })
})
