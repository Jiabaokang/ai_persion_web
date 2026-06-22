import { eq } from 'drizzle-orm'
import { useDB } from './db'
import { users } from './schema'
import { hashPassword } from './password'

export async function ensureAdminUser(username: string, defaultPassword: string) {
  const db = useDB()
  const existing = db.select().from(users).where(eq(users.username, username)).get()
  if (existing) return existing
  const hash = await hashPassword(defaultPassword)
  return db.insert(users).values({ username, passwordHash: hash }).returning().get()
}
