import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const contents = sqliteTable('contents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['note', 'inspiration', 'blog', 'wechat'] }).notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  contentMd: text('content_md').notNull(),
  contentHtml: text('content_html').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull(),
  status: text('status', { enum: ['draft', 'published'] }).notNull(),
  coverImageUrl: text('cover_image_url'),
  readingTime: integer('reading_time'),
  viewCount: integer('view_count').default(0).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const contentTags = sqliteTable('content_tags', {
  contentId: integer('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({ pk: primaryKey({ columns: [t.contentId, t.tagId] }) }))

export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contentId: integer('content_id').references(() => contents.id, { onDelete: 'set null' }),
  ossKey: text('oss_key').notNull(),
  ossUrl: text('oss_url').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  originalFilename: text('original_filename'),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const _placeholder = sqliteTable('_placeholder', {
  id: integer('id').primaryKey(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type Content = typeof contents.$inferSelect
export type NewContent = typeof contents.$inferInsert
export type Tag = typeof tags.$inferSelect
export type Session = typeof sessions.$inferSelect
