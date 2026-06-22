import type Database from 'better-sqlite3'

export interface FtsHit { id: number, title: string, snippet: string }

export function syncFts(db: Database.Database) {
  db.exec(`
    INSERT INTO contents_fts(contents_fts, rowid, title, content_md)
    SELECT 'delete', id, title, content_md FROM contents;
    INSERT INTO contents_fts(rowid, title, content_md)
    SELECT id, title, content_md FROM contents;
  `)
}

export function searchFts(db: Database.Database, query: string, limit = 20): FtsHit[] {
  const safeQuery = query.replace(/['"\\]/g, ' ')
  const stmt = db.prepare(`
    SELECT c.id, c.title,
      snippet(contents_fts, 1, '<mark>', '</mark>', '…', 12) AS snippet
    FROM contents_fts
    JOIN contents c ON c.id = contents_fts.rowid
    WHERE contents_fts MATCH ?
    LIMIT ?
  `)
  return stmt.all(safeQuery, limit) as FtsHit[]
}
