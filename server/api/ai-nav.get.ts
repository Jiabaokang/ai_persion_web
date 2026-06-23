// AI 网址导航 API
//
// 数据源：data/ai-nav.json（由 scripts/scrape-ai-nav.mjs 离线生成）
// 缓存：进程内常驻，启动后只读一次
// 部署：JSON 文件随代码一起打包，构建时 Nitro 自动把它当成 server asset 处理
//
// 如需更新数据：在本地跑 `pnpm scrape:ai` 然后 commit。

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface NavLink {
  name: string
  description: string
  url: string
  icon: string
}

interface NavGroup {
  id: string
  title: string
  links: NavLink[]
}

interface NavData {
  source: string
  scrapedAt: string
  groups: NavGroup[]
  totalLinks: number
}

let cache: NavData | null = null

async function loadData(): Promise<NavData> {
  if (cache) return cache
  // 相对项目根目录读取
  const file = resolve(process.cwd(), 'data/ai-nav.json')
  const raw = await readFile(file, 'utf-8')
  cache = JSON.parse(raw) as NavData
  return cache
}

export default defineEventHandler(async () => {
  try {
    return await loadData()
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI nav data not available',
      data: { hint: '请先在本地运行 `pnpm scrape:ai` 生成 data/ai-nav.json' },
      cause: e,
    })
  }
})
