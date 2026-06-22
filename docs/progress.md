# 任务进度追踪

> 每完成一个任务追加一行。Commit hash 用于回溯。Token 紧张时，这是恢复会话的唯一依据。

## 格式

```
| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
```

状态：`✅ 完成` / `🔄 进行中` / `⏸ 暂停` / `❌ 跳过`

## Commit 规范（2026-06-22 定）

- **类型前缀**保持英文：`feat` / `fix` / `docs` / `chore` / `refactor` / `test` / `style` / `perf` / `ci` / `build`
- **冒号后描述**用中文
- 例：`feat: 添加登录页面` / `fix: 修复 SQLite 连接泄漏` / `chore: 升级 pnpm 到 10.x`
- 原因：conventional-commits 工具链（commitlint、release-please、semantic-release）均按英文类型识别

## 任务清单（25 MVP + 7 增强）

### 阶段 0 - 脚手架

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| 0 | 项目初始化 | ✅ | `22486c7` (6 commits) | 2026-06-22 | 见下"任务 0 详情" |
| 1 | Nuxt 3 + TS 脚手架 | ✅ | `5bdfbfb` | 2026-06-22 | 与任务 0 合并实现 |
| 2 | UnoCSS + Lint 工具链 | ✅ | `5bdfbfb` | 2026-06-22 | @nuxt/eslint + UnoCSS shortcuts |
| 3 | Vitest 测试框架 | ✅ | `5bdfbfb` | 2026-06-22 | 配置 + 3 个示例测试文件 |

### 任务 0 详情（6 个子 commit）

```
40d0646 chore: 添加项目根级配置（gitignore/env/prettier/license/nvmrc）
29bb15d chore: 添加构建工具链配置（nuxt/uno/vitest/eslint/tsconfig）
f44a9ef chore: 添加项目依赖（package.json + pnpm-lock.yaml）
18d3dff feat: 添加 Nuxt 应用骨架（app/error/page/layout/api）
3aa5ba6 feat: 创建前后端目录结构占位（含 .gitkeep）
22486c7 docs: 添加 README 和任务进度追踪
```

**关键产物**：
- `.gitignore` / `.env.example` / `.nvmrc` / `LICENSE` / `.prettierrc.json`
- `nuxt.config.ts` / `uno.config.ts` / `vitest.config.ts` / `eslint.config.mjs` / `tsconfig.json`
- `package.json`（Nuxt 3 + UnoCSS + VueUse + Vitest + ESLint）
- `app.vue` / `error.vue` / `pages/index.vue` / `layouts/default.vue`
- `server/api/health.get.ts`（健康检查接口）
- `assets/css/tokens.css` / `assets/css/main.css`（设计令牌 + 全局样式）
- 9 个空目录（含 `.gitkeep`）：components / composables / public / scripts / server/{db,utils,middleware} / tests/{unit,e2e}
- `README.md` / `docs/progress.md`

**验证**：`pnpm exec nuxt prepare` 通过，`.nuxt/` 已生成。`pnpm dev` 未运行（避免占端口）。

### 任务 1/2/3 详情（3 子 commit）

```
5bdfbfb chore: 任务 1/2/3 收尾（ESLint 升级 + Vitest 拆分 + 示例测试）
```

**关键产物**：
- `nuxt.config.ts`：注册 `@nuxt/eslint` 模块 + 启用 stylistic
- `eslint.config.mjs`：用 `withNuxt` + ignores（`prototype/**` 等）
- `vitest.config.ts`：改用纯 `vitest/config`（避免 @nuxt/test-utils/config 兼容问题）
- `package.json`：新增 `unocss` 直接依赖（用于 createGenerator 测试）
- `.nuxtrc`：自动生成
- `server/utils/health.ts`：纯函数，便于单测
- `server/api/health.get.ts`：薄包装，调用 utils
- `tests/unit/server/health.test.ts`：4 个测试
- `tests/unit/css/tokens.test.ts`：3 组测试
- `tests/unit/config/shortcuts.test.ts`：UnoCSS shortcuts 生成测试

**验证**：`pnpm test:run` 25/25 通过，`pnpm lint` 0 错误。

### 阶段 1 - 原型迁移

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| I0 | 设计令牌迁移 | ✅ | `92e1476` + `edacc8e` | 2026-06-22 | 见下"I0 详情" |
| I1 | 公共布局迁移 | ⏸ | - | - | Header/Footer/Drawer → 6 组件 |
| I2 | 公共 composables | ⏸ | - | - | theme/filter/drawer/scrollSpy |

### 任务 I0 详情

```
92e1476 feat(I0): 设计令牌迁移（CSS 变量 + UnoCSS shortcuts + 极光背景）
edacc8e test(I0): 补全设计令牌和极光背景的断言
```

**关键产物**：
- `assets/css/tokens.css` 扩展：完整颜色 / 玻璃 / 极光 / 圆角 / 动效 / 浅色主题覆盖
- `assets/css/aurora.css`：极光背景动画（keyframes + 移动端简化 + prefers-reduced-motion）
- `nuxt.config.ts`：注册 `aurora.css` 到全局 CSS
- `uno.config.ts` shortcuts：
  - `glass` / `glass-strong`（玻璃拟态卡片）
  - `gradient-text`（渐变文字）
  - `container`（响应式容器）
  - `section`（章节垂直内边距）
  - `stack` / `stack-lg` / `stack-xl`（垂直堆叠）
- `tests/unit/css/aurora.test.ts`：6 个测试

**验证**：`pnpm test:run` 39/39 通过（13 个 shortcuts 测试 + 18 个 tokens 测试 + 4 个 health 测试 + 6 个 aurora 测试）。`pnpm lint` 0 错误。

### 阶段 1 - Nuxt 基础

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| 1 | Nuxt 3 + TS 脚手架 | ⏸ | - | - | 与任务 0 合并实施 |
| 2 | UnoCSS + Lint 工具链 | ⏸ | - | - | 基础版已含，I0 扩展 |
| 3 | Vitest 测试框架 | ⏸ | - | - | 配置文件已写入 |

### 阶段 2 - 原型迁移

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| I0 | 设计令牌迁移 | ⏸ | - | - | CSS vars → UnoCSS preset shortcuts |
| I1 | 公共布局迁移 | ⏸ | - | - | Header/Footer/Drawer → 6 组件 |
| I2 | 公共 composables | ⏸ | - | - | theme/filter/drawer/scrollSpy |

### 阶段 3 - 数据层

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| 4 | Drizzle ORM + better-sqlite3 | ⏸ | - | - | |
| 5 | users 表 schema + 迁移 | ⏸ | - | - | |
| 6 | contents / tags / assets / sessions | ⏸ | - | - | |
| 7 | FTS5 虚表 + 触发器 | ⏸ | - | - | |

### 阶段 4 - 鉴权层

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| 8 | bcrypt + session token | ⏸ | - | - | |
| 9 | 登录失败计数器 | ⏸ | - | - | |
| 10 | 登录/登出/me API | ⏸ | - | - | |
| 11 | auth 中间件 | ⏸ | - | - | |

### 阶段 5 - 业务功能

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| 12 | login 页面 | ⏸ | - | - | 依赖 10 |
| 13 | Markdown 工具 | ⏸ | - | - | |
| 14 | contents CRUD API | ⏸ | - | - | |
| 15 | tags CRUD API | ⏸ | - | - | |
| 16 | TipTap 编辑器 | ⏸ | - | - | 依赖 14 |
| 17 | 管理后台 | ⏸ | - | - | 依赖 12/14/15 |
| 18 | 公开页面 | ⏸ | - | - | 依赖 14，可 mock |
| 19 | 公众号页面 | ⏸ | - | - | 依赖 14，可 mock |
| 20 | 私密页面 | ⏸ | - | - | 依赖 11 |
| 21 | MVP 端到端验证 | ⏸ | - | - | |

### 阶段 6 - 增强路线图

| 任务 | 名称 | 状态 | Commit | 完成时间 | 备注 |
|---|---|---|---|---|---|
| P7 | 性能优化 | ⏸ | - | - | |
| P8 | OSS + CDN | ⏸ | - | - | |
| P9 | 监控 + 备份 | ⏸ | - | - | |
| P10 | 公众号导出 | ⏸ | - | - | |
| P11 | RSS / Sitemap | ⏸ | - | - | |
| P12 | PWA | ⏸ | - | - | |
| P13 | 国际化 | ⏸ | - | - | |

## 恢复指南（下次开会话用）

1. **查本文件**：看哪些任务已 `✅ 完成`，停在哪个 `🔄 进行中` / `⏸ 暂停`。
2. **查 git log**：`git log --oneline -20` 找到最新 commit。
3. **查计划文件**：`docs/superpowers/plans/2026-06-22-nuxt-mvp-full-plan.md` 找到当前任务的 TDD 步骤。
4. **环境验证**：`node -v && pnpm -v` 必须 ≥ 22.10 / 10.33；`pnpm install` 后跑 `pnpm dev` 确认可启动。
5. **恢复锚点**（如果用户贴了之前会话的 summary）：先读 summary，再读本文件，再决定下一步。
