import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
  return String(file)
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
