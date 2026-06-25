export async function renderMarkdown(md: string): Promise<string> {
  const looksLikeHtml = /<[^>]+>/.test(md)
  if (looksLikeHtml) return md
  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  const blocks = md.trim().split(/\n{2,}/)
  return blocks
    .map((block) => {
      const line = block.split('\n')[0] || ''
      if (/^###\s+/.test(line)) return `<h3>${escapeHtml(line.replace(/^###\s+/, ''))}</h3>`
      if (/^##\s+/.test(line)) return `<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`
      if (/^#\s+/.test(line)) return `<h1>${escapeHtml(line.replace(/^#\s+/, ''))}</h1>`
      return `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')
}

export function calculateReadingTime(md: string): number {
  const cnChars = (md.match(/[\u4e00-\u9fa5]/g) || []).length
  const enWords = (md.replace(/[\u4e00-\u9fa5]/g, '').match(/\b\w+\b/g) || []).length
  const minutes = Math.ceil(cnChars / 200 + enWords / 200)
  return Math.max(1, minutes)
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
