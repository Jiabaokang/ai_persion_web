import { and, desc, eq, type SQL } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents } from '~/server/utils/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const conds: SQL[] = []

  // Unauthenticated requests only see public published content
  if (!event.context.user) {
    conds.push(eq(contents.visibility, 'public'))
    conds.push(eq(contents.status, 'published'))
  }

  if (query.type) conds.push(eq(contents.type, query.type as typeof contents.type._.data))
  if (query.slug) conds.push(eq(contents.slug, query.slug as string))
  if (query.visibility) conds.push(eq(contents.visibility, query.visibility as typeof contents.visibility._.data))
  if (query.status) conds.push(eq(contents.status, query.status as typeof contents.status._.data))

  const where = conds.length ? and(...conds) : undefined
  return useDB().select().from(contents).where(where).orderBy(desc(contents.createdAt)).all()
})
