const AIHOT_API = 'https://aihot.news/api/v1'

type JsonRecord = Record<string, unknown>

interface AihotItem {
  id: string
  title: string
  summary: string
  source: string
  href: string
  originalHref: string
  publishedAt: string
  category: string
  score: number | null
  reason: string
}

interface AihotHotTopic {
  rank: number
  id: string
  title: string
  href: string
  sourceCount: number
}

// 将未知 JSON 值收窄为可安全读取的对象。
function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {}
}

// 只允许公开 HTTPS 链接进入页面 href，避免上游异常协议注入。
function safeHttpsUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : ''
  }
  catch {
    return ''
  }
}

// 将 AIHOT 资讯字段收敛为本站页面所需的最小数据结构。
function normalizeItem(value: unknown): AihotItem | null {
  const item = asRecord(value)
  const source = asRecord(item.source)
  const links = asRecord(item.links)
  const id = typeof item.id === 'string' ? item.id : ''
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  const href = safeHttpsUrl(links.aihot)

  if (!id || !title || !href) return null

  return {
    id,
    title,
    summary: typeof item.summary === 'string' ? item.summary : '',
    source: typeof source.name === 'string' ? source.name : 'AIHOT',
    href,
    originalHref: safeHttpsUrl(links.original),
    publishedAt: typeof item.publishedAt === 'string'
      ? item.publishedAt
      : typeof item.discoveredAt === 'string' ? item.discoveredAt : '',
    category: typeof item.category === 'string' ? item.category : '',
    score: typeof item.score === 'number' ? item.score : null,
    reason: typeof item.reason === 'string' ? item.reason : '',
  }
}

// 将热点字段收敛为榜单展示结构。
function normalizeHotTopic(value: unknown): AihotHotTopic | null {
  const item = asRecord(value)
  const links = asRecord(item.links)
  const id = typeof item.id === 'string' ? item.id : ''
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  const href = safeHttpsUrl(links.aihot)

  if (!id || !title || !href) return null

  return {
    rank: typeof item.rank === 'number' ? item.rank : 0,
    id,
    title,
    href,
    sourceCount: typeof item.sourceCount === 'number' ? item.sourceCount : 0,
  }
}

// 并行读取 AIHOT 精选资讯与热点榜，并过滤不安全或缺失的记录。
export async function fetchAihotNavigation() {
  const [feedPayload, hotPayload] = await Promise.all([
    $fetch<unknown>(`${AIHOT_API}/items?mode=selected&window=7d&limit=50`),
    $fetch<unknown>(`${AIHOT_API}/hot-topics`),
  ])

  const feed = asRecord(feedPayload)
  const hot = asRecord(hotPayload)
  if (!Array.isArray(feed.items) || !Array.isArray(hot.items)) {
    throw new Error('Invalid AIHOT response')
  }

  const items = feed.items.map(normalizeItem).filter((item): item is AihotItem => item !== null)
  const hotTopics = hot.items
    .map(normalizeHotTopic)
    .filter((item): item is AihotHotTopic => item !== null)
    .slice(0, 5)

  return {
    source: 'https://aihot.news/',
    fetchedAt: new Date().toISOString(),
    items,
    hotTopics,
  }
}

export default defineCachedEventHandler(async () => {
  try {
    return await fetchAihotNavigation()
  }
  catch (cause) {
    throw createError({
      statusCode: 502,
      statusMessage: 'AIHOT data is temporarily unavailable',
      cause,
    })
  }
}, {
  maxAge: 60,
  staleMaxAge: 300,
  name: 'aihot-navigation',
})
