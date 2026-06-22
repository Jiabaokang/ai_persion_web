import { and, eq, gt } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { users, sessions } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const sid = getSessionIdFromCookie(event)
  if (!sid) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const row = useDB()
    .select({ id: users.id, username: users.username })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(
      eq(sessions.id, hashSessionId(sid)),
      gt(sessions.expiresAt, new Date()),
    ))
    .get()

  if (!row) throw createError({ statusCode: 401, statusMessage: 'Session expired' })
  return row
})
