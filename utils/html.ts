const namedEntities: Record<string, string> = {
  amp: '&',
  apos: '\'',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

// 将安全 HTML 片段归一化为可比较的纯文本，兼容常见实体和行内标签。
export function htmlToText(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_entity, code: string) => {
      if (code.startsWith('#x')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
      if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
      return namedEntities[code.toLowerCase()] ?? `&${code};`
    })
    .replace(/\s+/g, ' ')
    .trim()
}
