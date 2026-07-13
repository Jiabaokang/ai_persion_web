import { and, desc, eq, inArray, type SQL } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { attachTagsToContents } from '~/server/utils/content-list'
import { contents, contentTags, tags } from '~/server/utils/schema'

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
  const db = useDB()
  const contentRows = db.select().from(contents).where(where).orderBy(desc(contents.createdAt)).all()
  if (!contentRows.length) return []

  const tagRows = db.select({
    contentId: contentTags.contentId,
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
    color: tags.color,
  })
    .from(contentTags)
    .innerJoin(tags, eq(contentTags.tagId, tags.id))
    .where(inArray(contentTags.contentId, contentRows.map(content => content.id)))
    .all()

  return attachTagsToContents(contentRows, tagRows)
})
