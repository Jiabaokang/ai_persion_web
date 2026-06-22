import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { sessions } from '~/server/utils/schema'
import { getSessionIdFromCookie, clearSessionCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const sid = getSessionIdFromCookie(event)
  if (sid) {
    useDB().delete(sessions).where(eq(sessions.id, hashSessionId(sid))).run()
  }
  clearSessionCookie(event)
  return { ok: true }
})
