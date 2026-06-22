import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/utils/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.NUXT_DB_PATH || './data/db.sqlite',
  },
})
