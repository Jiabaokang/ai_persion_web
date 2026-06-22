import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  useDB().delete(tags).where(eq(tags.id, id)).run()
  return { ok: true }
})
