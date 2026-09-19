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
  sourceCount: number
  storyId: string
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

// 校验资讯和故事标识，阻止路径穿越或任意上游请求。
export function isAihotId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value)
}

// 校验上海日历日期并排除不存在的日期。
export function isAihotDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// 从 AIHOT 资讯链接中提取可用于本站详情路由的条目 ID。
function itemIdFromUrl(value: unknown): string {
  const url = safeHttpsUrl(value)
  if (!url) return ''
  const id = new URL(url).pathname.match(/^\/items\/([^/]+)$/)?.[1] ?? ''
  return isAihotId(id) ? id : ''
}

// 从热点故事链接中提取公开故事 ID。
function storyIdFromUrl(value: unknown): string {
  const url = safeHttpsUrl(value)
  if (!url) return ''
  const id = new URL(url).pathname.match(/^\/story\/([^/]+)$/)?.[1] ?? ''
  return isAihotId(id) ? id : ''
}

// 将 AIHOT 资讯字段收敛为本站页面所需的最小数据结构。
function normalizeItem(value: unknown): AihotItem | null {
  const item = asRecord(value)
  const source = asRecord(item.source)
  const links = asRecord(item.links)
  const id = typeof item.id === 'string' ? item.id : ''
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  const href = safeHttpsUrl(links.aihot)

  if (!isAihotId(id) || !title || !href) return null

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

// 将热点字段收敛为榜单展示和本地详情所需结构。
function normalizeHotTopic(value: unknown): AihotHotTopic | null {
  const item = asRecord(value)
  const links = asRecord(item.links)
  const id = typeof item.id === 'string' ? item.id : ''
  const title = typeof item.title === 'string' ? item.title.trim() : ''

  if (!isAihotId(id) || !title) return null

  return {
    rank: typeof item.rank === 'number' ? item.rank : 0,
    id,
    title,
    sourceCount: typeof item.sourceCount === 'number' ? item.sourceCount : 0,
    storyId: storyIdFromUrl(links.story),
  }
}

// 规范化日报条目，并把 AIHOT 条目链接转换为本站详情 ID。
function normalizeDailyContent(value: unknown) {
  const item = asRecord(value)
  const source = asRecord(item.source)
  const links = asRecord(item.links)
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  if (!title) return null

  return {
    id: itemIdFromUrl(links.aihot),
    title,
    summary: typeof item.summary === 'string' ? item.summary : '',
    source: typeof source.name === 'string' ? source.name : 'AIHOT',
    originalHref: safeHttpsUrl(links.original),
    publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : '',
  }
}

// 规范化单份日报响应。
function normalizeDaily(value: unknown) {
  const root = asRecord(value)
  const report = asRecord(root.report)
  const date = typeof report.date === 'string' ? report.date : ''
  if (!isAihotDate(date) || !Array.isArray(report.sections) || !Array.isArray(report.flashes)) {
    throw new Error('Invalid AIHOT daily response')
  }

  const lead = asRecord(report.lead)
  const sections = report.sections.map((rawSection) => {
    const section = asRecord(rawSection)
    const items = Array.isArray(section.items)
      ? section.items.map(normalizeDailyContent).filter(item => item !== null)
      : []
    return {
      label: typeof section.label === 'string' ? section.label : '其他',
      items,
    }
  })
  const flashes = report.flashes.map(normalizeDailyContent).filter(item => item !== null)

  return {
    date,
    generatedAt: typeof report.generatedAt === 'string' ? report.generatedAt : '',
    // AIHOT 的日报正文实测不返回 lead，退回稳定的日期标题而不是复述首条新闻。
    title: typeof lead.title === 'string' ? lead.title : `${date} AI 日报`,
    leadParagraph: typeof lead.leadParagraph === 'string' ? lead.leadParagraph : '',
    sections,
    flashes,
  }
}

// 规范化日报归档响应。
function normalizeDailies(value: unknown) {
  const root = asRecord(value)
  if (!Array.isArray(root.items)) throw new Error('Invalid AIHOT dailies response')
  return {
    items: root.items.flatMap((rawItem) => {
      const item = asRecord(rawItem)
      const date = typeof item.date === 'string' ? item.date : ''
      if (!isAihotDate(date)) return []
      return [{
        date,
        generatedAt: typeof item.generatedAt === 'string' ? item.generatedAt : '',
        title: typeof item.leadTitle === 'string' ? item.leadTitle : `${date} AI 日报`,
        leadParagraph: typeof item.leadParagraph === 'string' ? item.leadParagraph : '',
      }]
    }),
  }
}

// 规范化热点故事及其多信源时间线。
function normalizeStory(value: unknown) {
  const root = asRecord(value)
  const story = asRecord(root.story)
  const publicId = typeof story.publicId === 'string' ? story.publicId : ''
  if (!isAihotId(publicId) || !Array.isArray(story.reports)) {
    throw new Error('Invalid AIHOT story response')
  }

  return {
    publicId,
    title: typeof story.title === 'string' ? story.title : '',
    status: story.status === 'settled' ? 'settled' : 'active',
    sourceCount: typeof story.sourceCount === 'number' ? story.sourceCount : 0,
    reportCount: typeof story.reportCount === 'number' ? story.reportCount : 0,
    firstReportAt: typeof story.firstReportAt === 'string' ? story.firstReportAt : '',
    latestAt: typeof story.latestAt === 'string' ? story.latestAt : '',
    latest: typeof story.latest === 'string' ? story.latest : '',
    digest: typeof story.digest === 'string' ? story.digest : '',
    reports: story.reports.flatMap((rawReport) => {
      const report = asRecord(rawReport)
      const source = asRecord(report.source)
      const links = asRecord(report.links)
      const id = typeof report.id === 'string' ? report.id : ''
      const title = typeof report.title === 'string' ? report.title.trim() : ''
      if (!isAihotId(id) || !title) return []
      return [{
        id,
        title,
        summary: typeof report.summary === 'string' ? report.summary : '',
        source: typeof source.name === 'string' ? source.name : 'AIHOT',
        firstParty: source.firstParty === true,
        publishedAt: typeof report.publishedAt === 'string' ? report.publishedAt : '',
        originalHref: safeHttpsUrl(links.original),
      }]
    }),
  }
}

// 并行读取首页所需的六类 AIHOT 数据。
export async function fetchAihotNavigation() {
  const [feedPayload, hotPayload, dailyPayload, resetsPayload, snapshotPayload] = await Promise.all([
    $fetch<unknown>(`${AIHOT_API}/items?mode=selected&window=7d&limit=50`),
    $fetch<unknown>(`${AIHOT_API}/hot-topics`),
    $fetch<unknown>(`${AIHOT_API}/dailies/latest`),
    $fetch<unknown>(`${AIHOT_API}/codex-resets`),
    $fetch<unknown>(`${AIHOT_API}/selected/snapshot?fields=minimal&limit=1`),
  ])

  const feed = asRecord(feedPayload)
  const hot = asRecord(hotPayload)
  const resets = asRecord(resetsPayload)
  const snapshot = asRecord(snapshotPayload)
  if (!Array.isArray(feed.items) || !Array.isArray(hot.items) || !Array.isArray(resets.events)) {
    throw new Error('Invalid AIHOT response')
  }
  if (typeof snapshot.cursor !== 'string') {
    throw new Error('Invalid AIHOT snapshot response')
  }

  const changesPayload = await $fetch<unknown>(`${AIHOT_API}/selected/changes?cursor=${encodeURIComponent(snapshot.cursor)}&limit=1`)
  const changes = asRecord(changesPayload)
  if (!Array.isArray(changes.changes) || typeof changes.count !== 'number') {
    throw new Error('Invalid AIHOT changes response')
  }

  const items = feed.items.map(normalizeItem).filter((item): item is AihotItem => item !== null)
  const hotTopics = hot.items
    .map(normalizeHotTopic)
    .filter((item): item is AihotHotTopic => item !== null)
    .slice(0, 5)
  const latestDaily = normalizeDaily(dailyPayload)
  const normalizedResets = resets.events.slice(0, 3).flatMap((rawEvent) => {
    const event = asRecord(rawEvent)
    const id = typeof event.id === 'string' ? event.id : ''
    const title = typeof event.title === 'string' ? event.title.trim() : ''
    if (!id || !title) return []
    return [{
      id,
      title,
      label: typeof event.label === 'string' ? event.label : '',
      status: typeof event.status === 'string' ? event.status : '',
      updatedAt: typeof event.updatedAt === 'string' ? event.updatedAt : '',
      occurredOn: typeof event.occurredOn === 'string' ? event.occurredOn : '',
    }]
  })

  return {
    source: 'https://aihot.news/',
    fetchedAt: new Date().toISOString(),
    items,
    hotTopics,
    latestDaily,
    resets: normalizedResets,
    // snapshot 的 count 只是当前页条数，不具备总量语义；对外只暴露同步水位与本轮变化数。
    sync: {
      asOf: typeof snapshot.asOf === 'string' ? snapshot.asOf : '',
      changeCount: changes.count,
    },
  }
}

// 热点条目可能已经滑出最近 100 条精选，用标题回查一次公开池补齐摘要、评分与推荐理由。
async function searchAihotItemByTitle(id: string, title: string): Promise<AihotItem | null> {
  const keyword = title.replace(/\s+/g, ' ').trim().slice(0, 200)
  if (keyword.length < 2) return null

  try {
    const payload = await $fetch<unknown>(`${AIHOT_API}/items?mode=all&window=7d&limit=10&q=${encodeURIComponent(keyword)}`)
    const items = asRecord(payload).items
    if (!Array.isArray(items)) return null
    return items.map(normalizeItem).find((entry): entry is AihotItem => entry?.id === id) ?? null
  }
  catch {
    // 回查只是增强，失败时交给上层用热点标题降级展示。
    return null
  }
}

// 获取本站资讯详情，并在热点存在故事 ID 时追加事件时间线。
export async function fetchAihotItemDetail(id: string): Promise<{
  item: AihotItem
  story: ReturnType<typeof normalizeStory> | null
}> {
  if (!isAihotId(id)) throw new Error('Invalid AIHOT item id')

  const [feedPayload, hotPayload] = await Promise.all([
    $fetch<unknown>(`${AIHOT_API}/items?mode=selected&window=7d&limit=100`),
    $fetch<unknown>(`${AIHOT_API}/hot-topics`),
  ])
  const feed = asRecord(feedPayload)
  const hot = asRecord(hotPayload)
  if (!Array.isArray(feed.items) || !Array.isArray(hot.items)) throw new Error('Invalid AIHOT response')

  const hotTopic = hot.items
    .map(normalizeHotTopic)
    .find((item): item is AihotHotTopic => item?.id === id)

  let item = feed.items
    .map(normalizeItem)
    .find((entry): entry is AihotItem => entry?.id === id) ?? null

  // 热点条目常常已经滑出精选窗口，先用标题回查补全，再退回只带标题的热点快照。
  if (!item && hotTopic) item = await searchAihotItemByTitle(id, hotTopic.title)
  if (!item && hotTopic) {
    item = {
      id: hotTopic.id,
      title: hotTopic.title,
      summary: '',
      source: 'AIHOT 热点',
      href: `https://aihot.news/items/${hotTopic.id}`,
      originalHref: '',
      publishedAt: '',
      category: '',
      score: null,
      reason: '',
    }
  }

  if (!item) throw new Error('AIHOT item not found')

  const story = hotTopic?.storyId
    ? normalizeStory(await $fetch<unknown>(`${AIHOT_API}/stories/${hotTopic.storyId}`))
    : null
  return { item, story }
}

// 获取日报归档列表。
export async function fetchAihotDailies(limit = 30): Promise<ReturnType<typeof normalizeDailies>> {
  const safeLimit = Math.min(180, Math.max(1, Math.trunc(limit)))
  return normalizeDailies(await $fetch<unknown>(`${AIHOT_API}/dailies?limit=${safeLimit}`))
}

// 获取指定日期的日报详情。
export async function fetchAihotDaily(date: string): Promise<ReturnType<typeof normalizeDaily>> {
  if (!isAihotDate(date)) throw new Error('Invalid AIHOT daily date')
  return normalizeDaily(await $fetch<unknown>(`${AIHOT_API}/dailies/${date}`))
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
