# AI 个人网站 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在阿里云 ECS（2核 2G 40G）上部署一个支持公开博客/公众号文章 + 私密笔记/灵感的个人网站，单用户管理。

**架构：** Nuxt 3 混合渲染（公开 SSG + 私密 SSR + 后台 SSR），SQLite 单文件存储（每日备份到 OSS），图片直传阿里云 OSS，前置阿里云 CDN 抗并发。

**技术栈：** Nuxt 3 + Vue 3 + TypeScript + Drizzle ORM + SQLite (better-sqlite3) + SQLite FTS5 + jieba-wasm + TipTap + 阿里云 OSS + 阿里云 CDN + PM2 + nginx

---

## 全局约定（所有任务必须遵守）

- **Commit 规范**：遵循 Conventional Commits（`feat:` / `fix:` / `chore:` / `docs:` / `test:` / `refactor:`）
- **分支**：所有工作在 `main` 上；每完成一个任务直接 commit
- **测试框架**：Vitest（单元/集成） + Vue Test Utils（组件）
- **Node 版本**：>= 20.x
- **包管理器**：pnpm
- **TypeScript 严格模式**：`strict: true`，禁止 `any`
- **环境变量**：所有密钥经 `runtimeConfig` 注入，不硬编码
- **TDD 流程**：先写失败测试 → 跑测试确认红 → 写最少实现 → 跑测试确认绿 → 重构 → commit
- **日志**：使用 `consola`（Nuxt 内置）
- **文件命名**：组件 PascalCase (`Editor.vue`)，工具函数 camelCase (`useAuth.ts`)，路由 kebab-case (`wechat-export.vue`)

---

# MVP 阶段（P1-P6，跑通核心闭环）

## 任务 0：项目初始化

**文件：**
- 创建：`package.json` / `pnpm-workspace.yaml` / `.gitignore` / `.editorconfig` / `README.md`

- [ ] **步骤 1：用 pnpm 初始化项目**

```bash
cd /Users/jiabaokang/AIProject/ai_persion_web
pnpm init
```

- [ ] **步骤 2：写入 package.json 元信息**

```json
{
  "name": "ai-persion-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20.x" }
}
```

- [ ] **步骤 3：写入 .gitignore**

```gitignore
node_modules/
.nuxt/
.output/
.data/
dist/
data/
*.sqlite
*.sqlite-journal
*.sqlite-wal
.env
.env.*
!.env.example
.DS_Store
*.log
coverage/
.vscode/
.idea/
```

- [ ] **步骤 4：写入 README.md 骨架**

```markdown
# AI Personal Web

个人网站（笔记 / 灵感 / 博客 / 公众号）

## 开发

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

详见 [docs/superpowers/specs/](docs/superpowers/specs/)。
```

- [ ] **步骤 5：Commit**

```bash
git init
git add .
git commit -m "chore: initialize project"
```

---

## 任务 1：Nuxt 3 + TypeScript 脚手架

**文件：**
- 创建：`nuxt.config.ts` / `tsconfig.json` / `app.vue` / `.nvmrc`

- [ ] **步骤 1：安装 Nuxt 3**

```bash
pnpm add -D nuxt@^3.13.0 vue-tsc@^2.1.0 typescript@^5.5.0
```

- [ ] **步骤 2：写入 nuxt.config.ts**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    sessionSecret: '',  // NUXT_SESSION_SECRET
    dbPath: './data/db.sqlite',  // NUXT_DB_PATH
    public: {
      siteName: 'AI Personal Web',
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/wechat/**': { prerender: true },
    '/tags/**': { prerender: true },
  },
})
```

- [ ] **步骤 3：写入 tsconfig.json**

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

- [ ] **步骤 4：写入 app.vue**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **步骤 5：写入 .nvmrc**

```
20
```

- [ ] **步骤 6：启动验证**

```bash
pnpm exec nuxt prepare
pnpm dev
```

预期：`http://localhost:3000` 返回 200（空白页），无 TypeScript 错误。

- [ ] **步骤 7：Commit**

```bash
git add .
git commit -m "feat: scaffold nuxt 3 with strict typescript"
```

---

## 任务 2：UnoCSS + Lint 工具链

**文件：**
- 创建：`uno.config.ts` / `.eslintrc.cjs` / `.prettierrc` / `.prettierignore`
- 修改：`package.json`（添加 scripts）

- [ ] **步骤 1：安装 UnoCSS**

```bash
pnpm add -D @unocss/nuxt@^0.62.0
```

- [ ] **步骤 2：注册 UnoCSS 模块**

修改 `nuxt.config.ts`：
```ts
export default defineNuxtConfig({
  modules: ['@unocss/nuxt'],
  // ... 其余配置
})
```

- [ ] **步骤 3：写入 uno.config.ts**

```ts
import { defineConfig, presetUno, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2 }),
    presetTypography(),
  ],
  theme: {
    colors: {
      primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    },
  },
})
```

- [ ] **步骤 4：安装 ESLint + Prettier**

```bash
pnpm add -D eslint@^9.0.0 @nuxt/eslint-config@^0.5.0 prettier@^3.3.0
```

- [ ] **步骤 5：写入 .eslintrc.cjs**

```js
module.exports = {
  root: true,
  extends: ['@nuxt/eslint-config'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
}
```

- [ ] **步骤 6：写入 .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **步骤 7：写入 .prettierignore**

```
node_modules
.nuxt
.output
data
dist
*.md
```

- [ ] **步骤 8：添加 scripts 到 package.json**

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "nuxt typecheck"
  }
}
```

- [ ] **步骤 9：验证 Lint 跑通**

```bash
pnpm lint
```

预期：0 errors，0 warnings。

- [ ] **步骤 10：Commit**

```bash
git add .
git commit -m "chore: add unocss eslint prettier"
```

---

## 任务 3：Vitest 测试框架

**文件：**
- 创建：`vitest.config.ts` / `tests/setup.ts` / `tests/unit/.gitkeep`

- [ ] **步骤 1：安装 Vitest**

```bash
pnpm add -D vitest@^2.0.0 @vue/test-utils@^2.4.0 happy-dom@^15.0.0
```

- [ ] **步骤 2：写入 vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

- [ ] **步骤 3：写入 tests/setup.ts**

```ts
import { vi } from 'vitest'

vi.stubEnv('NUXT_SESSION_SECRET', 'test-secret-must-be-long-enough')
```

- [ ] **步骤 4：写入第一个测试 tests/unit/sanity.test.ts**

```ts
import { describe, it, expect } from 'vitest'

describe('sanity', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **步骤 5：跑测试确认绿**

```bash
pnpm exec vitest run
```

预期：1 passed。

- [ ] **步骤 6：添加 test scripts 到 package.json**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **步骤 7：Commit**

```bash
git add .
git commit -m "test: scaffold vitest with happy-dom"
```

---

## 任务 4：Drizzle ORM + better-sqlite3

**文件：**
- 创建：`drizzle.config.ts` / `server/utils/db.ts` / `drizzle/.gitkeep`

- [ ] **步骤 1：安装 Drizzle + SQLite**

```bash
pnpm add drizzle-orm@^0.33.0 better-sqlite3@^11.3.0
pnpm add -D drizzle-kit@^0.24.0 @types/better-sqlite3@^7.6.0
```

- [ ] **步骤 2：写入 drizzle.config.ts**

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/utils/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.NUXT_DB_PATH || './data/db.sqlite',
  },
})
```

- [ ] **步骤 3：写入 server/utils/db.ts**

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDB() {
  if (_db) return _db
  const path = process.env.NUXT_DB_PATH || './data/db.sqlite'
  mkdirSync(dirname(path), { recursive: true })
  const sqlite = new Database(path)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('synchronous = NORMAL')
  sqlite.pragma('foreign_keys = ON')
  _db = drizzle(sqlite, { schema })
  return _db
}
```

- [ ] **步骤 4：写入 server/utils/schema.ts（空 schema 占位）**

```ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// 后续任务中补充具体表
export const _placeholder = sqliteTable('_placeholder', {
  id: integer('id').primaryKey(),
})
```

- [ ] **步骤 5：生成迁移**

```bash
mkdir -p data
pnpm exec drizzle-kit generate
```

预期：`./drizzle/0000_*.sql` 文件生成。

- [ ] **步骤 6：跑测试确认无回归**

```bash
pnpm test
```

- [ ] **步骤 7：Commit**

```bash
git add .
git commit -m "feat: integrate drizzle orm with better-sqlite3"
```

---

## 任务 5：users 表 schema + 迁移

**文件：**
- 修改：`server/utils/schema.ts` / `drizzle/0000_*.sql`（自动生成）

- [ ] **步骤 1：写失败测试 tests/unit/db-users.test.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { users } from '~/server/utils/schema'
import { eq } from 'drizzle-orm'

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
```

- [ ] **步骤 2：跑测试确认红**

```bash
pnpm test
```

预期：FAIL，`users` not exported。

- [ ] **步骤 3：定义 users 表 schema**

修改 `server/utils/schema.ts`：
```ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// 后续任务补充其他表
export const _placeholder = sqliteTable('_placeholder', {
  id: integer('id').primaryKey(),
})
```

- [ ] **步骤 4：生成迁移**

```bash
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

- [ ] **步骤 5：跑测试确认绿**

```bash
pnpm test
```

预期：1 passed。

- [ ] **步骤 6：Commit**

```bash
git add .
git commit -m "feat(db): add users table schema"
```

---

## 任务 6：contents / tags / content_tags / assets / sessions 表

**文件：**
- 修改：`server/utils/schema.ts`
- 测试：`tests/unit/db-content-tables.test.ts`

- [ ] **步骤 1：写失败测试 tests/unit/db-content-tables.test.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { contents, tags, contentTags, assets, sessions } from '~/server/utils/schema'
import { eq, and } from 'drizzle-orm'

describe('content tables', () => {
  let db: ReturnType<typeof drizzle>
  beforeEach(() => {
    const sqlite = new Database(':memory:')
    db = drizzle(sqlite)
    migrate(db, { migrationsFolder: './drizzle' })
  })

  it('contents table has type/visibility check', () => {
    expect(() => {
      db.insert(contents).values({
        slug: 'a', type: 'invalid', title: 't',
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
```

- [ ] **步骤 2：跑测试确认红**

```bash
pnpm test
```

- [ ] **步骤 3：扩展 schema**

修改 `server/utils/schema.ts`，添加：
```ts
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
```

- [ ] **步骤 4：生成迁移 + 应用**

```bash
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

- [ ] **步骤 5：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 6：Commit**

```bash
git add .
git commit -m "feat(db): add contents tags assets sessions tables"
```

---

## 任务 7：FTS5 全文搜索虚表 + 触发器

**文件：**
- 创建：`server/utils/fts.ts` / `drizzle/0001_fts.sql`（手写迁移）

- [ ] **步骤 1：手写 FTS 迁移文件**

创建 `drizzle/0001_fts.sql`：
```sql
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
```

- [ ] **步骤 2：写失败测试 tests/unit/fts.test.ts**

```ts
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
```

- [ ] **步骤 3：跑测试确认红→绿**

```bash
pnpm test
```

- [ ] **步骤 4：写入 server/utils/fts.ts（辅助函数）**

```ts
import type Database from 'better-sqlite3'

export interface FtsHit { id: number; title: string; snippet: string }

/**
 * 同步 FTS 虚表（迁移文件已建触发器，此函数为重建时用）
 */
export function syncFts(db: Database.Database) {
  db.exec(`
    INSERT INTO contents_fts(contents_fts, rowid, title, content_md)
    SELECT 'delete', id, title, content_md FROM contents;
    INSERT INTO contents_fts(rowid, title, content_md)
    SELECT id, title, content_md FROM contents;
  `)
}

/**
 * 全文搜索（带 snippet 高亮）
 */
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
```

- [ ] **步骤 5：手动执行 FTS 迁移**

在 `data/db.sqlite` 上执行 `drizzle/0001_fts.sql`（P11 部署时通过脚本批量执行）。

- [ ] **步骤 6：Commit**

```bash
git add .
git commit -m "feat(db): add fts5 virtual table and sync triggers"
```

---

## 任务 8：bcrypt 工具 + 会话 token 工具

**文件：**
- 创建：`server/utils/password.ts` / `server/utils/session.ts` / `server/utils/cookie.ts`
- 测试：`tests/unit/password.test.ts` / `tests/unit/session.test.ts`

- [ ] **步骤 1：安装 bcrypt**

```bash
pnpm add bcrypt@^5.1.0
pnpm add -D @types/bcrypt@^5.0.0
```

- [ ] **步骤 2：写失败测试 tests/unit/password.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '~/server/utils/password'

describe('password', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    expect(hash).not.toBe('correct-horse-battery-staple')
    expect(await verifyPassword('correct-horse-battery-staple', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})
```

- [ ] **步骤 3：跑测试确认红**

```bash
pnpm test
```

- [ ] **步骤 4：实现 server/utils/password.ts**

```ts
import bcrypt from 'bcrypt'

const ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
```

- [ ] **步骤 5：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 6：写失败测试 tests/unit/session.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { generateSessionId, hashSessionId } from '~/server/utils/session'

describe('session', () => {
  it('generates 64-char hex id', () => {
    const id = generateSessionId()
    expect(id).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashes session id deterministically', () => {
    const id = 'abc123'
    expect(hashSessionId(id)).toBe(hashSessionId(id))
    expect(hashSessionId(id)).not.toBe(id)
  })
})
```

- [ ] **步骤 7：实现 server/utils/session.ts**

```ts
import { randomBytes, createHash } from 'node:crypto'

export function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionId(id: string): string {
  return createHash('sha256').update(id).digest('hex')
}

export const SESSION_COOKIE = 'session_id'
export const SESSION_TTL_DAYS = 30
```

- [ ] **步骤 8：实现 server/utils/cookie.ts**

```ts
import type { H3Event } from 'h3'
import { setCookie, getCookie, deleteCookie } from 'h3'
import { SESSION_COOKIE } from './session'

export function setSessionCookie(event: H3Event, id: string, expiresAt: Date) {
  setCookie(event, SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export function getSessionIdFromCookie(event: H3Event): string | undefined {
  return getCookie(event, SESSION_COOKIE)
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
```

- [ ] **步骤 9：跑全部测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 10：Commit**

```bash
git add .
git commit -m "feat(auth): add password and session utilities"
```

---

## 任务 9：登录失败计数器（防爆破）

**文件：**
- 创建：`server/utils/rate-limit.ts`
- 测试：`tests/unit/rate-limit.test.ts`

- [ ] **步骤 1：写失败测试 tests/unit/rate-limit.test.ts**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginRateLimiter } from '~/server/utils/rate-limit'

describe('LoginRateLimiter', () => {
  beforeEach(() => { vi.useFakeTimers() })

  it('locks after 5 failures', () => {
    const rl = new LoginRateLimiter()
    for (let i = 0; i < 5; i++) rl.recordFailure('user')
    expect(rl.isLocked('user')).toBe(true)
  })

  it('unlocks after 30 minutes', () => {
    const rl = new LoginRateLimiter()
    for (let i = 0; i < 5; i++) rl.recordFailure('user')
    vi.advanceTimersByTime(31 * 60 * 1000)
    expect(rl.isLocked('user')).toBe(false)
  })

  it('resets on success', () => {
    const rl = new LoginRateLimiter()
    rl.recordFailure('user')
    rl.recordSuccess('user')
    for (let i = 0; i < 4; i++) rl.recordFailure('user')
    expect(rl.isLocked('user')).toBe(false)
  })
})
```

- [ ] **步骤 2：实现 server/utils/rate-limit.ts**

```ts
const MAX_FAILURES = 5
const LOCK_DURATION_MS = 30 * 60 * 1000

export class LoginRateLimiter {
  private failures = new Map<string, { count: number; lockedUntil?: number }>()

  isLocked(key: string): boolean {
    const entry = this.failures.get(key)
    if (!entry?.lockedUntil) return false
    if (Date.now() >= entry.lockedUntil) {
      this.failures.delete(key)
      return false
    }
    return true
  }

  recordFailure(key: string) {
    const entry = this.failures.get(key) ?? { count: 0 }
    entry.count += 1
    if (entry.count >= MAX_FAILURES) entry.lockedUntil = Date.now() + LOCK_DURATION_MS
    this.failures.set(key, entry)
  }

  recordSuccess(key: string) {
    this.failures.delete(key)
  }
}

let _instance: LoginRateLimiter | null = null
export function useLoginRateLimiter() {
  if (!_instance) _instance = new LoginRateLimiter()
  return _instance
}
```

- [ ] **步骤 3：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 4：Commit**

```bash
git add .
git commit -m "feat(auth): add login rate limiter (5 fails / 30 min lock)"
```

---

## 任务 10：登录/登出/me API

**文件：**
- 创建：`server/api/auth/login.post.ts` / `server/api/auth/logout.post.ts` / `server/api/auth/me.get.ts` / `server/utils/init-admin.ts`

- [ ] **步骤 1：写失败测试 tests/integration/auth.test.ts**

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { mkdirSync, rmSync } from 'node:fs'

await setup({
  rootDir: process.cwd(),
  server: true,
  setup: async () => {
    rmSync('./data/test.sqlite', { force: true })
    process.env.NUXT_DB_PATH = './data/test.sqlite'
    mkdirSync('./data', { recursive: true })
  },
})

describe('auth api', () => {
  it('rejects wrong password', async () => {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'wrong' },
      ignoreResponseError: true,
    }).catch((e) => e.data)
    expect(res).toMatchObject({ error: expect.any(String) })
  })

  it('logs in with correct password and returns user', async () => {
    const cookies: string[] = []
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin123' },
      onResponse: ({ response }) => cookies.push(...response.headers.getSetCookie()),
    })
    const me = await $fetch('/api/auth/me', { headers: { cookie: cookies.join('; ') } })
    expect(me).toMatchObject({ username: 'admin' })
  })
})
```

- [ ] **步骤 2：实现 server/utils/init-admin.ts**

```ts
import { useDB } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from './password'

export async function ensureAdminUser(username: string, defaultPassword: string) {
  const db = useDB()
  const existing = db.select().from(users).where(eq(users.username, username)).get()
  if (existing) return existing
  const hash = await hashPassword(defaultPassword)
  return db.insert(users).values({ username, passwordHash: hash }).returning().get()
}
```

- [ ] **步骤 3：实现 server/api/auth/login.post.ts**

```ts
import { z } from 'h3-zod'
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { users } from '~/server/utils/schema'
import { verifyPassword } from '~/server/utils/password'
import { useLoginRateLimiter } from '~/server/utils/rate-limit'
import { generateSessionId, hashSessionId, SESSION_TTL_DAYS } from '~/server/utils/session'
import { setSessionCookie } from '~/server/utils/cookie'
import { sessions } from '~/server/utils/schema'

const Body = z.object({ username: z.string().min(1), password: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  const rl = useLoginRateLimiter()

  if (rl.isLocked(body.username)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts, try later' })
  }

  const db = useDB()
  const user = db.select().from(users).where(eq(users.username, body.username)).get()
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    rl.recordFailure(body.username)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  rl.recordSuccess(body.username)
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  db.insert(sessions).values({ id: hashSessionId(sessionId), userId: user.id, expiresAt }).run()
  setSessionCookie(event, sessionId, expiresAt)
  return { id: user.id, username: user.username }
})
```

- [ ] **步骤 4：安装 zod**

```bash
pnpm add h3-zod@^0.5.0
```

- [ ] **步骤 5：实现 server/api/auth/logout.post.ts**

```ts
import { useDB } from '~/server/utils/db'
import { sessions } from '~/server/utils/schema'
import { eq } from 'drizzle-orm'
import { getSessionIdFromCookie, clearSessionCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const sid = getSessionIdFromCookie(event)
  if (sid) {
    useDB().delete(sessions).where(eq(sessions.id, hashSessionId(sid))).run()
  }
  clearSessionCookie(event)
  return { ok: true }
})
```

- [ ] **步骤 6：实现 server/api/auth/me.get.ts**

```ts
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { users, sessions } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const sid = getSessionIdFromCookie(event)
  if (!sid) throw createError({ statusCode: 401 })
  const session = useDB()
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, hashSessionId(sid)))
    .get()
  if (!session || session.user.id !== (await getUserFromSession(sid))?.id) {
    throw createError({ statusCode: 401 })
  }
  return { id: session.user.id, username: session.user.username }
})

async function getUserFromSession(sid: string) {
  const row = useDB()
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, hashSessionId(sid)))
    .get()
  if (!row) return null
  if (row && row.user) return row.user
  return null
}
```

> ⚠️ 上面代码需重构为更清晰的单次查询（重构步骤在下方）：

- [ ] **步骤 7：重构 server/api/auth/me.get.ts**

```ts
import { and, eq, gt } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { users, sessions } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const sid = getSessionIdFromCookie(event)
  if (!sid) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const row = useDB()
    .select({ id: users.id, username: users.username })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(
      eq(sessions.id, hashSessionId(sid)),
      gt(sessions.expiresAt, new Date())
    ))
    .get()

  if (!row) throw createError({ statusCode: 401, statusMessage: 'Session expired' })
  return row
})
```

- [ ] **步骤 8：注册启动时初始化 admin 用户的 Nitro 插件**

创建 `server/plugins/00.init-admin.ts`：
```ts
import { ensureAdminUser } from '~/server/utils/init-admin'

export default defineNitroPlugin(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  await ensureAdminUser(username, password)
  if (password === 'admin123') {
    console.warn('[INIT] Using default admin password, please change it in production!')
  }
})
```

- [ ] **步骤 9：写 .env.example**

```
NUXT_SESSION_SECRET=replace-with-32-char-random-string
NUXT_DB_PATH=./data/db.sqlite
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **步骤 10：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 11：Commit**

```bash
git add .
git commit -m "feat(auth): implement login logout me endpoints"
```

---

## 任务 11：auth 中间件（私有路由守卫）

**文件：**
- 创建：`server/middleware/auth.ts`

- [ ] **步骤 1：实现 server/middleware/auth.ts**

```ts
import { and, eq, gt } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { sessions, users } from '~/server/utils/schema'
import { getSessionIdFromCookie } from '~/server/utils/cookie'
import { hashSessionId } from '~/server/utils/session'

const PROTECTED_PREFIXES = ['/api/contents', '/api/tags', '/api/upload', '/api/wechat']

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (!PROTECTED_PREFIXES.some((p) => path.startsWith(p))) return

  const sid = getSessionIdFromCookie(event)
  if (!sid) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const user = useDB()
    .select({ id: users.id, username: users.username })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashSessionId(sid)), gt(sessions.expiresAt, new Date())))
    .get()

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Session expired' })

  event.context.user = user
})
```

- [ ] **步骤 2：手动验证中间件**

```bash
pnpm dev
# 浏览器访问 http://localhost:3000/api/contents
```

预期：401（未登录）。

- [ ] **步骤 3：Commit**

```bash
git add .
git commit -m "feat(auth): add protected route middleware"
```

---

## 任务 12：login 页面

**文件：**
- 创建：`pages/login.vue` / `components/ui/Input.vue` / `components/ui/Button.vue` / `composables/useAuth.ts`

- [ ] **步骤 1：写失败组件测试 tests/unit/login.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginPage from '~/pages/login.vue'

describe('login page', () => {
  it('renders username and password fields', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.find('input[name=username]').exists()).toBe(true)
    expect(wrapper.find('input[name=password]').exists()).toBe(true)
  })
})
```

- [ ] **步骤 2：实现 components/ui/Input.vue**

```vue
<script setup lang="ts">
defineProps<{ modelValue: string; name: string; type?: string; placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :name="name"
    :type="type || 'text'"
    :placeholder="placeholder"
    :value="modelValue"
    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
```

- [ ] **步骤 3：实现 components/ui/Button.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{ type?: 'button' | 'submit'; disabled?: boolean }>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
  >
    <slot />
  </button>
</template>
```

- [ ] **步骤 4：实现 composables/useAuth.ts**

```ts
export interface AuthUser { id: number; username: string }

export function useAuth() {
  const user = useState<AuthUser | null>('auth.user', () => null)

  async function login(username: string, password: string) {
    const result = await $fetch<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = result
    return result
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  async function fetchMe() {
    try {
      user.value = await $fetch<AuthUser>('/api/auth/me')
    } catch {
      user.value = null
    }
    return user.value
  }

  return { user, login, logout, fetchMe }
}
```

- [ ] **步骤 5：实现 pages/login.vue**

```vue
<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <form
      class="w-full max-w-sm p-6 bg-white rounded shadow"
      @submit.prevent="submit"
    >
      <h1 class="text-2xl font-bold mb-4">登录</h1>
      <div class="space-y-3">
        <Input v-model="username" name="username" placeholder="用户名" />
        <Input v-model="password" name="password" type="password" placeholder="密码" />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <Button type="submit" :disabled="loading">{{ loading ? '登录中…' : '登录' }}</Button>
      </div>
    </form>
  </div>
</template>
```

- [ ] **步骤 6：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 7：手动验证**

```bash
pnpm dev
# 浏览器 http://localhost:3000/login
```

- [ ] **步骤 8：Commit**

```bash
git add .
git commit -m "feat(auth): add login page and useAuth composable"
```

---

## 任务 13：Markdown 工具（unified + remark + rehype）

**文件：**
- 创建：`server/utils/markdown.ts`
- 测试：`tests/unit/markdown.test.ts`

- [ ] **步骤 1：安装 unified 生态**

```bash
pnpm add unified@^11 remark-parse@^11 remark-gfm@^4 remark-rehype@^11 rehype-stringify@^10 rehype-highlight@^7
pnpm add -D @types/mdast@^4
```

- [ ] **步骤 2：写失败测试 tests/unit/markdown.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { renderMarkdown, calculateReadingTime, slugify } from '~/server/utils/markdown'

describe('markdown', () => {
  it('renders headings and paragraphs', async () => {
    const html = await renderMarkdown('# Hello\n\nWorld')
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<p>World</p>')
  })

  it('calculates reading time (CN chars)', () => {
    const md = '中'.repeat(400) // 400 字 ≈ 2 分钟（按 200 字/分钟）
    expect(calculateReadingTime(md)).toBe(2)
  })

  it('slugifies title', () => {
    expect(slugify('Hello World! 2026')).toBe('hello-world-2026')
  })
})
```

- [ ] **步骤 3：实现 server/utils/markdown.ts**

```ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
  return String(file)
}

export function calculateReadingTime(md: string): number {
  const cnChars = (md.match(/[\u4e00-\u9fa5]/g) || []).length
  const enWords = (md.replace(/[\u4e00-\u9fa5]/g, '').match(/\b\w+\b/g) || []).length
  const minutes = Math.ceil(cnChars / 200 + enWords / 200)
  return Math.max(1, minutes)
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
```

- [ ] **步骤 4：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 5：Commit**

```bash
git add .
git commit -m "feat(content): add markdown renderer and helpers"
```

---

## 任务 14：contents CRUD API

**文件：**
- 创建：`server/api/contents/index.get.ts` / `index.post.ts` / `[id].get.ts` / `[id].patch.ts` / `[id].delete.ts`
- 测试：`tests/integration/contents.test.ts`

- [ ] **步骤 1：写失败测试 tests/integration/contents.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

await setup({ rootDir: process.cwd(), server: true })

async function login() {
  const cookies: string[] = []
  await $fetch('/api/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'admin123' },
    onResponse: ({ response }) => cookies.push(...response.headers.getSetCookie()),
  })
  return { Cookie: cookies.join('; ') }
}

describe('contents api', () => {
  it('creates and lists blog post', async () => {
    const auth = await login()
    const created = await $fetch('/api/contents', {
      method: 'POST',
      headers: auth,
      body: {
        slug: 'test-post', type: 'blog', title: 'Test',
        contentMd: '# Hello', visibility: 'public', status: 'published',
      },
    })
    expect(created.slug).toBe('test-post')
    const list = await $fetch<any[]>('/api/contents?type=blog', { headers: auth })
    expect(list.find((c) => c.slug === 'test-post')).toBeTruthy()
  })

  it('rejects duplicate slug', async () => {
    const auth = await login()
    await expect(
      $fetch('/api/contents', {
        method: 'POST',
        headers: auth,
        body: {
          slug: 'dup', type: 'blog', title: 'Dup',
          contentMd: '', visibility: 'public', status: 'draft',
        },
      }),
    ).rejects.toThrow()
  })
})
```

- [ ] **步骤 2：实现 server/api/contents/index.get.ts**

```ts
import { and, desc, eq, type SQL } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents } from '~/server/utils/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const conds: SQL[] = []
  if (query.type) conds.push(eq(contents.type, String(query.type)))
  if (query.visibility) conds.push(eq(contents.visibility, String(query.visibility)))
  if (query.status) conds.push(eq(contents.status, String(query.status)))

  const where = conds.length ? and(...conds) : undefined
  return useDB().select().from(contents).where(where).orderBy(desc(contents.createdAt)).all()
})
```

- [ ] **步骤 3：实现 server/api/contents/index.post.ts**

```ts
import { z } from 'h3-zod'
import { useDB } from '~/server/utils/db'
import { contents, contentTags, tags } from '~/server/utils/schema'
import { renderMarkdown, calculateReadingTime, slugify } from '~/server/utils/markdown'
import { eq } from 'drizzle-orm'

const Body = z.object({
  slug: z.string().optional(),
  type: z.enum(['note', 'inspiration', 'blog', 'wechat']),
  title: z.string().min(1),
  summary: z.string().optional(),
  contentMd: z.string(),
  visibility: z.enum(['public', 'private']).default('private'),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImageUrl: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
  tagNames: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  const db = useDB()
  const html = await renderMarkdown(body.contentMd)
  const readingTime = calculateReadingTime(body.contentMd)
  const slug = body.slug || slugify(body.title) || `post-${Date.now()}`

  const inserted = db.insert(contents).values({
    slug,
    type: body.type,
    title: body.title,
    summary: body.summary,
    contentMd: body.contentMd,
    contentHtml: html,
    visibility: body.visibility,
    status: body.status,
    coverImageUrl: body.coverImageUrl,
    readingTime,
    publishedAt: body.status === 'published' ? new Date() : null,
  }).returning().get()

  if (body.tagIds) {
    for (const tagId of body.tagIds) {
      db.insert(contentTags).values({ contentId: inserted.id, tagId }).run()
    }
  }
  if (body.tagNames) {
    for (const name of body.tagNames) {
      let tag = db.select().from(tags).where(eq(tags.name, name)).get()
      if (!tag) {
        tag = db.insert(tags).values({ name, slug: slugify(name) }).returning().get()
      }
      db.insert(contentTags).values({ contentId: inserted.id, tagId: tag.id }).onConflictDoNothing().run()
    }
  }

  return inserted
})
```

- [ ] **步骤 4：实现 server/api/contents/[id].get.ts**

```ts
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents, tags, contentTags } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()
  const row = db.select().from(contents).where(eq(contents.id, id)).get()
  if (!row) throw createError({ statusCode: 404 })
  const ts = db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(contentTags)
    .innerJoin(tags, eq(tags.id, contentTags.tagId))
    .where(eq(contentTags.contentId, id))
    .all()
  return { ...row, tags: ts }
})
```

- [ ] **步骤 5：实现 server/api/contents/[id].patch.ts**

```ts
import { z } from 'h3-zod'
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents, contentTags } from '~/server/utils/schema'
import { renderMarkdown, calculateReadingTime } from '~/server/utils/markdown'

const Body = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  contentMd: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  status: z.enum(['draft', 'published']).optional(),
  coverImageUrl: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, Body.parse)
  const db = useDB()
  const existing = db.select().from(contents).where(eq(contents.id, id)).get()
  if (!existing) throw createError({ statusCode: 404 })

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) updates.title = body.title
  if (body.summary !== undefined) updates.summary = body.summary
  if (body.visibility !== undefined) updates.visibility = body.visibility
  if (body.status !== undefined) {
    updates.status = body.status
    if (body.status === 'published' && !existing.publishedAt) {
      updates.publishedAt = new Date()
    }
  }
  if (body.coverImageUrl !== undefined) updates.coverImageUrl = body.coverImageUrl
  if (body.contentMd !== undefined) {
    updates.contentMd = body.contentMd
    updates.contentHtml = await renderMarkdown(body.contentMd)
    updates.readingTime = calculateReadingTime(body.contentMd)
  }

  const updated = db.update(contents).set(updates).where(eq(contents.id, id)).returning().get()
  if (body.tagIds) {
    db.delete(contentTags).where(eq(contentTags.contentId, id)).run()
    for (const tagId of body.tagIds) {
      db.insert(contentTags).values({ contentId: id, tagId }).run()
    }
  }
  return updated
})
```

- [ ] **步骤 6：实现 server/api/contents/[id].delete.ts**

```ts
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { contents } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  useDB().delete(contents).where(eq(contents.id, id)).run()
  return { ok: true }
})
```

- [ ] **步骤 7：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 8：Commit**

```bash
git add .
git commit -m "feat(content): implement contents CRUD API"
```

---

## 任务 15：tags CRUD API

**文件：**
- 创建：`server/api/tags/index.get.ts` / `index.post.ts` / `[id].delete.ts`

- [ ] **步骤 1：实现 index.get.ts**

```ts
import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'

export default defineEventHandler(() => useDB().select().from(tags).all())
```

- [ ] **步骤 2：实现 index.post.ts**

```ts
import { z } from 'h3-zod'
import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'
import { slugify } from '~/server/utils/markdown'

const Body = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, Body.parse)
  return useDB()
    .insert(tags)
    .values({ name: body.name, slug: slugify(body.name), color: body.color })
    .returning()
    .get()
})
```

- [ ] **步骤 3：实现 [id].delete.ts**

```ts
import { eq } from 'drizzle-orm'
import { useDB } from '~/server/utils/db'
import { tags } from '~/server/utils/schema'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  useDB().delete(tags).where(eq(tags.id, id)).run()
  return { ok: true }
})
```

- [ ] **步骤 4：Commit**

```bash
git add .
git commit -m "feat(tags): implement tags CRUD API"
```

---

## 任务 16：TipTap 编辑器组件

**文件：**
- 创建：`components/content/Editor.vue`
- 安装：`@tiptap/vue-3` `@tiptap/starter-kit` `@tiptap/extension-image` `@tiptap/extension-link`

- [ ] **步骤 1：安装 TipTap**

```bash
pnpm add @tiptap/vue-3@^2.6 @tiptap/starter-kit@^2.6 @tiptap/extension-image@^2.6 @tiptap/extension-link@^2.6
```

- [ ] **步骤 2：写失败组件测试 tests/unit/editor.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Editor from '~/components/content/Editor.vue'

describe('Editor', () => {
  it('emits update:contentMd on change', async () => {
    const wrapper = mount(Editor, { props: { modelValue: '', type: 'blog' } })
    expect(wrapper.find('.ProseMirror').exists()).toBe(true)
  })
})
```

- [ ] **步骤 3：实现 components/content/Editor.vue**

```vue
<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

const props = defineProps<{ modelValue: string; type: 'blog' | 'note' | 'wechat' | 'inspiration' }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4' },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})
</script>

<template>
  <div class="border border-gray-300 rounded">
    <div v-if="editor" class="border-b border-gray-200 p-2 flex gap-1">
      <button type="button" class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()">B</button>
      <button type="button" class="px-2 py-1 text-sm italic hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()">I</button>
      <button type="button" class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()">•</button>
      <button type="button" class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()">{ }</button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
```

- [ ] **步骤 4：跑测试确认绿**

```bash
pnpm test
```

- [ ] **步骤 5：Commit**

```bash
git add .
git commit -m "feat(editor): add tiptap rich text editor component"
```

---

## 任务 17：管理后台布局 + 文章列表/编辑页

**文件：**
- 创建：`layouts/admin.vue` / `pages/admin/index.vue` / `pages/admin/posts/index.vue` / `pages/admin/posts/new.vue` / `pages/admin/posts/[id].vue` / `components/admin/PostList.vue` / `components/admin/PostForm.vue`

- [ ] **步骤 1：实现 layouts/admin.vue**

```vue
<script setup lang="ts">
const { user, fetchMe, logout } = useAuth()
await fetchMe()
if (!user.value) await navigateTo('/login')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold">管理后台</h1>
      <div class="flex items-center gap-4 text-sm">
        <span>{{ user?.username }}</span>
        <button class="text-red-500 hover:underline" @click="logout">登出</button>
      </div>
    </header>
    <div class="flex">
      <nav class="w-48 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4 space-y-1 text-sm">
        <NuxtLink to="/admin" class="block px-3 py-2 rounded hover:bg-gray-100">仪表盘</NuxtLink>
        <NuxtLink to="/admin/posts" class="block px-3 py-2 rounded hover:bg-gray-100">文章管理</NuxtLink>
        <NuxtLink to="/admin/tags" class="block px-3 py-2 rounded hover:bg-gray-100">标签</NuxtLink>
      </nav>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

- [ ] **步骤 2：实现 pages/admin/index.vue**

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: posts } = await useFetch('/api/contents', { credentials: 'include' })
const total = computed(() => posts.value?.length ?? 0)
const published = computed(() => posts.value?.filter((p: any) => p.status === 'published').length ?? 0)
const drafts = computed(() => posts.value?.filter((p: any) => p.status === 'draft').length ?? 0)
</script>

<template>
  <h2 class="text-2xl font-bold mb-6">仪表盘</h2>
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded shadow">
      <div class="text-sm text-gray-500">总文章</div>
      <div class="text-3xl font-bold mt-2">{{ total }}</div>
    </div>
    <div class="bg-white p-4 rounded shadow">
      <div class="text-sm text-gray-500">已发布</div>
      <div class="text-3xl font-bold mt-2 text-green-600">{{ published }}</div>
    </div>
    <div class="bg-white p-4 rounded shadow">
      <div class="text-sm text-gray-500">草稿</div>
      <div class="text-3xl font-bold mt-2 text-yellow-600">{{ drafts }}</div>
    </div>
  </div>
</template>
```

- [ ] **步骤 3：实现 pages/admin/posts/index.vue**

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { data: posts, refresh } = await useFetch<any[]>('/api/contents', { credentials: 'include' })

async function remove(id: number) {
  if (!confirm('确认删除？')) return
  await $fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' })
  await refresh()
}
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-2xl font-bold">文章管理</h2>
    <NuxtLink to="/admin/posts/new" class="px-4 py-2 bg-primary-500 text-white rounded">新建</NuxtLink>
  </div>
  <div class="bg-white rounded shadow overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left p-3">标题</th>
          <th class="text-left p-3">类型</th>
          <th class="text-left p-3">可见性</th>
          <th class="text-left p-3">状态</th>
          <th class="text-left p-3">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in posts" :key="p.id" class="border-t border-gray-100">
          <td class="p-3">{{ p.title }}</td>
          <td class="p-3">{{ p.type }}</td>
          <td class="p-3">{{ p.visibility }}</td>
          <td class="p-3">{{ p.status }}</td>
          <td class="p-3 space-x-2">
            <NuxtLink :to="`/admin/posts/${p.id}`" class="text-primary-500 hover:underline">编辑</NuxtLink>
            <button class="text-red-500 hover:underline" @click="remove(p.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

- [ ] **步骤 4：实现 pages/admin/posts/new.vue**

```vue
<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'
definePageMeta({ layout: 'admin' })
</script>

<template>
  <h2 class="text-2xl font-bold mb-4">新建文章</h2>
  <PostForm />
</template>
```

- [ ] **步骤 5：实现 pages/admin/posts/[id].vue**

```vue
<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { data: post } = await useFetch(`/api/contents/${route.params.id}`, { credentials: 'include' })
</script>

<template>
  <h2 class="text-2xl font-bold mb-4">编辑文章</h2>
  <PostForm v-if="post" :initial="post" :id="Number(route.params.id)" />
</template>
```

- [ ] **步骤 6：实现 components/admin/PostForm.vue**

```vue
<script setup lang="ts">
import Editor from '~/components/content/Editor.vue'

const props = defineProps<{ initial?: any; id?: number }>()

const form = reactive({
  type: props.initial?.type ?? 'blog',
  title: props.initial?.title ?? '',
  summary: props.initial?.summary ?? '',
  contentMd: props.initial?.contentMd ?? '',
  visibility: props.initial?.visibility ?? 'public',
  status: props.initial?.status ?? 'draft',
  tagNamesInput: props.initial?.tags?.map((t: any) => t.name).join(', ') ?? '',
})

const saving = ref(false)
const error = ref('')

function buildPayload() {
  const tagNames = form.tagNamesInput
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return { ...form, tagNames, tagNamesInput: undefined }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (props.id) {
      await $fetch(`/api/contents/${props.id}`, {
        method: 'PATCH', body: buildPayload(), credentials: 'include',
      })
    } else {
      await $fetch('/api/contents', {
        method: 'POST', body: buildPayload(), credentials: 'include',
      })
    }
    await navigateTo('/admin/posts')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || '保存失败'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4 bg-white p-6 rounded shadow" @submit.prevent="save">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">类型</label>
        <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded">
          <option value="blog">博客</option>
          <option value="wechat">公众号</option>
          <option value="note">笔记（私密）</option>
          <option value="inspiration">灵感（私密）</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">可见性</label>
        <select v-model="form.visibility" class="w-full px-3 py-2 border border-gray-300 rounded">
          <option value="public">公开</option>
          <option value="private">私密</option>
        </select>
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">标题</label>
      <Input v-model="form.title" name="title" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">摘要</label>
      <Input v-model="form.summary" name="summary" placeholder="（可选，用于列表和 SEO）" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">标签（逗号分隔）</label>
      <Input v-model="form.tagNamesInput" name="tags" placeholder="技术,生活" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">内容</label>
      <ClientOnly>
        <Editor v-model="form.contentMd" :type="form.type" />
      </ClientOnly>
    </div>
    <div class="flex items-center gap-4">
      <label class="text-sm"><input v-model="form.status" type="radio" value="draft" /> 草稿</label>
      <label class="text-sm"><input v-model="form.status" type="radio" value="published" /> 发布</label>
    </div>
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    <div class="flex gap-2">
      <Button type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</Button>
      <NuxtLink to="/admin/posts" class="px-4 py-2 border border-gray-300 rounded">取消</NuxtLink>
    </div>
  </form>
</template>
```

- [ ] **步骤 7：手动验证**

```bash
pnpm dev
# 浏览器：http://localhost:3000/login → 登录 → /admin/posts → 新建文章
```

- [ ] **步骤 8：Commit**

```bash
git add .
git commit -m "feat(admin): add post list and form pages"
```

---

## 任务 18：公开页面（首页 + 博客列表 + 详情）

**文件：**
- 创建：`pages/index.vue` / `pages/blog/index.vue` / `pages/blog/[slug].vue` / `components/content/ContentCard.vue` / `components/layout/Header.vue` / `components/layout/Footer.vue` / `layouts/default.vue`

- [ ] **步骤 1：实现 layouts/default.vue**

```vue
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
      <slot />
    </main>
    <Footer />
  </div>
</template>
```

- [ ] **步骤 2：实现 components/layout/Header.vue**

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold">{{ config.public.siteName }}</NuxtLink>
      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/blog" class="hover:text-primary-500">博客</NuxtLink>
        <NuxtLink to="/wechat" class="hover:text-primary-500">公众号</NuxtLink>
        <NuxtLink to="/admin" class="hover:text-primary-500">登录</NuxtLink>
      </nav>
    </div>
  </header>
</template>
```

- [ ] **步骤 3：实现 components/layout/Footer.vue**

```vue
<template>
  <footer class="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
    © {{ new Date().getFullYear() }} AI Personal Web
  </footer>
</template>
```

- [ ] **步骤 4：实现 components/content/ContentCard.vue**

```vue
<script setup lang="ts">
defineProps<{ post: any }>()
</script>

<template>
  <article class="bg-white p-6 rounded shadow hover:shadow-md transition">
    <NuxtLink :to="`/${post.type}/${post.slug}`" class="block">
      <h3 class="text-lg font-bold mb-2">{{ post.title }}</h3>
      <p v-if="post.summary" class="text-gray-600 text-sm mb-3">{{ post.summary }}</p>
      <div class="text-xs text-gray-400">
        {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '草稿' }}
        <span v-if="post.readingTime" class="ml-2">· {{ post.readingTime }} 分钟</span>
      </div>
    </NuxtLink>
  </article>
</template>
```

- [ ] **步骤 5：实现 pages/index.vue**

```vue
<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?status=published&visibility=public', {
  default: () => [],
})
const latest = computed(() => posts.value?.slice(0, 6) ?? [])
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">最新文章</h1>
    <div class="grid gap-4">
      <ContentCard v-for="p in latest" :key="p.id" :post="p" />
    </div>
    <div v-if="!latest.length" class="text-gray-500 text-center py-12">还没有文章</div>
  </div>
</template>
```

- [ ] **步骤 6：实现 pages/blog/index.vue**

```vue
<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?type=blog&status=published&visibility=public', {
  default: () => [],
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-6">博客</h1>
  <div class="grid gap-4">
    <ContentCard v-for="p in posts" :key="p.id" :post="p" />
  </div>
  <div v-if="!posts.length" class="text-gray-500 text-center py-12">还没有博客文章</div>
</template>
```

- [ ] **步骤 7：实现 pages/blog/[slug].vue**

```vue
<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents?type=blog&status=published&visibility=public`, {
  transform: (list: any[]) => list.find((p) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <article v-if="post" class="bg-white p-8 rounded shadow">
    <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
    <div class="text-sm text-gray-500 mb-6">
      {{ new Date(post.publishedAt).toLocaleDateString() }}
      <span v-if="post.readingTime" class="ml-2">· {{ post.readingTime }} 分钟阅读</span>
    </div>
    <div class="prose max-w-none" v-html="post.contentHtml" />
  </article>
</template>
```

- [ ] **步骤 8：手动验证**

```bash
pnpm dev
# 浏览器：http://localhost:3000 看到首页和博客列表
```

- [ ] **步骤 9：Commit**

```bash
git add .
git commit -m "feat(public): add home, blog list and detail pages"
```

---

## 任务 19：公开页面（公众号列表 + 详情，结构同博客）

**文件：**
- 创建：`pages/wechat/index.vue` / `pages/wechat/[slug].vue`

- [ ] **步骤 1：实现 pages/wechat/index.vue**

```vue
<script setup lang="ts">
const { data: posts } = await useFetch<any[]>('/api/contents?type=wechat&status=published&visibility=public', {
  default: () => [],
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-6">公众号文章</h1>
  <div class="grid gap-4">
    <ContentCard v-for="p in posts" :key="p.id" :post="p" />
  </div>
  <div v-if="!posts.length" class="text-gray-500 text-center py-12">还没有公众号文章</div>
</template>
```

- [ ] **步骤 2：实现 pages/wechat/[slug].vue**

（与 blog/[slug].vue 几乎一致，类型改为 wechat）

```vue
<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/contents?type=wechat&status=published&visibility=public`, {
  transform: (list: any[]) => list.find((p) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <article v-if="post" class="bg-white p-8 rounded shadow">
    <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
    <div class="text-sm text-gray-500 mb-6">
      {{ new Date(post.publishedAt).toLocaleDateString() }}
      <span v-if="post.readingTime" class="ml-2">· {{ post.readingTime }} 分钟阅读</span>
    </div>
    <div class="prose max-w-none" v-html="post.contentHtml" />
  </article>
</template>
```

- [ ] **步骤 3：Commit**

```bash
git add .
git commit -m "feat(public): add wechat article list and detail"
```

---

## 任务 20：私密页面（笔记 + 灵感，SSR + auth 守卫）

**文件：**
- 创建：`pages/notes/index.vue` / `pages/notes/[slug].vue` / `pages/inspiration/index.vue` / `pages/inspiration/[slug].vue`
- 中间件：`middleware/auth.global.ts`（client-side 守卫私有页面）

- [ ] **步骤 1：实现 middleware/auth.global.ts**

```ts
export default defineNuxtRouteMiddleware(async (to) => {
  const protectedPaths = ['/notes', '/inspiration', '/admin']
  if (!protectedPaths.some((p) => to.path.startsWith(p))) return
  const { user, fetchMe } = useAuth()
  if (!user.value) await fetchMe()
  if (!user.value) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
```

- [ ] **步骤 2：实现 pages/notes/index.vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data: posts } = await useFetch<any[]>('/api/contents?type=note&status=published', {
  default: () => [], credentials: 'include',
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-6">笔记</h1>
  <div class="grid gap-4">
    <ContentCard v-for="p in posts" :key="p.id" :post="p" />
  </div>
  <div v-if="!posts.length" class="text-gray-500 text-center py-12">还没有笔记</div>
</template>
```

- [ ] **步骤 3：实现 pages/notes/[slug].vue**

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const { data: post } = await useFetch(`/api/contents`, {
  query: { type: 'note' }, credentials: 'include',
  transform: (list: any[]) => list.find((p) => p.slug === route.params.slug),
})
if (!post.value) throw createError({ statusCode: 404 })
</script>

<template>
  <article v-if="post" class="bg-white p-8 rounded shadow">
    <h1 class="text-3xl font-bold mb-2">{{ post.title }}</h1>
    <div class="prose max-w-none" v-html="post.contentHtml" />
  </article>
</template>
```

- [ ] **步骤 4：实现 pages/inspiration/index.vue**（同 notes，type 改 inspiration）

- [ ] **步骤 5：实现 pages/inspiration/[slug].vue**（同 notes，type 改 inspiration）

- [ ] **步骤 6：手动验证**

```bash
pnpm dev
# 浏览器未登录访问 http://localhost:3000/notes → 跳 /login
# 登录后访问 → 看到笔记列表
```

- [ ] **步骤 7：Commit**

```bash
git add .
git commit -m "feat(private): add notes and inspiration pages with auth guard"
```

---

## 任务 21：MVP 端到端验证

**目标**：MVP 闭环测试（不写新代码，只验证）

- [ ] **步骤 1：构建并启动**

```bash
pnpm build
pnpm preview
```

- [ ] **步骤 2：浏览器跑通以下流程**

1. 访问 `http://localhost:3000` → 看到首页（无文章时为空）
2. 点击"登录" → 输入 admin/admin123 → 进入管理后台
3. 创建一篇 type=blog, visibility=public, status=published 的文章
4. 返回首页 → 看到新文章卡片
5. 点击文章 → 看到详情页（HTML 渲染）
6. 登出 → 访问 `/admin` → 跳回 login
7. 未登录访问 `/notes` → 跳回 login

- [ ] **步骤 3：跑全部测试**

```bash
pnpm test
pnpm typecheck
pnpm lint
```

预期：全部通过。

- [ ] **步骤 4：Commit（如有修复）**

```bash
git add .
git commit -m "chore: mvp e2e verification"
```

---

# 增强阶段（P7-P13）

> **说明**：按用户要求 "MVP 跑通后再根据情况实施"，P7-P13 此处仅给出**目标、文件清单、关键代码骨架**作为路线图。每个任务在真正开始实施时，会按本计划 P1-P6 的细粒度（TDD：写测试 → 实现 → 验证 → commit）展开为完整的子计划。
>
> **触发条件**：MVP（P1-P6）任务 21 验收通过后，再开始 P7。

## 任务 22（P7）：标签管理后台 + 标签云页 + 搜索 API

**目标**：补全标签 CRUD UI + 按标签筛选的公开页 + FTS5 搜索 API

**文件：**
- 创建：`server/api/search.get.ts` / `server/utils/fts.ts`（query 封装） / `pages/admin/tags.vue` / `pages/tags/[slug].vue` / `pages/search.vue`

**关键代码（搜索 API）**：
```ts
// server/api/search.get.ts
export default defineEventHandler((event) => {
  const q = String(getQuery(event).q || '').trim()
  if (!q) return []
  // P7 详细步骤将展开 jieba 分词集成
  return searchFts(useDB().$client, q)
})
```

- [ ] **开始此任务的信号**：MVP 验证通过；用户明确说"开始做 P7"
- [ ] **建议的第一步**：写 `tests/integration/search.test.ts`（含中文分词测试用例）
- [ ] **范围参考**：见上文 文件 / 关键代码 / jieba-wasm 集成方式

---

## 任务 23（P8）：OSS 图片上传（STS + 直传）

**目标**：浏览器直传 OSS，服务器零中转

**文件：**
- 创建：`server/utils/oss.ts` / `server/api/upload/presign.post.ts` / `server/api/upload/callback.post.ts` / `composables/useUpload.ts`
- 安装：`ali-oss@^4`

**关键代码（STS 工具）**：
```ts
// server/utils/oss.ts
import STS from 'ali-oss/lib/sts'

export async function getUploadStsToken() {
  const sts = new STS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  })
  return sts.assumeRole(process.env.OSS_ROLE_ARN!, undefined, 'web-upload', 3600)
}
```

- [ ] **开始此任务的信号**：用户开通阿里云 OSS + 创建 RAM 角色
- [ ] **建议的第一步**：写 `tests/unit/oss.test.ts`（STS 工具测试 + mock 阿里云 SDK）
- [ ] **范围参考**：见上文 文件 / STS 工具关键代码 / 浏览器直传流程

---

## 任务 24（P9）：.md 文件导入

**目标**：拖拽 .md 文件 → 解析 frontmatter → 提取标签/封面 → 入库

**文件：**
- 创建：`components/content/MarkdownImporter.vue` / `server/utils/md-import.ts` / `server/api/contents/import.post.ts`
- 安装：`gray-matter@^4`

- [ ] **开始此任务的信号**：用户有 .md 历史文章需要导入
- [ ] **建议的第一步**：写 `tests/unit/md-import.test.ts`（frontmatter 解析、标签提取、Hexo/VuePress 兼容）
- [ ] **范围参考**：见上文 文件 / gray-matter 解析流程

---

## 任务 25（P10）：公众号格式导出

**目标**：文章详情页"复制到公众号"按钮 → 生成带 inline-style 的 HTML → 一键复制

**文件：**
- 创建：`server/utils/wechat-export.ts` / `server/api/wechat/export/[id].get.ts` / `components/content/WechatExportButton.vue`

**关键代码（inline-style 化）**：
```ts
// server/utils/wechat-export.ts
// 将 contentHtml 中的所有 CSS class 转为微信兼容的 inline style
// 公众号支持：font-family / color / font-size / line-height / text-align / margin / padding / text-indent
```

- [ ] **开始此任务的信号**：用户发布过至少 1 篇 type=wechat 的文章
- [ ] **建议的第一步**：写 `tests/unit/wechat-export.test.ts`（ProseMirror 输出 → 微信兼容 HTML）
- [ ] **范围参考**：见上文 文件 / inline-style 化的支持属性清单

---

## 任务 26（P11）：阿里云 ECS 部署脚本

**目标**：本地 `pnpm deploy` → SSH 到 ECS → git pull → pnpm install → pnpm build → pm2 restart

**文件：**
- 创建：`deploy.sh` / `ecosystem.config.cjs` / `nginx.conf.example` / `scripts/backup.sh` / `scripts/backup-cron.sh`
- 安装：pm2

**关键脚本**：
```bash
#!/bin/bash
# deploy.sh
ssh ecs "cd /opt/ai_persion_web && \
  git pull origin main && \
  pnpm install --frozen-lockfile && \
  pnpm build && \
  pnpm exec drizzle-kit migrate && \
  pm2 restart ecosystem.config.cjs"
```

```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d-%H%M%S)
sqlite3 /opt/ai_persion_web/data/db.sqlite ".backup '/tmp/db-${DATE}.sqlite'"
oss cp /tmp/db-${DATE}.sqlite oss://${OSS_BUCKET}/backups/db-${DATE}.sqlite
rm /tmp/db-${DATE}.sqlite
# 清理 7 天前的备份
oss rm -r oss://${OSS_BUCKET}/backups/ --include "db-$(date -d '7 days ago' +%Y%m%d)*"
```

- [ ] **开始此任务的信号**：MVP 在本地完整跑通；ECS 已就绪
- [ ] **建议的第一步**：在 ECS 上手动执行 `pnpm build && pnpm preview` 验证可启动
- [ ] **范围参考**：见上文 deploy.sh / backup.sh / nginx.conf.example / ecosystem.config.cjs

---

## 任务 27（P12）：阿里云 CDN + SSL 配置

**目标**：域名解析 → CDN 加速配置 → 阿里云免费 SSL 证书申请 → HTTPS 全站

**文件：**
- 创建：`docs/deployment/cdn-ssl-setup.md`（运维操作手册）

**关键步骤**：
1. 阿里云 SSL 证书控制台申请免费 DV 证书
2. CDN 控制台添加加速域名 → 回源到 ECS 公网 IP
3. 阿里云 DNS 解析：CDN 提供的 CNAME
4. nginx 配置：HTTP 301 → HTTPS

- [ ] **开始此任务的信号**：ECS 上站点已通过 IP 访问
- [ ] **建议的第一步**：阿里云 SSL 控制台申请免费证书（10 分钟内出）
- [ ] **范围参考**：见上文 4 步配置流程

---

## 任务 28（P13）：监控告警

**目标**：进程挂掉自动重启 + 备份失败告警 + 简易健康检查

**文件：**
- 创建：`scripts/healthcheck.sh` / `scripts/alert.sh` / `server/api/health.get.ts`

- [ ] **开始此任务的信号**：P11 + P12 已完成
- [ ] **建议的第一步**：写 `tests/integration/health.test.ts`（健康检查接口测试）
- [ ] **范围参考**：见上文 文件清单

---

# 附录

## A. 关键技术决策记录

| 决策 | 选择 | 替代方案 | 理由 |
|---|---|---|---|
| 框架 | Nuxt 3 | Astro+Vue / VitePress | 你熟悉 Vue；Nuxt 3 SSG+SSR 混合最成熟 |
| ORM | Drizzle | Prisma | Drizzle TS 体验更好、bundle 更小 |
| 数据库 | SQLite (better-sqlite3) | MySQL / libSQL | 单文件、零网络、2G 内存首选 |
| 鉴权 | bcrypt + 服务端 session | JWT | 可主动注销、更安全 |
| 编辑器 | TipTap | Lexical / Quill | Vue 3 原生、ProseMirror 内核 |
| 进程管理 | PM2 | systemd / Docker | PM2 简单 + 内存监控 |

## B. 提交规范

遵循 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `chore:` 杂项（依赖、配置）
- `docs:` 文档
- `test:` 测试
- `refactor:` 重构

## C. 验收清单（最终）

- [ ] `pnpm test` 全部通过
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm lint` 0 errors
- [ ] `pnpm build` 成功
- [ ] `pnpm generate` 公开页面产物可静态部署
- [ ] 本地 E2E 跑通
- [ ] ECS 部署后域名 HTTPS 可访问
- [ ] 图片直传 OSS 成功
- [ ] 备份脚本每日 03:00 跑通
- [ ] 月账单 < 20 元

## D. 后续可扩展功能（YAGNI 不在 MVP）

- 评论系统
- RSS / Atom 订阅
- 站点地图（sitemap.xml）
- 文章目录树（TOC）
- 阅读进度条
- 多用户支持
- PWA / 离线阅读
- 国际化（i18n）
