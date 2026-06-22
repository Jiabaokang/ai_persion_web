import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  useDB().delete(contents).where(eq(contents.id, id)).run()
  return { ok: true }
})
