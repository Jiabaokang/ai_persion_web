import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineCachedEventHandler', (handler: unknown) => handler)
vi.stubGlobal('createError', (input: { statusMessage?: string }) => new Error(input.statusMessage))

const aiModule = await import('../../../server/api/ai-nav.get')

describe('AIHOT 数据接入', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('首页聚合资讯、热点、最新日报、重置事件和同步状态', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        items: [{
          id: 'safe-item',
          title: '安全资讯',
          summary: '摘要',
          source: { name: '官方来源' },
          links: { aihot: 'https://aihot.news/items/safe-item', original: 'javascript:alert(1)' },
          publishedAt: '2026-09-19T08:00:00.000Z',
          category: 'industry',
          score: 80,
          reason: '值得阅读',
        }],
      })
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({
        report: {
          date: '2026-09-19',
          generatedAt: '2026-09-19T00:00:00.000Z',
          lead: { title: '今日日报', leadParagraph: '今日摘要' },
          sections: [{ label: '模型', items: [] }],
          flashes: [],
        },
      })
      .mockResolvedValueOnce({
        count: 1,
        checkedAt: '2026-09-19T08:00:00.000Z',
        events: [{
          id: 'reset-1',
          label: '全员重置',
          status: 'confirmed',
          title: '已确认重置',
          updatedAt: '2026-09-19T07:00:00.000Z',
          occurredOn: '2026-09-19',
        }],
      })
      .mockResolvedValueOnce({
        asOf: '2026-09-19T08:00:00.000Z',
        cursor: 'cursor-1',
        count: 1,
        items: [],
      })
      .mockResolvedValueOnce({ count: 2, changes: [], cursor: 'cursor-2' })
    vi.stubGlobal('$fetch', fetchMock)

    const result = await aiModule.fetchAihotNavigation()

    expect(result.items[0]).toMatchObject({
      id: 'safe-item',
      href: 'https://aihot.news/items/safe-item',
      originalHref: '',
    })
    expect(result.latestDaily).toMatchObject({ date: '2026-09-19', title: '今日日报' })
    expect(result.resets[0]).toMatchObject({ id: 'reset-1', title: '已确认重置' })
    // snapshot 的 count 只是当前页条数，不再对外暴露为同步总量。
    expect(result.sync).toEqual({ asOf: '2026-09-19T08:00:00.000Z', changeCount: 2 })
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      'https://aihot.news/api/v1/items?mode=selected&window=7d&limit=50',
      'https://aihot.news/api/v1/hot-topics',
      'https://aihot.news/api/v1/dailies/latest',
      'https://aihot.news/api/v1/codex-resets',
      'https://aihot.news/api/v1/selected/snapshot?fields=minimal&limit=1',
      'https://aihot.news/api/v1/selected/changes?cursor=cursor-1&limit=1',
    ])
  })

  it('详情聚合当前资讯和可用的故事时间线', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        items: [{
          id: 'item-1',
          title: '本地详情',
          summary: 'AI 导读',
          source: { name: '官方来源' },
          links: { aihot: 'https://aihot.news/items/item-1', original: 'https://example.com/original' },
          publishedAt: '2026-09-19T08:00:00.000Z',
          category: 'industry',
          score: 88,
          reason: '推荐理由',
        }],
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'item-1',
          title: '本地详情',
          links: { aihot: 'https://aihot.news/items/item-1', story: 'https://aihot.virxact.com/story/story-1' },
          rank: 1,
          sourceCount: 2,
        }],
      })
      .mockResolvedValueOnce({
        story: {
          publicId: 'story-1',
          title: '事件追踪',
          status: 'active',
          sourceCount: 2,
          reportCount: 1,
          firstReportAt: '2026-09-19T07:00:00.000Z',
          latestAt: '2026-09-19T08:00:00.000Z',
          latest: '最新进展',
          digest: '事件摘要',
          reports: [{
            id: 'report-1',
            title: '后续报道',
            summary: '报道摘要',
            source: { name: '信源', firstParty: true },
            publishedAt: '2026-09-19T08:00:00.000Z',
            links: { original: 'https://example.com/report' },
          }],
          storyline: [],
          related: [],
        },
      })
    vi.stubGlobal('$fetch', fetchMock)

    const result = await aiModule.fetchAihotItemDetail('item-1')

    expect(result.item).toMatchObject({ id: 'item-1', title: '本地详情' })
    expect(result.story).toMatchObject({ publicId: 'story-1', digest: '事件摘要' })
    expect(result.story?.reports[0]).toMatchObject({ id: 'report-1', originalHref: 'https://example.com/report' })
    expect(fetchMock.mock.calls[2][0]).toBe('https://aihot.news/api/v1/stories/story-1')
  })

  it('热点条目滑出精选窗口时用标题回查补齐摘要与评分', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({
        items: [{
          id: 'hot-1',
          title: '热点标题',
          links: { aihot: 'https://aihot.news/items/hot-1', story: 'https://aihot.virxact.com/story/story-hot' },
          rank: 4,
          sourceCount: 3,
        }],
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'hot-1',
          title: '热点标题',
          summary: '回查摘要',
          source: { name: '回查来源' },
          links: { aihot: 'https://aihot.news/items/hot-1', original: 'https://example.com/hot' },
          publishedAt: '2026-09-19T08:00:00.000Z',
          category: 'industry',
          score: 77,
          reason: '回查推荐理由',
        }],
      })
      .mockResolvedValueOnce({
        story: {
          publicId: 'story-hot',
          title: '热点事件',
          status: 'settled',
          sourceCount: 3,
          reportCount: 0,
          reviews: [],
          reports: [],
          storyline: [],
          related: [],
        },
      })
    vi.stubGlobal('$fetch', fetchMock)

    const result = await aiModule.fetchAihotItemDetail('hot-1')

    expect(result.item).toMatchObject({
      id: 'hot-1',
      summary: '回查摘要',
      score: 77,
      reason: '回查推荐理由',
      originalHref: 'https://example.com/hot',
    })
    expect(fetchMock.mock.calls[2][0]).toContain('q=')
    expect(fetchMock.mock.calls[2][0]).toContain('mode=all')
    expect(result.story).toMatchObject({ publicId: 'story-hot', status: 'settled' })
  })

  it('标题回查失败时降级为热点快照而不是抛错', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({
        items: [{
          id: 'hot-2',
          title: '降级热点',
          links: { aihot: 'https://aihot.news/items/hot-2' },
          rank: 9,
          sourceCount: 5,
        }],
      })
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
    vi.stubGlobal('$fetch', fetchMock)

    const result = await aiModule.fetchAihotItemDetail('hot-2')

    expect(result.item).toMatchObject({ id: 'hot-2', title: '降级热点', summary: '', score: null })
    expect(result.story).toBeNull()
  })

  it('日报归档和日期详情分别使用对应端点', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        items: [{ date: '2026-09-19', generatedAt: '2026-09-19T00:00:00.000Z', leadTitle: '日报标题', leadParagraph: null }],
      })
      .mockResolvedValueOnce({
        report: {
          date: '2026-09-19',
          generatedAt: '2026-09-19T00:00:00.000Z',
          lead: null,
          sections: [{
            label: '模型发布',
            items: [{
              title: '模型新闻',
              summary: '模型摘要',
              source: { name: '模型来源' },
              links: { aihot: 'https://aihot.news/items/item-2', original: 'https://example.com/model' },
            }],
          }],
          flashes: [],
        },
      })
    vi.stubGlobal('$fetch', fetchMock)

    const archive = await aiModule.fetchAihotDailies(30)
    const detail = await aiModule.fetchAihotDaily('2026-09-19')

    expect(archive.items[0]).toMatchObject({ date: '2026-09-19', title: '日报标题' })
    expect(detail.sections[0].items[0]).toMatchObject({ id: 'item-2', title: '模型新闻' })
    expect(detail.title).toBe('2026-09-19 AI 日报')
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      'https://aihot.news/api/v1/dailies?limit=30',
      'https://aihot.news/api/v1/dailies/2026-09-19',
    ])
  })

  it('拒绝不安全的详情 ID 和日报日期', () => {
    expect(aiModule.isAihotId('item-1')).toBe(true)
    expect(aiModule.isAihotId('../secret')).toBe(false)
    expect(aiModule.isAihotId('a'.repeat(129))).toBe(false)
    expect(aiModule.isAihotDate('2026-09-19')).toBe(true)
    expect(aiModule.isAihotDate('2026-99-99')).toBe(false)
    expect(aiModule.isAihotDate('2026-9-19')).toBe(false)
  })
})
