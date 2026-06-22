import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { contents, tags, contentTags, assets, sessions } from '~/server/utils/schema'
import { eq } from 'drizzle-orm'

describe('content tables', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const sqlite = new Database(':memory:')
    db = drizzle(sqlite)
    migrate(db, { migrationsFolder: './drizzle' })
  })

  it('contents table rejects duplicate slug', () => {
    db.insert(contents).values({
      slug: 'a', type: 'blog', title: 't',
      contentMd: 'm', contentHtml: 'h',
      visibility: 'public', status: 'draft',
    }).run()
    expect(() => {
      db.insert(contents).values({
        slug: 'a', type: 'note', title: 't',
        contentMd: 'm', contentHtml: 'h',
        visibility: 'public', status: 'draft',
      }).run()
    }).toThrow()
  })

  it('content_tags is many-to-many', () => {
    const c = db.insert(contents).values({
      slug: 'a', type: 'blog', title: 't',
      contentMd: 'm', contentHtml: 'h',
      visibility: 'public', status: 'published',
    }).returning().get()
    const t = db.insert(tags).values({ name: 'tech', slug: 'tech' }).returning().get()
    db.insert(contentTags).values({ contentId: c.id, tagId: t.id }).run()
    const result = db.select().from(contentTags).where(eq(contentTags.contentId, c.id)).get()
    expect(result?.tagId).toBe(t.id)
  })
})
