import type { H3Event } from 'h3'
import { setCookie, getCookie, deleteCookie } from 'h3'
import { SESSION_COOKIE } from './session'

export function setSessionCookie(event: H3Event, id: string, expiresAt: Date) {
  setCookie(event, SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export function getSessionIdFromCookie(event: H3Event): string | undefined {
  return getCookie(event, SESSION_COOKIE)
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
