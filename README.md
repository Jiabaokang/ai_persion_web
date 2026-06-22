# 智识花园 (AI Personal Web)

个人网站：笔记 / 灵感 / 博客 / 公众号。Nuxt 3 全栈 + SQLite + 玻璃感设计。

## 技术栈

- **前端**：Nuxt 3 + Vue 3 + TypeScript + UnoCSS + VueUse
- **后端**：Nitro（Nuxt 内置）+ Drizzle ORM + better-sqlite3 + Zod
- **测试**：Vitest + happy-dom + @nuxt/test-utils
- **部署**：阿里云 ECS + 阿里云 OSS + PM2

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
| `pages/` | **路由页面**（文件式路由） | `index.vue` → `/`；`blog/index.vue` → `/blog`；`blog/[slug].vue` → `/blog/xxx` |
| `components/` | **Vue 组件**（自动导入） | `Header.vue`、`Footer.vue`、`Drawer.vue`、`Card.vue` |
| `layouts/` | **布局组件** | `default.vue`（默认）、`admin.vue`（后台）、`auth.vue`（登录） |
| `composables/` | **组合式函数**（自动导入，命名以 `use` 开头） | `useTheme.ts`、`useDrawer.ts`、`useTagFilter.ts` |
| `assets/css/` | **CSS 资源**（被 Vite 处理） | `tokens.css`（设计令牌）、`main.css`（全局样式） |
| `assets/` | **其他资源**（图片、字体、SVG） | 站点 logo、装饰图等 |
| `public/` | **静态资源**（直接复制到构建输出） | `favicon.ico`、`robots.txt`、`sitemap.xml` |

> **Nuxt 自动导入机制**：`components/` 和 `composables/` 下的文件无需手动 `import`，在 `.vue` 中直接使用即可。

### 🛠️ 后端 (BE) 目录

| 目录/文件 | 作用 | 内容示例 |
|---|---|---|
| `server/api/` | **API 路由**（文件式） | `health.get.ts` → `GET /api/health`；`contents/index.post.ts` → `POST /api/contents` |
| `server/db/` | **数据库层** | `schema.ts`（Drizzle 表结构）、`migrations/`（迁移文件）、`index.ts`（连接） |
| `server/utils/` | **服务端工具**（自动导入到所有 server/ 文件） | `auth.ts`（鉴权工具）、`crypto.ts`（哈希） |
| `server/middleware/` | **请求中间件**（每次请求执行） | `auth.ts`（私有路由守卫）、`logger.ts`（请求日志） |
| `server/plugins/` | **Nitro 插件**（启动时执行） | `db-init.ts`（数据库初始化） |

> **API 路由命名规则**：`<路径>/<文件名>.<方法>.ts`，如 `users/[id].get.ts` 对应 `GET /api/users/:id`

### 🔄 跨端/通用目录

| 目录/文件 | 作用 | 内容示例 |
|---|---|---|
| `tests/unit/` | **单元测试** | `composables/useTheme.test.ts`、`server/utils/auth.test.ts` |
| `tests/e2e/` | **端到端测试** | `login.e2e.test.ts`（完整流程） |
| `scripts/` | **运维脚本** | `backup.sh`（数据备份）、`deploy.sh`（部署） |
| `data/` | **运行时数据**（gitignored） | SQLite 数据库文件、上传临时区 |
| `docs/` | **项目文档** | `progress.md`（进度）、`superpowers/specs/`（设计）、`superpowers/plans/`（计划） |
| `prototype/` | **玻璃感 HTML 原型**（参考用） | 设计参考、样式参考；不参与构建 |

### 完整目录树

```
ai_persion_web/
├── app.vue                          # Nuxt 根组件
├── error.vue                        # 全局错误页
├── nuxt.config.ts                   # Nuxt 主配置
├── uno.config.ts                    # UnoCSS 配置
├── vitest.config.ts                 # Vitest 配置
├── eslint.config.mjs                # ESLint 配置
├── .prettierrc.json                 # Prettier 规则
├── tsconfig.json                    # TypeScript 配置
├── package.json                     # 项目元数据
├── .env.example                     # 环境变量模板
├── .gitignore                       # Git 忽略清单
├── .nvmrc                           # Node 版本
├── LICENSE                          # MIT 协议
├── README.md                        # 本文件
│
├── pages/                           # FE: 路由页面
│   └── index.vue                    #  / (首页)
│
├── components/                      # FE: Vue 组件（自动导入）
│   └── .gitkeep
│
├── layouts/                         # FE: 布局
│   └── default.vue                  # 默认布局
│
├── composables/                     # FE: 组合式函数（自动导入）
│   └── .gitkeep
│
├── assets/                          # FE: 资源（Vite 处理）
│   └── css/
│       ├── tokens.css               # 设计令牌
│       └── main.css                 # 全局样式
│
├── public/                          # FE: 静态资源
│   └── .gitkeep
│
├── server/                          # BE: Nitro 服务端
│   ├── api/                         # API 路由
│   │   └── health.get.ts            # GET /api/health
│   ├── db/                          # 数据库层
│   │   └── .gitkeep
│   ├── utils/                       # 服务端工具（自动导入）
│   │   └── .gitkeep
│   └── middleware/                  # 请求中间件
│       └── .gitkeep
│
├── tests/                           # 测试
│   ├── unit/                        # 单元测试
│   │   └── .gitkeep
│   └── e2e/                         # 端到端测试
│       └── .gitkeep
│
├── scripts/                         # 运维脚本
│   └── .gitkeep
│
├── data/                            # 运行时数据（gitignored）
│
├── docs/                            # 项目文档
│   ├── progress.md                  # 任务进度追踪
│   └── superpowers/                 # 设计与计划
│       ├── specs/                   # 设计规格
│       └── plans/                   # 实现计划
│
└── prototype/                       # 玻璃感 HTML 原型（参考）
    ├── index.html
    ├── blog.html
    ├── ...
    └── assets/
        ├── styles.css
        └── app.js
```

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
- **shortcuts**（任务 I0 注入）：`glass`、`gradient-text` 等复合工具类

### `vitest.config.ts`（测试配置）

- **environment**：`happy-dom`（轻量 DOM）
- **globals**：启用全局 describe/it/expect
- **include**：`tests/**/*.{test,spec}.ts`
- **coverage**：v8 provider，输出 text + html 报告

### `eslint.config.mjs`（代码检查）

- ESLint 9 flat config 格式
- 当前为基础版（任务 0），任务 2 升级为含 Vue + TS + Nuxt 规则
- 已声明 Nuxt/Vue/Vitest 等自动导入的全局变量

### `.env.example`（环境变量）

| 变量 | 必填 | 说明 |
|---|---|---|
| `NUXT_SESSION_SECRET` | ✅ | 会话密钥（32 字节 base64） |
| `NUXT_DB_PATH` | - | SQLite 文件路径（默认 `./data/ai-personal.db`） |
| `NUXT_OSS_*` | - | 阿里云 OSS（任务 23 启用） |
| `NUXT_PUBLIC_SITE_NAME` | - | 站点名（默认"智识花园"） |
| `NUXT_PUBLIC_SITE_URL` | - | 站点 URL |
| `NUXT_PUBLIC_AUTHOR_NAME` | - | 作者名 |

---

## 文档

- [设计规格](docs/superpowers/specs/2026-06-17-ai-personal-website-design.md) — 需求、架构、风险、验收标准
- [实现计划](docs/superpowers/plans/2026-06-22-nuxt-mvp-full-plan.md) — 25 MVP 任务 + 7 增强路线图（TDD 步骤）
- [进度追踪](docs/progress.md) — 任务状态 + commit hash + 恢复指南

## License

MIT
