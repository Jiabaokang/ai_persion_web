import { z } from 'h3-zod'
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents, contentTags, tags } from '~/server/utils/schema'
import { renderMarkdown, calculateReadingTime, slugify } from '~/server/utils/markdown'

const Body = z.object({
  slug: z.string().optional(),
  type: z.enum(['note', 'inspiration', 'blog', 'wechat']),
  title: z.string().min(1),
  summary: z.string().optional(),
  contentMd: z.string(),
  visibility: z.enum(['public', 'private']).default('private'),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImageUrl: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
  tagNames: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  const db = useDB()
  const html = await renderMarkdown(body.contentMd)
  const readingTime = calculateReadingTime(body.contentMd)
  const slug = body.slug || slugify(body.title) || `post-${Date.now()}`
  const visibility = (body.type === 'note' || body.type === 'inspiration') ? 'private' : body.visibility

  const inserted = db.insert(contents).values({
    slug,
    type: body.type,
    title: body.title,
    summary: body.summary,
    contentMd: body.contentMd,
    contentHtml: html,
    visibility,
    status: body.status,
    coverImageUrl: body.coverImageUrl,
    readingTime,
    publishedAt: body.status === 'published' ? new Date() : null,
  }).returning().get()

  if (body.tagIds) {
    for (const tagId of body.tagIds) {
      db.insert(contentTags).values({ contentId: inserted.id, tagId }).run()
    }
  }
  if (body.tagNames) {
    for (const name of body.tagNames) {
      let tag = db.select().from(tags).where(eq(tags.name, name)).get()
      if (!tag) {
        tag = db.insert(tags).values({ name, slug: slugify(name) }).returning().get()
      }
      db.insert(contentTags).values({ contentId: inserted.id, tagId: tag.id }).onConflictDoNothing().run()
    }
  }

  return inserted
})
