# 智识花园 (AI Personal Web)

个人网站：笔记 / 灵感 / 博客 / 公众号。Nuxt 3 全栈 + SQLite + 玻璃感设计。

## 技术栈

- **前端**：Nuxt 3 + Vue 3 + TypeScript + UnoCSS + VueUse
- **后端**：Nitro（Nuxt 内置）+ Drizzle ORM + better-sqlite3 + Zod
- **测试**：Vitest + happy-dom + @nuxt/test-utils
- **部署**：阿里云 ECS（Ubuntu 24.04）+ systemd + nginx + Let's Encrypt + GitHub Actions
- **在线**：<https://jbksy.cn>

---

## 快速开始

```bash
# 1. 启用正确 Node 版本（需要 ≥ 22.0）
nvm use

# 2. 安装依赖
pnpm install

# 3. 准备环境变量
cp .env.example .env
# 编辑 .env，至少修改 NUXT_SESSION_SECRET（生成方法：openssl rand -base64 32）

# 4. 启动开发服务器
pnpm dev
# → 访问 http://localhost:3000

# 5. 健康检查
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"...","uptime":...,"version":"0.1.0"}
```

## 常用脚本

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 启动开发服务器（热更新） |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | 运行测试（监听模式） |
| `pnpm test:run` | 运行测试（一次性） |
| `pnpm scrape:ai` | 抓取 tool.lu AI 导航数据，生成 `data/ai-nav.json` |
| `pnpm lint` | ESLint 检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm format` | Prettier 格式化 |

---

## 目录结构（详解）

### 📁 根目录配置文件

| 文件 | 作用 |
|---|---|
| `package.json` | 项目元数据 + 依赖清单 + npm 脚本 |
| `pnpm-lock.yaml` | 锁定的依赖版本（自动生成） |
| `nuxt.config.ts` | Nuxt 主配置（模块、CSS、运行时配置、路由规则） |
| `uno.config.ts` | UnoCSS 配置（预设、主题色、字体） |
| `vitest.config.ts` | Vitest 测试配置 |
| `eslint.config.mjs` | ESLint 配置（flat config 格式） |
| `.prettierrc.json` | Prettier 格式化规则 |
| `tsconfig.json` | TypeScript 配置（继承自 Nuxt 自动生成） |
| `.gitignore` | Git 忽略清单 |
| `.env.example` | 环境变量模板（提交进仓库） |
| `.nvmrc` | 锁定 Node 版本（22.22.2） |
| `LICENSE` | MIT 协议 |
| `README.md` | 本文件 |

### 🎨 前端 (FE) 目录

| 目录/文件 | 作用 | 内容示例 |
|---|---|---|
| `app.vue` | Nuxt 根组件 | 包含 `<NuxtLayout><NuxtPage/></NuxtLayout>` |
| `error.vue` | 全局错误页 | 处理 404、500 等 |
| `pages/` | **路由页面**（文件式路由） | `index.vue` → `/`；`blog/index.vue` → `/blog`；`ai.vue` → `/ai`；`login.vue` → `/login` |
| `components/` | **Vue 组件**（自动导入，带目录前缀） | `AppHeader.vue` → `<AppHeader>`；`ui/Input.vue` → `<UiInput>` |
| `layouts/` | **布局组件** | `default.vue`（默认）、`admin.vue`（后台） |
| `composables/` | **组合式函数**（自动导入，命名以 `use` 开头） | `useAuth.ts`、`useTheme.ts`、`useDrawer.ts`、`useScrollSpy.ts`、`useTagFilter.ts` |
| `assets/css/` | **CSS 资源**（被 Vite 处理） | `tokens.css`、`main.css`、`aurora.css`、`layout.css` |
| `assets/` | **其他资源**（图片、字体、SVG） | 站点 logo、装饰图等 |
| `public/` | **静态资源**（直接复制到构建输出） | `favicon.ico`、`robots.txt` |

> **Nuxt 自动导入机制**：`components/` 嵌套目录会形成组件名前缀（`components/ui/Input.vue` → `<UiInput>`）；`composables/` 平铺即可直接使用。

### 🛠️ 后端 (BE) 目录

| 目录/文件 | 作用 | 内容示例 |
|---|---|---|
| `server/api/` | **API 路由**（文件式） | `health.get.ts` → `GET /api/health`；`contents/index.post.ts` → `POST /api/contents`；`ai-nav.get.ts` → `GET /api/ai-nav` |
| `server/utils/` | **服务端工具**（Nitro 自动导入） | `db.ts`（drizzle 连接）、`schema.ts`、`session.ts`、`password.ts`、`init-admin.ts` |
| `server/plugins/` | **Nitro 插件**（启动时执行） | `00.init-admin.ts`（首次启动创建 admin 账号） |
| `drizzle/` | **数据库迁移文件**（drizzle-kit 生成） | `0000_xxx.sql`、`0001_fts.sql` 等 |

> **API 路由命名规则**：`<路径>/<文件名>.<方法>.ts`，如 `users/[id].get.ts` 对应 `GET /api/users/:id`

### 🔄 跨端/通用目录

| 目录/文件 | 作用 | 内容示例 |
|---|---|---|
| `tests/` | **测试** | Vitest 单测 + 集成测试 |
| `scripts/` | **运维 / 数据脚本** | `scrape-ai-nav.mjs`（抓取 tool.lu AI 导航数据） |
| `data/` | **运行时数据** | `db.sqlite`（gitignored）、`ai-nav.json`（gitignore 例外，随代码提交） |
| `docs/` | **项目文档** | `deployment.md`（部署/运维手册）、`progress.md`（任务进度）、`superpowers/`（设计与计划） |
| `.github/workflows/` | **CI** | `deploy.yml`（push main 自动部署到生产） |

---

## 配置文件详解

### `nuxt.config.ts`（Nuxt 主配置）

- **modules**：注册 Nuxt 模块（UnoCSS、VueUse）
- **css**：全局 CSS 注入（设计令牌 + 主样式）
- **runtimeConfig**：环境变量映射
  - 服务端字段：只在 `server/` 可见
  - `public` 字段：暴露到客户端
- **nitro**：服务端配置（部署目标、存储）
- **routeRules**（任务 1+）：精细控制 SSR/SSG/ISR

### `uno.config.ts`（UnoCSS 配置）

- **presets**：原子化预设
  - `presetUno()`：Tailwind 兼容语法
  - `presetIcons()`：Iconify 图标
  - `presetWebFonts()`：Google Fonts 自托管
- **theme.colors**：主题色（与 tokens.css 同步）
- **shortcuts**：`glass` / `glass-strong`（玻璃拟态）、`gradient-text`（渐变文字）、`container`、`section`、`stack` 等复合工具类

### `vitest.config.ts`（测试配置）

- **environment**：`happy-dom`（轻量 DOM）
- **globals**：启用全局 describe/it/expect
- **include**：`tests/**/*.{test,spec}.ts`
- **coverage**：v8 provider，输出 text + html 报告

### `eslint.config.mjs`（代码检查）

- ESLint 9 flat config 格式
- 基于 `@nuxt/eslint` 的 `withNuxt` + stylistic 规则
- ignores 包含 `prototype/**`、`.nuxt/**`、`.output/**` 等

### `.env.example`（环境变量）

| 变量 | 必填 | 说明 |
|---|---|---|
| `NUXT_SESSION_SECRET` | ✅ | 会话密钥（32 字节随机串，`openssl rand -hex 32`） |
| `NUXT_DB_PATH` | - | SQLite 文件路径（默认 `./data/db.sqlite`，生产为 `/var/lib/jbksy/data/db.sqlite`） |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | - | 首次启动自动创建的管理员账号（默认 `admin` / `admin123`，**生产务必修改**） |
| `NUXT_OSS_*` | - | 阿里云 OSS（未启用，预留） |
| `NUXT_PUBLIC_SITE_NAME` | - | 站点名（默认"智识花园"） |
| `NUXT_PUBLIC_SITE_URL` | - | 站点 URL |
| `NUXT_PUBLIC_AUTHOR_NAME` | - | 作者名 |

---

## 功能特性

| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 | `/` | 站点入口，最新文章列表 |
| 博客 | `/blog`、`/blog/:slug` | 长文 |
| 笔记 | `/notes`、`/notes/:slug` | 短笔记 |
| 灵感 | `/inspiration` | 灵感碎片 |
| AI 导航 | `/ai` | 134 个 AI 工具站点（按分类组织 + 实时搜索） |
| 公众号 | `/wechat` | 文章索引 |
| 登录 | `/login` | 极光玻璃风登录页 |
| 管理后台 | `/admin/*` | 内容 / 标签管理（需登录） |

### AI 导航数据更新

`/ai` 页面数据来自 `data/ai-nav.json`，由本地脚本离线抓取 `tool.lu/nav/?node_id=27`：

```bash
pnpm scrape:ai          # 重新抓取并覆盖 data/ai-nav.json
git add data/ai-nav.json && git commit -m "chore: 更新 AI 导航数据"
git push                # CI 自动部署
```

生产环境**不在线抓取**，避免反爬和外部依赖。

---

## 部署

生产环境部署在阿里云 ECS（`jbksy.cn` / `47.112.105.92`），通过 GitHub Actions + 服务器 `deploy.sh` 实现：

- **自动**：`git push origin main` → CI 触发服务器拉取 + 构建 + 重启 systemd
- **手动兜底**：`ssh aliyun-jbk "/opt/jbksy/deploy.sh"`

完整的部署架构、运维命令、故障排查、SSH 隧道访问数据库、CI/CD 配置等见 **[docs/deployment.md](docs/deployment.md)**。

---

## 文档

- [部署与运维手册](docs/deployment.md) — 架构、命令速查、CI/CD、故障排查
- [设计规格](docs/superpowers/specs/2026-06-17-ai-personal-website-design.md) — 需求、架构、风险、验收标准
- [实现计划](docs/superpowers/plans/2026-06-22-nuxt-mvp-full-plan.md) — 25 MVP 任务 + 7 增强路线图（TDD 步骤）
- [进度追踪](docs/progress.md) — 任务状态 + commit hash + 恢复指南

## License

MIT
