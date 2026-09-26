import { readFileSync } from 'node:fs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

describe('FTS5 sync', () => {
  let db: Database.Database

  beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    migrate(drizzle(db), { migrationsFolder: './drizzle' })
  })

  afterEach(() => {
    db.close()
  })

  it('syncs insert to FTS', () => {
    db.prepare(`
      INSERT INTO contents (
        slug, type, title, content_md, content_html, visibility, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('hello-world', 'blog', 'Hello World', 'foo bar', '<p>foo bar</p>', 'public', 'published')
    const row = db.prepare('SELECT title FROM contents_fts WHERE contents_fts MATCH ?').get('Hello') as { title: string }
    expect(row.title).toBe('Hello World')
  })

  it('indexes content that existed before the FTS migration', () => {
    const legacy = new Database(':memory:')
    try {
      legacy.exec('CREATE TABLE contents (id INTEGER PRIMARY KEY, title TEXT, content_md TEXT)')
      legacy.prepare('INSERT INTO contents (title, content_md) VALUES (?, ?)').run('Existing Note', 'archived knowledge')
      const migration = readFileSync('./drizzle/0003_add_contents_fts.sql', 'utf8')
      for (const statement of migration.split('--> statement-breakpoint')) legacy.exec(statement)
      const row = legacy.prepare('SELECT title FROM contents_fts WHERE contents_fts MATCH ?').get('archived') as { title: string }
      expect(row.title).toBe('Existing Note')
    }
    finally {
      legacy.close()
    }
  })
})
