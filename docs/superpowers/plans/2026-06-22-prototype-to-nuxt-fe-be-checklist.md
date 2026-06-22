# 玻璃感原型 → Nuxt + UnoCSS 全栈对接清单

> **范围**：将 `prototype/` 下 6 个静态 HTML 页面迁入 Nuxt 3 全栈项目，按 2026-06-17 计划 P1-P6 完成 MVP。
> **视角**：按 **前端 / 后端 / 跨端** 三列重组任务，便于分工与并行。
> **详细 TDD 步骤**：见 `2026-06-17-ai-personal-website-plan.md`（每任务 4-6 个 commit 步骤 + 完整测试代码 + 验证命令）。

---

## 0. 总览：22 任务分桶

| # | 任务 | 归属 | 预估 | 依赖 |
|---|---|---|---|---|
| 0 | 项目初始化 | 跨端 | 0.5h | — |
| 1 | Nuxt 3 + TS 脚手架 | 前端 | 1h | 0 |
| 2 | UnoCSS + Lint | 前端 | 1h | 1 |
| 3 | Vitest 测试框架 | 跨端 | 1h | 1 |
| **I0** | **设计令牌迁移（prototype → UnoCSS preset）** | **前端** | **2h** | **2** |
| **I1** | **公共布局迁移（Header/Footer/Drawer → Vue 组件）** | **前端** | **3h** | **I0** |
| **I2** | **公共逻辑拆分（theme/filter/drawer → composables）** | **前端** | **2h** | **I1** |
| 4 | Drizzle ORM + better-sqlite3 | 后端 | 1h | 1 |
| 5 | users 表 schema + 迁移 | 后端 | 1h | 4 |
| 6 | contents/tags/.../sessions 表 | 后端 | 2h | 5 |
| 7 | FTS5 虚表 + 触发器 | 后端 | 1.5h | 6 |
| 8 | bcrypt + session token 工具 | 后端 | 1h | 6 |
| 9 | 登录失败计数器（防爆破） | 后端 | 1h | 8 |
| 10 | 登录/登出/me API | 后端 | 2h | 8,9 |
| 11 | auth 中间件（私有路由守卫） | 后端 | 1.5h | 10 |
| 12 | login 页面 | 前端 | 2h | 10, I2 |
| 13 | Markdown 工具（unified + remark + rehype） | 后端 | 1.5h | 6 |
| 14 | contents CRUD API | 后端 | 3h | 13 |
| 15 | tags CRUD API | 后端 | 1.5h | 14 |
| 16 | TipTap 编辑器组件 | 前端 | 3h | 14 |
| 17 | 管理后台布局 + 文章列表/编辑页 | 前端 | 4h | 12,16,15 |
| 18 | 公开页面（首页 + 博客列表/详情） | 前端 | 3h | 14, I2 |
| 19 | 公众号页面（结构同博客） | 前端 | 1.5h | 18 |
| 20 | 私密页面（笔记/灵感，SSR + auth 守卫） | 前端 | 2h | 11,18 |
| 21 | MVP 端到端验证 | 跨端 | 2h | 17,20 |

**新增 I0-I2 任务**（06-17 计划没有）专门处理 prototype → Nuxt 的设计/布局/逻辑迁移。

**总计**：~42h（不含增强 P7-P13），单人 5-7 天，并行 2 人 3 天。

---

## 1. 前端任务（11 项，按依赖顺序）

### 阶段 A：基础设施（1-3 + I0-I2）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **1. Nuxt 3 + TS 脚手架** | `nuxt.config.ts` 含 `routeRules`（公开页 SSG、私密 SSR、后台 SSR） | `pnpm dev` 空白页 200 |
| **2. UnoCSS + Lint** | `uno.config.ts` + 玻璃/极光自定义 preset | `pnpm lint` 0 error |
| **3. Vitest** | `vitest.config.ts` + Vue Test Utils + happy-dom | `pnpm test` 跑通 1 个示例 |
| **I0. 设计令牌迁移** | `assets/css/tokens.css`（CSS vars）+ UnoCSS preset 把 prototype 的 `--bg-base / --glass / --gradient-aurora / --accent-cyan/purple/pink` 全部映射成 UnoCSS 主题 | 视觉与 prototype 像素级一致 |
| **I1. 公共布局迁移** | `components/layout/Header.vue` `Footer.vue` `Drawer.vue` `NavLink.vue`（含 mobile/tablet/desktop 响应式） | 6 页共用同一 Header，主题切换、移动端抽屉、路由 active 状态都 work |
| **I2. 公共 composables** | `composables/useTheme.ts` `useDrawer.ts` `useTagFilter.ts` `useScrollSpy.ts` | 从 prototype 的 `app.js` 拆分，类型化 + 可测试 |

### 阶段 B：登录（12）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **12. login 页面** | `pages/login.vue`（玻璃卡 + 表单 + 错误状态） | 错密码 5 次锁定；成功后跳首页 |

### 阶段 C：编辑后台（16-17）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **16. TipTap 编辑器** | `components/content/Editor.vue`（StarterKit + 图片 + 表格 + 代码块） | 输入保存后 Markdown 正确 |
| **17. 管理后台** | `pages/admin/index.vue` `pages/admin/posts/index.vue` `pages/admin/posts/new.vue` `pages/admin/posts/[id].vue` `pages/admin/tags.vue` | 完整写一篇博客并发布 |

### 阶段 D：公开与私密渲染（18-20）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **18. 公开页（首页/博客）** | `pages/index.vue` `pages/blog/index.vue` `pages/blog/[slug].vue` + `components/content/ContentCard.vue` | `pnpm generate` 产物可静态部署 |
| **19. 公众号页** | `pages/wechat/index.vue` `pages/wechat/[slug].vue` | 路由规则 SSG，内容同博客结构 |
| **20. 私密页（笔记/灵感）** | `pages/notes/index.vue` `pages/notes/[slug].vue` `pages/inspiration/index.vue` `pages/inspiration/[slug].vue` | 未登录 302 `/login`；已登录 SSR 渲染 |

---

## 2. 后端任务（10 项，4-15）

### 阶段 A：数据层（4-7）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **4. Drizzle + better-sqlite3** | `server/utils/db.ts`（WAL 模式 + 单例）+ `drizzle.config.ts` | `pnpm drizzle-kit push` 成功 |
| **5. users 表** | `server/db/schema/users.ts` + 首次迁移 | 表存在，索引齐全 |
| **6. 业务表** | contents / tags / content_tags / assets / sessions | 外键 + 索引全建好 |
| **7. FTS5 + 触发器** | `contents_fts` 虚表 + ai/ad/au 触发器 | 插入/更新/删除自动同步 FTS |

### 阶段 B：鉴权层（8-11）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **8. 工具函数** | `server/utils/auth.ts`（bcrypt + crypto random session token） | 单元测试覆盖 |
| **9. 失败计数器** | `server/utils/login-throttle.ts`（内存 Map，5 次锁 30 分钟） | 单测覆盖边界 |
| **10. 鉴权 API** | `server/api/auth/login.post.ts` `logout.post.ts` `me.get.ts` | curl 全流程通过 |
| **11. auth 中间件** | `server/middleware/auth.ts`（白名单：/login, /api/auth/*；其余需 session） | 未登录请求私密 API 返回 401 |

### 阶段 C：内容层（13-15）

| 任务 | 关键产物 | 验收 |
|---|---|---|
| **13. Markdown 工具** | `server/utils/markdown.ts`（unified + remark-parse + remark-gfm + rehype-stringify） | 输入标准 md 输出标准 html |
| **14. contents CRUD** | `server/api/contents/index.{get,post}.ts` `server/api/contents/[id].{get,put,delete}.ts` | 完整 CRUD + 标签同步 + FTS 同步 |
| **15. tags CRUD** | `server/api/tags/index.{get,post}.ts` `server/api/tags/[id].{get,put,delete}.ts` | 标签重命名时 content_tags 同步 |

---

## 3. 跨端集成任务（3 项，0/3/21）

| 任务 | 内容 | 验收 |
|---|---|---|
| **0. 项目初始化** | `package.json` `.gitignore` `pnpm-workspace.yaml` `README.md` `commitlint.config.js` `.husky/` | 提交一次空 commit 验证 hook |
| **3. Vitest** | 共享测试基础设施（FE 用 happy-dom、BE 用 node） | 跑通 1 个 FE 组件测试 + 1 个 BE 工具测试 |
| **21. E2E 验证** | 用 curl + 浏览器手动跑通：登录 → 写文章 → 公开访问 → 私密访问 → 登出 | 全部检查项 PASS（见 06-17 计划附录 C） |

---

## 4. 与现有 prototype 的映射

| Prototype 文件 | Nuxt 目标 | 工作量 |
|---|---|---|
| `prototype/index.html` | `pages/index.vue` + 引用 Hero/ArticleList/AuthorFile 组件 | 大部分 HTML 直接搬 |
| `prototype/blog.html` | `pages/blog/index.vue` + ContentCard + useTagFilter composable | 替换纯 JS 筛选为 composable |
| `prototype/blog-post.html` | `pages/blog/[slug].vue` + Markdown 渲染（v-html 安全） | 正文从硬编码改用 `content.content_html` |
| `prototype/notes.html` | `pages/notes/index.vue`（同 blog，复用组件 + 加私密提示） | 改 + 加 auth 检查 |
| `prototype/note-post.html` | `pages/notes/[slug].vue`（同 blog-post + TOC + 私密操作栏） | 改 + 加重定向保护 |
| `prototype/login.html` | `pages/login.vue`（接 `useAuth` composable） | 改 + 接真实 API |
| `prototype/assets/styles.css` | `assets/css/tokens.css` + `uno.config.ts` preset | 重构为 UnoCSS 主题 + tokens |
| `prototype/assets/app.js` | `composables/*.ts` 拆分 | 拆为 4-5 个 composable，类型化 |

---

## 5. 建议执行顺序（甘特视角）

```
                Day 1        Day 2        Day 3        Day 4        Day 5
FE  ──[1,2]──[3, I0]──[I1, I2]────────────────[12]──────[16,17]──────[18,19,20]
BE  ──────────[4]──[5,6]──[7]────[8,9,10,11]────────────[13,14,15]──────────────
E2E ───────────────────────────────────────────────────────────────[21]──
                └─ single dev sequential
                └─ two devs: FE in row 1, BE in row 2, sync at I2+10 → 12, 14+16 → 17
```

**关键同步点**：
- 任务 12（login FE）需等任务 10（login BE）完成
- 任务 17（admin FE）需等任务 14-15（CRUD BE）完成
- 任务 18（公开 FE）可与任务 13-15 并行（先用静态数据，最后接 API）

---

## 6. 验收标准（MVP 完结时）

按 06-17 计划第 11 节 10 条标准，新增 3 条 prototype 迁移项：

- [ ] 6 个页面视觉与 prototype 像素级一致（深色玻璃 + 极光 + 响应式）
- [ ] 设计令牌全部走 UnoCSS theme（无散落的 hex 颜色）
- [ ] 公共逻辑全部走 composables（页面内无 `<script setup>` 之外的交互 JS）
- [ ] `pnpm test` 全部通过（含 1 个组件测试 + 1 个 server util 测试 + 1 个 E2E）
- [ ] `pnpm typecheck` 0 error
- [ ] `pnpm lint` 0 error
- [ ] `pnpm build` + `pnpm generate` 成功，公开页可静态部署
- [ ] 本地起服务，登录 → 写博客 → 发布 → 公开访问 → 私密访问 全部跑通

---

## 7. 风险与待办

- **UnoCSS 与 prototype 的 glassmorphism 兼容性**：UnoCSS 默认不渲染 `backdrop-filter` shorthand，需要在 preset 显式提供 `glass` 工具类
- **极光背景的 SSR 渲染**：`@keyframes` 在 SSR 期间不执行，需要 `client-only` 包裹或 hydration 后启动
- **TipTap 体积**：需要确认是否只引 `StarterKit` 子集，避免 ~200KB
- **FTS5 + jieba**：在任务 7 仅做 schema 和触发器，jieba 集成放在 P7（增强阶段）
- **资金约束**：本轮不接 OSS（任务 23 在 P8），图片先用 `/public/uploads/` 本地存储

---

**下一步**：确认清单无误后，进入 **任务 0 + 任务 1 + 任务 2**（并行执行；约 2.5h），完成后即可并行启动 FE/BE 两条线。
