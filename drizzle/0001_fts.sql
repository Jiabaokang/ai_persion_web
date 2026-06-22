-- FTS5 虚表
CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
  title, content_md,
  content='contents', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

-- 同步触发器
CREATE TRIGGER IF NOT EXISTS contents_ai AFTER INSERT ON contents BEGIN
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;

CREATE TRIGGER IF NOT EXISTS contents_ad AFTER DELETE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
END;

CREATE TRIGGER IF NOT EXISTS contents_au AFTER UPDATE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;
