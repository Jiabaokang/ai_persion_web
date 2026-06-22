import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents, tags, contentTags } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()
  const row = db.select().from(contents).where(eq(contents.id, id)).get()
  if (!row) throw createError({ statusCode: 404 })

  // Unauthenticated users can only see public published content
  if (!event.context.user && (row.visibility !== 'public' || row.status !== 'published')) {
    throw createError({ statusCode: 404 })
  }

  const ts = db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(contentTags)
    .innerJoin(tags, eq(tags.id, contentTags.tagId))
    .where(eq(contentTags.contentId, id))
    .all()
  return { ...row, tags: ts }
})
