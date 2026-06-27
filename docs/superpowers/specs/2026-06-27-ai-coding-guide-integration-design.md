# AI 编程指南集成设计规格

**日期**：2026-06-27

**状态**：已通过用户确认

**适用范围**：在「智识花园」Nuxt 3 站点内站内全文展示 GitHub 仓库 `Jiabaokang/ai-coding-guide` 的 92 篇 AI 编程中文教程（Claude Code 53 篇 + Codex 39 篇）。

## 1. 目标

将外部仓库的 92 篇 Markdown 教程以**站内全文、自包含、无外链跳转**的方式集成进智识花园，作为「编程指南」频道，沿用站点既有玻璃/极光视觉语言。内容来源为 `stormzhang/ai-coding-guide`（MIT，本仓库为其 fork），站内渲染全文，不在阅读过程中跳转外部站点。

本规格不改动现有博客、笔记、AI 导航、公众号频道与后台逻辑，仅新增 `/guide/**` 频道及配套数据管线。

## 2. 范围

| 维度 | 决定 |
| --- | --- |
| 内容来源 | GitHub 仓库 `Jiabaokang/ai-coding-guide`（`claude-code/` 与 `codex/` 两个目录） |
| 拉取方式 | 本地脚本经 GitHub Tree API 发现文件 + `raw.githubusercontent.com` 拉取 Markdown 原文 |
| 渲染时机 | 脚本侧离线渲染为 HTML（含代码高亮、标题锚点、TOC、阅读时长），产物为单个 JSON |
| 存储形态 | `data/ai-coding-guide.json`，随代码 commit，生产环境直接读静态 JSON |
| 分类粒度 | 两段：`claude-code`（53 篇）、`codex`（39 篇），均按文件名编号顺序排列，不臆造二级分类 |
| 阅读体验 | 站内全文渲染，`v-html` 注入，`.prose` 排版 + 暗色代码高亮 + 右侧 TOC 滚动联动 |
| 外链 | 频道落地页底部以小字署名「内容来源 stormzhang/ai-coding-guide (MIT)」；文章正文内不提供外部阅读链接 |

## 3. 设计原则

1. **复用既有模式**：数据管线复刻 `scripts/scrape-ai-nav.mjs` + `data/ai-nav.json` + `server/api/ai-nav.get.ts`；列表/侧栏/搜索交互复刻 `pages/ai.vue`；阅读页 `v-html` + `.prose` 复刻 `pages/blog/[slug].vue`。
2. **零客户端渲染运行时**：Markdown 到 HTML 的转换与代码高亮在脚本侧完成，客户端只做 `v-html` 注入，避免引入 `@nuxt/content` 或客户端解析器。
3. **解耦 git**：通过 GitHub API 发现文件而非 git submodule，源仓库新增或改名文章无需改代码即可被脚本自动发现。
4. **沿用视觉语言**：使用 `glass` / `glass-strong` / `gradient-text` shortcuts、aurora 背景、设计令牌；代码高亮采用贴近极光配色的暗色主题（`atom-one-dark` 系），浅色主题下保证可读。
5. **SSG 友好**：`/guide/**` 路由通过 `routeRules` 预渲染，生成静态 HTML。

## 4. 数据契约

### 4.1 拉取脚本产物：`data/ai-coding-guide.json`

```jsonc
{
  "source": "https://github.com/Jiabaokang/ai-coding-guide",
  "fetchedAt": "2026-06-27T00:00:00.000Z",
  "totalArticles": 92,
  "sections": [
    {
      "id": "claude-code",
      "title": "Claude Code 篇",
      "count": 53,
      "articles": [
        {
          "slug": "01-what-is-claude-code",
          "order": 1,
          "title": "Claude Code 简介",
          "summary": "从 Markdown 首个段落或 frontmatter 提取的一句话摘要",
          "readingTime": 6,
          "toc": [
            { "id": "anchor-id", "text": "二级标题文本", "level": 2 }
          ],
          "html": "<h2 id=\"anchor-id\">...</h2>..."
        }
      ]
    },
    {
      "id": "codex",
      "title": "Codex 篇",
      "count": 39,
      "articles": [ /* 同结构 */ ]
    }
  ]
}
```

字段约定：

- `slug`：取自 Markdown 文件名（去 `.md` 扩展名），作为 URL 段与缓存键，保持稳定。
- `order`：按文件名前缀数字解析；无数字前缀则按文件名字典序，序号从 1 起。
- `title`：取自 Markdown 首个一级标题 `# `；缺失则用文件名人类化文本。
- `summary`：取 frontmatter `description` 或正文首段纯文本前 120 字。
- `readingTime`：按正文中文约 400 字/分钟、英文约 200 词/分钟估算，取整分钟，最小 1。
- `toc`：收集 `h2`/`h3`（level 2/3），`id` 由 `markdown-it-anchor` 生成（slugified），供阅读页 scrollspy 绑定。
- `html`：渲染后的完整正文 HTML，已应用代码高亮与标题锚点。

### 4.2 API 契约

| 接口 | 方法 | 返回 | 说明 |
| --- | --- | --- | --- |
| `/api/guide` | GET | 瘦 manifest：`{ source, fetchedAt, totalArticles, sections:[{ id, title, count, articles:[{ slug, order, title, summary, readingTime }] }] }` | 剥离 `html` 与 `toc`，供索引页轻量加载 |
| `/api/guide/[section]/[slug]` | GET | `{ section, slug, order, title, summary, readingTime, toc, html, prev, next }` | 找不到时返回 404（`throw createError`） |

`prev` / `next` 为同段内相邻文章的 `{ slug, title }`，到段边界时为 `null`。

服务端读取 JSON 后做模块级缓存，避免每次请求重读约 MB 级文件。

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
4. 按段（`claude-code` / `codex`）与 `order` 排序，组装 manifest。
5. 写入 `data/ai-coding-guide.json`，打印汇总（段数、篇数、输出路径）。

**npm 脚本**：`package.json` 增加 `"fetch:guide": "node scripts/fetch-ai-coding-guide.mjs"`。

**更新流程**：

```bash
pnpm fetch:guide          # 重新拉取并渲染，覆盖 data/ai-coding-guide.json
git add data/ai-coding-guide.json
git commit -m "chore: 更新 AI 编程指南数据"
git push                  # CI 自动部署，与 ai-nav 数据更新一致
```

## 8. 异常与边界状态

- **GitHub 限流**：Tree API 未授权 60 次/小时；脚本仅调用 1 次该接口，`raw.githubusercontent.com` 不计入 API 限流。失败时脚本打印明确错误并退出非零码。
- **JSON 体积**：预计 2–4 MB，commit 可接受；服务端模块级缓存读取，单次进程内不重复读盘。
- **文章缺失**：`/api/guide/[section]/[slug]` 找不到对应文章时返回 404，阅读页由 Nuxt `error.vue` 处理。
- **非法 section**：段索引页 `/guide/[section]` 与 `/api/guide/[section]/[slug]` 仅接受 `claude-code` / `codex`，其余值返回 404。
- **段或文章为空**：索引页展示空状态提示「暂无文章，请运行 `pnpm fetch:guide` 更新数据」。
- **代码高亮浅色模式**：`guide-prose.css` 提供 `[data-theme='light']` 覆盖，确保代码块与正文对比度达标。
- **版权署名**：频道落地页底部固定显示「内容来源 stormzhang/ai-coding-guide (MIT)」，不构成阅读外链。
- **`prefers-reduced-motion`**：关闭 TOC 平滑滚动与卡片悬浮动画。
- **长标题**：阅读页主标题允许换行，不截断；索引卡片标题用省略号截断。

## 9. 验收标准

### 9.1 数据

- `pnpm fetch:guide` 成功生成 `data/ai-coding-guide.json`，含 2 个 section、共 92 篇 article。
- 每篇 article 具备 `slug` / `order` / `title` / `summary` / `readingTime` / `toc` / `html` 七个字段，无空 `html`。
- `claude-code` 段 `order` 从 1 至 53 连续，`codex` 段从 1 至 39 连续。

### 9.2 API

- `GET /api/guide` 返回瘦 manifest，响应不含 `html` 与 `toc` 字段。
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
- 数据更新流程（`pnpm fetch:guide` → commit → push）可重复执行，CI 自动部署生效。

## 10. 文件清单

新增：

- `scripts/fetch-ai-coding-guide.mjs`
- `data/ai-coding-guide.json`（产物，committed）
- `server/api/guide/index.get.ts`
- `server/api/guide/[section]/[slug].get.ts`
- `pages/guide/index.vue`
- `pages/guide/[section].vue`
- `pages/guide/[section]/[slug].vue`
- `assets/css/guide-prose.css`

改动：

- `components/AppHeader.vue`：增加「编程指南」导航项。
- `components/AppNavLink.vue`：`page` 联合类型扩展 `'guide'`。
- `package.json`：增加 `"fetch:guide"` 脚本与三个 devDependencies。
- `nuxt.config.ts`：`routeRules` 增加 `/guide/**` 预渲染规则。

不含：

- 修改现有博客、笔记、AI 导航、公众号频道与后台逻辑。
- 引入 `@nuxt/content` 或客户端 Markdown 解析器。
- 数据库 schema 变更或新表。

## 11. 实施顺序

1. 拉取脚本与数据契约：实现 `fetch-ai-coding-guide.mjs`，生成并校验 `data/ai-coding-guide.json`（含单元测试：解析单篇 Markdown，断言 `html`/`toc`/`readingTime`）。
2. API 层：实现 `/api/guide` 与 `/api/guide/[section]/[slug]`，含 404 处理与模块级缓存（含单元测试）。
3. 段索引页 `/guide/[section]`：复刻 `ai.vue` 侧栏 + 卡片网格 + 搜索。
4. 阅读页 `/guide/[section]/[slug]`：`v-html` + `.prose` + TOC scrollspy + 上一篇/下一篇。
5. 落地页 `/guide` + 导航接入 + `guide-prose.css` + 代码高亮主题 + `routeRules` SSG。
6. 全量验证：`pnpm typecheck && pnpm lint && pnpm test:run`，三档视口逐页检查。
