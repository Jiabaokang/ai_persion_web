import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'

describe('FTS5 sync', () => {
  let db: Database.Database
  beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    db.exec(`
      CREATE TABLE contents (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content_md TEXT NOT NULL
      );
      CREATE VIRTUAL TABLE contents_fts USING fts5(
        title, content_md, content='contents', content_rowid='id'
      );
      CREATE TRIGGER contents_ai AFTER INSERT ON contents BEGIN
        INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
      END;
    `)
  })

  it('syncs insert to FTS', () => {
    db.prepare('INSERT INTO contents (title, content_md) VALUES (?, ?)').run('Hello World', 'foo bar')
    const row = db.prepare('SELECT title FROM contents_fts WHERE contents_fts MATCH ?').get('Hello') as { title: string }
    expect(row.title).toBe('Hello World')
  })
})
