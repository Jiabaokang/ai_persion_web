import { and, eq, gt } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { sessions, users } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'
import { assertValidMutationRequest, getSecurityHeaders } from '~/server/utils/security'
import { useApiRateLimiter } from '~/server/utils/rate-limit'

const ALWAYS_PROTECT = ['/api/upload', '/api/wechat']
const READ_WRITE_PATHS = ['/api/contents', '/api/tags']

function getClientIp(event: any) {
  return getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getRequestIP(event, { xForwardedFor: false })
    || 'unknown'
}

function isApiRequest(event: any) {
  return (event.path || '').startsWith('/api/')
}

function assertSafeWriteRequest(event: any) {
  if (event.method === 'GET' || event.method === 'HEAD') return
  const config = useRuntimeConfig(event)
  const expectedOrigin = String(config.public.siteUrl).replace(/\/$/, '')
  const contentType = getRequestHeader(event, 'content-type')

  // DELETE has no JSON body, but it must still come from the configured site origin.
  if (event.method === 'DELETE') {
    if (getRequestHeader(event, 'origin') !== expectedOrigin) {
      throw createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
    }
    return
  }

  try {
    assertValidMutationRequest({
      origin: getRequestHeader(event, 'origin'),
      expectedOrigin,
      contentType,
      contentLength: getRequestHeader(event, 'content-length'),
    })
  }
  catch (error: any) {
    const statusCode = error.message === 'Request body too large' ? 413 : 403
    throw createError({ statusCode, statusMessage: error.message })
  }
}

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
  for (const [name, value] of Object.entries(getSecurityHeaders())) setResponseHeader(event, name, value)

  if (isApiRequest(event) && !useApiRateLimiter().allow(getClientIp(event))) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests, try later' })
  }

  if (isApiRequest(event)) assertSafeWriteRequest(event)

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
