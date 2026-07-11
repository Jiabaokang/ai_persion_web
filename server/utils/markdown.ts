import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'
import sanitizeHtml from 'sanitize-html'

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(anchor, {
    permalink: false,
    slugify: (value: string) => slugify(value) || 'section',
  })
  .use(taskLists, { enabled: true, label: true })

const defaultLinkOpen = markdown.renderer.rules.link_open
  ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options))

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const href = tokens[index]?.attrGet('href') ?? ''
  if (/^https?:\/\//i.test(href)) {
    tokens[index]?.attrSet('target', '_blank')
    tokens[index]?.attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, index, options, env, self)
}

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'img',
  'input',
  'figure',
  'figcaption',
]

export async function renderMarkdown(source: string): Promise<string> {
  const rendered = markdown.render(source)
  return sanitizeHtml(rendered, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'title'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
      code: ['class'],
      input: ['type', 'checked', 'disabled', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      ol: ['start'],
      li: ['class'],
      ul: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowProtocolRelative: false,
  })
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
