import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const _placeholder = sqliteTable('_placeholder', {
  id: integer('id').primaryKey(),
})
