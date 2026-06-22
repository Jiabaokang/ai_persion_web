import { randomBytes, createHash } from 'node:crypto'

export function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionId(id: string): string {
  return createHash('sha256').update(id).digest('hex')
}

export const SESSION_COOKIE = 'session_id'
export const SESSION_TTL_DAYS = 30
