# AI 编程指南集成设计规格

**日期**：2026-06-27

**状态**：已通过用户确认（含数据存储调整）

**适用范围**：在「智识花园」Nuxt 3 站点内站内全文展示 GitHub 仓库 `Jiabaokang/ai-coding-guide` 的 92 篇 AI 编程中文教程（Claude Code 53 篇 + Codex 39 篇）。

## 1. 目标

将外部仓库的 92 篇 Markdown 教程以**站内全文、自包含、无外链跳转**的方式集成进智识花园，作为「编程指南」频道，沿用站点既有玻璃/极光视觉语言。内容来源为 `stormzhang/ai-coding-guide`（MIT，本仓库为其 fork），站内渲染全文，不在阅读过程中跳转外部站点。

guide 文章数据**入库**（SQLite，Drizzle 管理），与现有 `contents` 表物理隔离；ai-nav 维持 JSON 静态文件不变。本规格不改动现有博客、笔记、AI 导航、公众号频道与后台逻辑。

## 2. 范围

| 维度 | 决定 |
| --- | --- |
| 内容来源 | GitHub 仓库 `Jiabaokang/ai-coding-guide`（`claude-code/` 与 `codex/` 两个目录） |
| 拉取方式 | 本地脚本经 GitHub Tree API 发现文件 + `raw.githubusercontent.com` 拉取 Markdown 原文 |
| 渲染时机 | 脚本侧离线渲染为 HTML（含代码高亮、标题锚点、TOC、阅读时长），产物写入 SQLite |
| 存储形态 | 数据库新建 `guide_articles` 表 + `guide_fts` 全文索引（Drizzle 迁移管理），与 `contents` 表物理隔离，不污染现有博客/笔记 |
| 分类粒度 | 两段：`claude-code`（53 篇）、`codex`（39 篇），均按文件名编号顺序排列，不臆造二级分类 |
| 阅读体验 | 站内全文渲染，`v-html` 注入，`.prose` 排版 + 暗色代码高亮 + 右侧 TOC 滚动联动 |
| 外链 | 频道落地页底部以小字署名「内容来源 stormzhang/ai-coding-guide (MIT)」；文章正文内不提供外部阅读链接 |
| ai-nav 处理 | 维持 `data/ai-nav.json` 静态文件（异构只读导航数据，不入库） |

## 3. 设计原则

1. **统一数据层**：guide 文章入 SQLite（Drizzle 管理），新建 `guide_articles` 表 + `guide_fts` 全文索引；前端交互复刻 `pages/ai.vue`（列表/侧栏/搜索）与 `pages/blog/[slug].vue`（`v-html` + `.prose`）。ai-nav 因属异构只读导航数据，保留 JSON 静态文件，避免过度工程。
2. **物理隔离**：不复用 `contents` 表。guide 有 `order`/`toc` 等 `contents` 不具备的字段，复用会导致加空列污染 blog/note，并引发首页 latest 混入、slug 全局唯一约束等连锁问题。新建独立表字段贴合、零侵入。
3. **零客户端渲染运行时**：Markdown 到 HTML 的转换与代码高亮在脚本侧完成，客户端只做 `v-html` 注入，避免引入 `@nuxt/content` 或客户端解析器。
4. **解耦 git**：通过 GitHub API 发现文件而非 git submodule，源仓库新增或改名文章无需改代码即可被脚本自动发现。
5. **沿用视觉语言**：使用 `glass` / `glass-strong` / `gradient-text` shortcuts、aurora 背景、设计令牌；代码高亮采用贴近极光配色的暗色主题（`atom-one-dark` 系），浅色主题下保证可读。
6. **SSG 友好**：`/guide/**` 路由通过 `routeRules` 预渲染，生成静态 HTML。

## 4. 数据契约

### 4.1 数据库表结构

新增 `guide_articles` 表（`server/utils/schema.ts`）：

```ts
export const guideArticles = sqliteTable('guide_articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section', { enum: ['claude-code', 'codex'] }).notNull(),
  slug: text('slug').notNull(),              // Markdown 文件名去 .md
  order: integer('order').notNull(),          // 段内编号，从 1 起
  title: text('title').notNull(),
  summary: text('summary'),
  contentHtml: text('content_html').notNull(),
  readingTime: integer('reading_time').notNull(),
  toc: text('toc', { mode: 'json' }).notNull(), // JSON 数组：[{id,text,level}]
  source: text('source').notNull(),           // raw.githubusercontent.com 原文 URL
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (t) => ({
  // 段内 slug 唯一（两段允许同名 slug，各自命名空间隔离）
  unq: uniqueIndex('guide_articles_section_slug_unq').on(t.section, t.slug),
}))
```

新增 `guide_fts` 虚拟表（FTS5，索引 `title` + `content_md` 原文，便于正文全文搜索），由 Drizzle 迁移 + `syncGuideFts()` 维护，模式参照现有 `contents_fts` / `server/utils/fts.ts`。

字段约定：

- `slug`：取自 Markdown 文件名（去 `.md`），段内唯一（两段命名空间隔离）。
- `order`：按文件名前缀数字解析；无数字前缀则按文件名字典序，序号从 1 起。
- `title`：取自 Markdown 首个一级标题 `# `；缺失则用文件名人类化文本。
- `summary`：取 frontmatter `description` 或正文首段纯文本前 120 字。
- `readingTime`：按正文中文约 400 字/分钟、英文约 200 词/分钟估算，取整分钟，最小 1。
- `toc`：收集 `h2`/`h3`（level 2/3），`id` 由 `markdown-it-anchor` 生成（slugified），JSON 序列化存储。
- `contentHtml`：渲染后的完整正文 HTML，已应用代码高亮与标题锚点。
- `source`：原文 raw URL，用于溯源。

### 4.2 API 契约

| 接口 | 方法 | 返回 | 说明 |
| --- | --- | --- | --- |
| `/api/guide` | GET | 瘦 manifest：`{ source, fetchedAt, totalArticles, sections:[{ id, title, count, articles:[{ slug, order, title, summary, readingTime }] }] }` | 查 `guide_articles` 表，剥离 `contentHtml` 与 `toc`，供索引页轻量加载 |
| `/api/guide/[section]/[slug]` | GET | `{ section, slug, order, title, summary, readingTime, toc, contentHtml, prev, next }` | 按 `section` + `slug` 查表；找不到返回 404（`throw createError`） |

`prev` / `next` 为同段内相邻 `order` 的 `{ slug, title }`，到段边界时为 `null`。

`fetchedAt` 取 `guide_articles` 表 `updatedAt` 的最大值（代表最近一次抓取时间）。

API 层经 Drizzle 查询，数据库本身是 better-sqlite3 同步连接，无需额外模块级缓存（与 `contents` 现有访问模式一致）。

## 5. 路由与页面

| 路由 | 页面文件 | 作用 |
| --- | --- | --- |
| `/guide` | `pages/guide/index.vue` | 频道落地页：hero 标题 + 两张段卡片（Claude Code 53 / Codex 39）+ 全局搜索（跨两段过滤标题/摘要，复刻 `ai.vue` 搜索交互） |
| `/guide/claude-code` | `pages/guide/[section].vue` | 段索引页：sticky 分类侧栏 + 编号文章列表（标题/摘要/阅读时长），复刻 `ai.vue` 侧栏与卡片网格；`section` 仅接受 `claude-code` / `codex`，非法值返回 404 |
| `/guide/codex` | 同上 | 同上 |
| `/guide/claude-code/01-what-is-claude-code` | `pages/guide/[section]/[slug].vue` | 阅读页：标题与元信息、`v-html` 渲染正文、右侧 TOC（`useScrollSpy`）、上一篇/下一篇、返回段索引入口 |

导航接入：在 `components/AppHeader.vue` 增加导航项「编程指南」指向 `/guide`；`components/AppNavLink.vue` 的 `page` 联合类型扩展 `'guide'`。移动端抽屉菜单同步加入该项。

## 6. 组件与样式

### 6.1 复用

- `glass` / `glass-strong` / `gradient-text` shortcuts、aurora 背景、`container` / `section` 工具类。
- `useScrollSpy` 组合式函数，用于阅读页 TOC 当前章节高亮。
- `pages/ai.vue` 的搜索框、sticky 侧栏、`IntersectionObserver` 分组高亮模式，迁移到段索引页与落地页。
- `pages/blog/[slug].vue` 的 `v-html` + `.prose` 阅读结构。
- `throw createError({ statusCode: 404 })` 的缺失内容处理。
- `server/utils/db.ts` 的 `useDB()` 连接、`server/utils/fts.ts` 的 FTS sync/search 模式。

### 6.2 新增

- `assets/css/guide-prose.css`：为 `.prose` 补充文章排版与代码高亮样式，仅 `/guide/**` 引入。
  - 代码块：`highlight.js` 暗色主题（`atom-one-dark` 系配色，与极光 cyan/purple 协调），等宽字体 `--font-mono`，横向溢出可滚动。
  - 行内 `code`、`blockquote`、`table`、`a`、`img` 的玻璃描边与圆角处理。
  - 标题层级字号与留白，呼应参考站的暗色终端风但保留玻璃/极光语言。
  - 浅色主题覆盖（`[data-theme='light']`）确保代码块与正文可读。

### 6.3 依赖

以下作为 **devDependencies**，仅脚本侧使用，不进入客户端 bundle：

- `markdown-it`：Markdown 渲染。
- `markdown-it-anchor`：标题生成稳定 `id`，供 TOC 绑定。
- `highlight.js`：代码高亮（脚本侧调用，生成带类名的 HTML；主题 CSS 在客户端按类名着色）。

`highlight.js` 主题 CSS 经 Nuxt CSS 引入（可放 `assets/` 或按需），仅 `/guide/**` 页面加载。

## 7. 拉取脚本

**文件**：`scripts/fetch-ai-coding-guide.mjs`（纯 Node ESM，无运行时外部依赖，与 `scrape-ai-nav.mjs` 一致）。

**流程**：

1. 调用 GitHub Tree API `GET /repos/Jiabaokang/ai-coding-guide/git/trees/main?recursive=1`，筛选 `claude-code/*.md` 与 `codex/*.md`。
2. 对每个文件，从 `raw.githubusercontent.com/Jiabaokang/ai-coding-guide/main/<path>` 拉取原文。
3. 解析 frontmatter（如有）、首个一级标题、首段摘要；用 `markdown-it` + `highlight.js` + `markdown-it-anchor` 渲染 HTML，收集 TOC，估算阅读时长。
4. 连接本地 SQLite（`better-sqlite3`），对 `guide_articles` 表按 `(section, slug)` upsert，更新 `updatedAt`；删除表中已不存在于远端的记录（保持与源仓库同步）。
5. 调用 `syncGuideFts()` 重建 `guide_fts` 索引。
6. 打印汇总（段数、篇数、新增/更新/删除计数）。

**npm 脚本**：`package.json` 增加 `"fetch:guide": "node scripts/fetch-ai-coding-guide.mjs"`。

**前置条件**：首次运行前需执行 Drizzle 迁移创建 `guide_articles` + `guide_fts` 表。生成迁移：`pnpm db:generate`（即 `drizzle-kit generate`）；应用迁移：`pnpm db:migrate`（即 `drizzle-kit migrate`），生产环境需带 `NUXT_DB_PATH`（见 `docs/deployment.md:155` 现有约定）。

**更新流程**：

```bash
pnpm db:generate          # schema.ts 变更后生成迁移文件到 drizzle/
pnpm db:migrate           # 应用迁移（创建/更新表）；生产带 NUXT_DB_PATH
pnpm fetch:guide          # 拉取 92 篇 → 渲染 → upsert guide_articles → 重建 guide_fts
git add server/utils/schema.ts drizzle/
git commit -m "chore: 更新 AI 编程指南数据"
git push                  # CI 自动部署；生产部署后需跑一次 db:migrate + fetch:guide 灌数据
```

## 8. 异常与边界状态

- **GitHub 限流**：Tree API 未授权 60 次/小时；脚本仅调用 1 次该接口，`raw.githubusercontent.com` 不计入 API 限流。失败时脚本打印明确错误并退出非零码。
- **数据库迁移**：首次部署或 schema 变更需执行 `pnpm db:generate` 生成迁移 + `pnpm db:migrate` 应用；生产环境数据库不随代码提交（`data/db.sqlite` 被 gitignore），部署流程需包含 `db:migrate` + `fetch:guide` 步骤（沿用 `docs/deployment.md:155` 现有 `drizzle-kit migrate` 约定）。
- **文章缺失**：`/api/guide/[section]/[slug]` 找不到对应文章时返回 404，阅读页由 Nuxt `error.vue` 处理。
- **非法 section**：段索引页 `/guide/[section]` 与 `/api/guide/[section]/[slug]` 仅接受 `claude-code` / `codex`，其余值返回 404。
- **段或文章为空**：索引页展示空状态提示「暂无文章，请运行 `pnpm fetch:guide` 更新数据」。
- **远端删除同步**：脚本对比表中已有与本次拉取的 `(section, slug)`，删除远端已不存在的记录，保持 DB 与源仓库一致。
- **代码高亮浅色模式**：`guide-prose.css` 提供 `[data-theme='light']` 覆盖，确保代码块与正文对比度达标。
- **版权署名**：频道落地页底部固定显示「内容来源 stormzhang/ai-coding-guide (MIT)」，不构成阅读外链。
- **`prefers-reduced-motion`**：关闭 TOC 平滑滚动与卡片悬浮动画。
- **长标题**：阅读页主标题允许换行，不截断；索引卡片标题用省略号截断。

## 9. 验收标准

### 9.1 数据与迁移

- `guide_articles` 与 `guide_fts` 表经 Drizzle 迁移成功创建。
- `pnpm fetch:guide` 成功将 92 篇文章 upsert 入 `guide_articles` 表，含 2 个 section（`claude-code` 53 篇、`codex` 39 篇）。
- 每篇记录具备 `slug` / `order` / `title` / `summary` / `contentHtml` / `readingTime` / `toc` / `source` 字段，无空 `contentHtml`。
- `claude-code` 段 `order` 从 1 至 53 连续，`codex` 段从 1 至 39 连续。
- `guide_fts` 索引重建成功，可对文章标题与正文做全文搜索。

### 9.2 API

- `GET /api/guide` 返回瘦 manifest，响应不含 `contentHtml` 与 `toc` 字段。
- `GET /api/guide/claude-code/01-what-is-claude-code` 返回完整文章，含 `prev`/`next`。
- 不存在的 section 或 slug 返回 HTTP 404。

### 9.3 页面

- `/guide`、`/guide/claude-code`、`/guide/codex`、`/guide/claude-code/<slug>`、`/guide/codex/<slug>` 均可访问。
- 三档视口（375 / 768 / 1440 px）下无非预期横向滚动、遮挡或不可达操作。
- 阅读页正文经 `v-html` 渲染，代码块带语法高亮，标题有锚点。
- 阅读页右侧 TOC（桌面）/ 抽屉 TOC（移动）随滚动高亮当前章节。
- 阅读页上一篇/下一篇在段内正确联动，段边界处为空。
- 落地页与段索引页搜索框可按标题/摘要过滤，空结果有提示。
- 顶部导航与移动端抽屉菜单包含「编程指南」项并正确高亮。

### 9.4 视觉与质量

- 复用 `glass` / `glass-strong` / `gradient-text` / aurora 设计语言，与 `/ai` 等页面观感一致。
- 代码高亮暗色主题与极光配色协调；浅色主题下可读。
- `prefers-reduced-motion: reduce` 时关闭平滑滚动与悬浮动画。
- `pnpm typecheck`、`pnpm lint`、`pnpm test:run` 全部通过。
- 控制台无运行时错误。

### 9.5 部署

- `/guide/**` 经 `routeRules` 预渲染为静态 HTML。
- 数据更新流程（`pnpm db:migrate` + `pnpm fetch:guide` → commit schema/迁移 → push）可重复执行。
- 生产部署文档补充 `fetch:guide` 灌数据步骤。

## 10. 文件清单

新增：

- `scripts/fetch-ai-coding-guide.mjs`
- `server/api/guide/index.get.ts`
- `server/api/guide/[section]/[slug].get.ts`
- `server/utils/guide-fts.ts`（`guide_fts` 的 sync/search，参照 `fts.ts`）
- `pages/guide/index.vue`
- `pages/guide/[section].vue`
- `pages/guide/[section]/[slug].vue`
- `assets/css/guide-prose.css`
- `drizzle/000X_<name>.sql`（Drizzle 生成的迁移：建 `guide_articles` + `guide_fts`）

改动：

- `server/utils/schema.ts`：新增 `guideArticles` 表定义与 `GuideArticle` 类型导出。
- `components/AppHeader.vue`：增加「编程指南」导航项。
- `components/AppNavLink.vue`：`page` 联合类型扩展 `'guide'`。
- `package.json`：增加 `"fetch:guide"`、`"db:generate": "drizzle-kit generate"`、`"db:migrate": "drizzle-kit migrate"` 脚本与三个 devDependencies（`markdown-it`、`markdown-it-anchor`、`highlight.js`）。
- `nuxt.config.ts`：`routeRules` 增加 `/guide/**` 预渲染规则。
- `docs/deployment.md`：补充生产部署 `db:migrate` + `fetch:guide` 步骤。

不含：

- 修改现有博客、笔记、公众号频道与后台逻辑。
- 修改 `contents` 表结构或现有 `contents_fts`。
- 修改 ai-nav 数据形态（仍为 JSON 静态文件）。
- 引入 `@nuxt/content` 或客户端 Markdown 解析器。

## 11. 实施顺序

1. 数据库层：`schema.ts` 新增 `guide_articles` 表 + 类型；生成 Drizzle 迁移（建表 + `guide_fts`）；实现 `server/utils/guide-fts.ts`（sync/search，参照 `fts.ts`）。
2. 拉取脚本：实现 `fetch-ai-coding-guide.mjs`，渲染 HTML 并 upsert `guide_articles` + 重建 `guide_fts`（含单元测试：解析单篇 Markdown，断言 `contentHtml`/`toc`/`readingTime`）。
3. API 层：实现 `/api/guide` 与 `/api/guide/[section]/[slug]`，含 404 与 prev/next（含单元测试）。
4. 段索引页 `/guide/[section]`：复刻 `ai.vue` 侧栏 + 卡片网格 + 搜索。
5. 阅读页 `/guide/[section]/[slug]`：`v-html` + `.prose` + TOC scrollspy + 上一篇/下一篇。
6. 落地页 `/guide` + 导航接入 + `guide-prose.css` + 代码高亮主题 + `routeRules` SSG + 部署文档。
7. 全量验证：`pnpm typecheck && pnpm lint && pnpm test:run`，三档视口逐页检查。
