import { z } from 'h3-zod'
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { users, sessions } from '~/server/utils/schema'
import { verifyPassword } from '~/server/utils/password'
import { useLoginRateLimiter } from '~/server/utils/rate-limit'
import { generateSessionId, hashSessionId, SESSION_TTL_DAYS } from '~/server/utils/session'
import { setSessionCookie } from '~/server/utils/cookie'

const Body = z.object({ username: z.string().trim().min(1).max(128), password: z.string().min(1).max(1024) })

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  const rl = useLoginRateLimiter()
  const clientIp = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || getRequestIP(event, { xForwardedFor: false }) || 'unknown'
  const throttleKey = `${clientIp}:${body.username.toLowerCase()}`

  if (rl.isLocked(throttleKey)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts, try later' })
  }

  const db = useDB()
  const user = db.select().from(users).where(eq(users.username, body.username)).get()
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    rl.recordFailure(throttleKey)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  rl.recordSuccess(throttleKey)
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  db.insert(sessions).values({ id: hashSessionId(sessionId), userId: user.id, expiresAt }).run()
  setSessionCookie(event, sessionId, expiresAt)
  return { id: user.id, username: user.username }
})
