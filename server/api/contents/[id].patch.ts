import { z } from 'h3-zod'
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents, contentTags } from '~/server/utils/schema'
import { renderMarkdown, calculateReadingTime } from '~/server/utils/markdown'

const Body = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  contentMd: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  coverImageUrl: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, Body.parse)
  const db = useDB()
  const existing = db.select().from(contents).where(eq(contents.id, id)).get()
  if (!existing) throw createError({ statusCode: 404 })

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) updates.title = body.title
  if (body.summary !== undefined) updates.summary = body.summary
  if (body.visibility !== undefined) updates.visibility = body.visibility
  if (body.status !== undefined) {
    updates.status = body.status
    if (body.status === 'published' && !existing.publishedAt) {
      updates.publishedAt = new Date()
    }
  }
  if (body.coverImageUrl !== undefined) updates.coverImageUrl = body.coverImageUrl
  if (body.contentMd !== undefined) {
    updates.contentMd = body.contentMd
    updates.contentHtml = await renderMarkdown(body.contentMd)
    updates.readingTime = calculateReadingTime(body.contentMd)
  }

  const updated = db.update(contents).set(updates).where(eq(contents.id, id)).returning().get()
  if (body.tagIds) {
    db.delete(contentTags).where(eq(contentTags.contentId, id)).run()
    for (const tagId of body.tagIds) {
      db.insert(contentTags).values({ contentId: id, tagId }).run()
    }
  }
  return updated
})
