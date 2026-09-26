-- 为 contents 建立 FTS5 全文索引。
CREATE VIRTUAL TABLE IF NOT EXISTS contents_fts USING fts5(
  title, content_md,
  content='contents', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);
--> statement-breakpoint
-- 新增内容后同步写入全文索引。
CREATE TRIGGER IF NOT EXISTS contents_ai AFTER INSERT ON contents BEGIN
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;
--> statement-breakpoint
-- 删除内容后同步移除全文索引。
CREATE TRIGGER IF NOT EXISTS contents_ad AFTER DELETE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
END;
--> statement-breakpoint
-- 更新内容后重建对应全文索引。
CREATE TRIGGER IF NOT EXISTS contents_au AFTER UPDATE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;
--> statement-breakpoint
-- 为迁移前已有的内容建立索引，触发器只负责后续写入。
INSERT INTO contents_fts(contents_fts) VALUES('rebuild');
