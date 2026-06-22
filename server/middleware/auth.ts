import { and, eq, gt } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { sessions, users } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

const ALWAYS_PROTECT = ['/api/upload', '/api/wechat']
const READ_WRITE_PATHS = ['/api/contents', '/api/tags']

function isWriteProtected(event: any): boolean {
  const path = event.path || ''
  if (ALWAYS_PROTECT.some(p => path.startsWith(p))) return true
  if (READ_WRITE_PATHS.some(p => path.startsWith(p)) && event.method !== 'GET') return true
  return false
}

function shouldSetUser(event: any): boolean {
  const path = event.path || ''
  if (ALWAYS_PROTECT.some(p => path.startsWith(p))) return true
  if (READ_WRITE_PATHS.some(p => path.startsWith(p))) return true
  return false
}

async function getUserFromCookie(event: any) {
  const sid = getSessionIdFromCookie(event)
  if (!sid) return null
  return useDB()
    .select({ id: users.id, username: users.username })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashSessionId(sid)), gt(sessions.expiresAt, new Date())))
    .get()
}

export default defineEventHandler(async (event) => {
  if (isWriteProtected(event)) {
    const user = await getUserFromCookie(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    event.context.user = user
    return
  }

  if (shouldSetUser(event)) {
    event.context.user = await getUserFromCookie(event)
  }
})
