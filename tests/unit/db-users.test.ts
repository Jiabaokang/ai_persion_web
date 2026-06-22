import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { eq } from 'drizzle-orm'
import { users } from '~/server/utils/schema'

describe('users schema', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite)
    migrate(db, { migrationsFolder: './drizzle' })
  })

  it('should insert and query user', () => {
    db.insert(users).values({ username: 'admin', passwordHash: 'x' }).run()
    const result = db.select().from(users).where(eq(users.username, 'admin')).get()
    expect(result?.username).toBe('admin')
  })
})
