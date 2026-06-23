/**
 * 抓取 tool.lu AI 网址导航数据
 *
 * 用法：
 *   node scripts/scrape-ai-nav.mjs
 *   pnpm scrape:ai
 *
 * 产物：data/ai-nav.json
 *
 * 设计说明：
 *   - 纯 Node ESM，无外部依赖
 *   - 数据本地生成后随代码一起 commit，生产环境直接读 JSON
 *   - 中转链接保留 tool.lu/nav/xxx/url 形式，避免抓取目标的反爬机制
 *   - 图标 URL 也原样保留（指向 tool.lu OSS），不二次代理
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../data/ai-nav.json')
const SOURCE = 'https://tool.lu/nav/?node_id=27'

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, '\'')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}

function normalizeUrl(url) {
  if (!url) return ''
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) return 'https://tool.lu' + url
  return url
}

async function main() {
  console.log(`📡 抓取 ${SOURCE}`)
  const res = await fetch(SOURCE, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  const html = await res.text()
  console.log(`✅ HTML 长度: ${html.length} bytes`)

  const mainStart = html.indexOf('<ul class="tabs">')
  const mainEnd = html.indexOf('<div class="aside', mainStart)
  if (mainStart < 0 || mainEnd < 0) {
    throw new Error('找不到主内容区，页面结构可能变了')
  }
  const main = html.slice(mainStart, mainEnd)

  const groupRegex = /<h3 id="(node-[^"]+)" class="link-node">([^<]+)<\/h3>([\s\S]*?)(?=<h3 id="node-|$)/g
  const groups = []
  let totalLinks = 0

  for (const m of main.matchAll(groupRegex)) {
    const [, id, title, body] = m
    const links = []

    const linkRegex = /<a[^>]+href="([^"]+)"><span\s+style="background-image:url\(([^)]+)\);"><\/span><div>([^<]*)<\/div><\/a><p class="link-body">([\s\S]*?)<\/p>/g

    for (const link of body.matchAll(linkRegex)) {
      const [, url, icon, name, description] = link
      const cleanName = decodeEntities(name).trim()
      const cleanDesc = decodeEntities(description.replace(/<[^>]+>/g, '')).trim()
      if (!cleanName) continue
      links.push({
        name: cleanName,
        description: cleanDesc,
        url: normalizeUrl(url),
        icon: normalizeUrl(icon),
      })
    }

    if (links.length === 0) continue

    groups.push({
      id: id.replace(/^node-/, ''),
      title: decodeEntities(title).trim(),
      links,
    })
    totalLinks += links.length
    console.log(`  📁 ${title} - ${links.length} 个链接`)
  }

  if (groups.length === 0) {
    throw new Error('解析失败：没有抓到任何分组')
  }

  const data = {
    source: SOURCE,
    scrapedAt: new Date().toISOString(),
    groups,
    totalLinks,
  }

  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, JSON.stringify(data, null, 2), 'utf-8')

  console.log(`\n✨ 完成！共 ${groups.length} 个分组、${totalLinks} 个链接`)
  console.log(`📄 输出: ${OUTPUT}`)
}

main().catch((err) => {
  console.error('❌ 抓取失败:', err)
  process.exit(1)
})
