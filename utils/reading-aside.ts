import { htmlToText } from './html'

interface ReadingEntry {
  id: number
  type: string
  title: string
}

// 从已清理的 Markdown HTML 中提取二、三级标题，供详情页右栏生成目录。
export function extractHeadingOutline(html: string) {
  const outline: Array<{ id: string, level: number, text: string }> = []
  const pattern = /<h([23])\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi
  let match = pattern.exec(html)

  while (match) {
    outline.push({ id: match[2], level: Number(match[1]), text: htmlToText(match[3]) })
    match = pattern.exec(html)
  }

  return outline
}

// 相关内容优先取同类型条目，并排除当前详情。
export function buildRelatedEntries<T extends ReadingEntry>(entries: T[], current: T) {
  return entries
    .filter(entry => entry.id !== current.id && entry.type === current.type)
    .slice(0, 3)
}
