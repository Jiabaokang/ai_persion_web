# 个人网站设计文档

**作者**：通过头脑风暴与用户共同完成
**日期**：2026-06-17
**状态**：已通过用户确认

## 1. 目标与背景

在阿里云 ECS（2 核 2G 40G）上部署一个个人网站，用于：

- 公开：博客、公众号文章
- 私密：笔记、灵感记录
- 单用户站点，仅作者本人管理

技术栈约束：TypeScript + Vue 3（用户熟练）。

## 2. 核心需求

| 维度       | 决策                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 受众       | 公开 + 私密混合                                                                     |
| 内容类型   | 笔记（私密）、灵感（私密）、博客（公开）、公众号（公开）                            |
| 创作方式   | Web 富文本编辑（TipTap）+ .md 文件导入                                              |
| 公众号联动 | 网站 → 公众号格式导出（生成 inline-style HTML 一键复制）                            |
| 鉴权       | 单用户 + 密码（bcrypt + httpOnly cookie）                                           |
| 文件存储   | 图片上传到阿里云 OSS（直传，不经过 ECS）                                            |
| 渲染策略   | 混合渲染：公开页面 SSG，私密/后台 SSR                                                |
| 全文搜索   | SQLite FTS5 + jieba-wasm 中文分词                                                   |
| 标签       | 多对多多标签                                                                        |
| CDN/SSL    | 阿里云 CDN + 阿里云免费 DV SSL                                                      |
| 域名       | 已有（已 ICP 备案）                                                                 |
| 数据库     | 本地 SQLite（不采用云数据库）                                                       |

## 3. 架构

### 3.1 整体架构图

```
[用户浏览器]
    ↓
[阿里云 CDN]  ← 缓存公开页面/图片/JS/CSS
    ↓
[阿里云 SSL 证书]
    ↓
[nginx (反代 :80/:443)]
    ↓
[Nuxt 3 Node 进程 (PM2 守护, :3000)]
    ↓
[SQLite 文件 (/data/db.sqlite, WAL 模式)]
    ↓
[阿里云 OSS]  ← 图片/附件存储
```

### 3.2 技术栈

| 层         | 选型                                       |
| ---------- | ------------------------------------------ |
| 框架       | Nuxt 3 (Vue 3 + TypeScript)                |
| ORM        | Drizzle ORM                                |
| 数据库     | SQLite (better-sqlite3)                    |
| 全文搜索   | SQLite FTS5 + jieba-wasm                   |
| 鉴权       | bcrypt + httpOnly Cookie + 服务端 session |
| 富文本编辑器 | TipTap (ProseMirror 内核)                |
| Markdown 解析 | unified + remark + rehype               |
| 样式       | UnoCSS                                     |
| 对象存储   | 阿里云 OSS SDK + STS 临时凭证              |
| 进程管理   | PM2                                        |
| 反向代理   | nginx                                      |
| CDN/SSL    | 阿里云 CDN + 阿里云免费 DV SSL             |

### 3.3 渲染路由规则

```ts
// nuxt.config.ts
routeRules: {
  '/':              { prerender: true },  // SSG
  '/blog/**':       { prerender: true },  // SSG
  '/wechat/**':     { prerender: true },  // SSG
  '/tags/**':       { prerender: true },  // SSG
  '/search':        { ssr: true },        // SSR
  '/notes/**':      { ssr: true },        // SSR + auth
  '/inspiration/**':{ ssr: true },        // SSR + auth
  '/admin/**':      { ssr: true },        // SSR + auth
  '/api/**':        { cors: false },
  '/login':         { ssr: true },
}
```

## 4. 数据模型

### 4.1 表结构

```sql
-- 用户
users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
)

-- 内容（统一表）
contents (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('note','inspiration','blog','wechat')),
  title TEXT NOT NULL,
  summary TEXT,
  content_md TEXT NOT NULL,        -- 原始 Markdown
  content_html TEXT NOT NULL,       -- 渲染后的 HTML
  visibility TEXT NOT NULL CHECK(visibility IN ('public','private')),
  status TEXT NOT NULL CHECK(status IN ('draft','published')),
  cover_image_url TEXT,
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)

-- 标签
tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL
)

-- 内容-标签多对多
content_tags (
  content_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY(content_id, tag_id),
  FOREIGN KEY(content_id) REFERENCES contents(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
)

-- FTS5 虚表
CREATE VIRTUAL TABLE contents_fts USING fts5(
  title, content_md,
  content='contents', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

-- FTS 同步触发器
CREATE TRIGGER contents_ai AFTER INSERT ON contents BEGIN
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;
CREATE TRIGGER contents_ad AFTER DELETE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
END;
CREATE TRIGGER contents_au AFTER UPDATE ON contents BEGIN
  INSERT INTO contents_fts(contents_fts, rowid, title, content_md) VALUES('delete', old.id, old.title, old.content_md);
  INSERT INTO contents_fts(rowid, title, content_md) VALUES (new.id, new.title, new.content_md);
END;

-- 资源（图片元数据，文件本身在 OSS）
assets (
  id INTEGER PRIMARY KEY,
  content_id INTEGER,
  oss_key TEXT NOT NULL,
  oss_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  original_filename TEXT,
  uploaded_at INTEGER NOT NULL,
  FOREIGN KEY(content_id) REFERENCES contents(id) ON DELETE SET NULL
)

-- 会话
sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### 4.2 索引

```sql
CREATE INDEX idx_contents_slug         ON contents(slug);
CREATE INDEX idx_contents_type         ON contents(type);
CREATE INDEX idx_contents_visibility   ON contents(visibility);
CREATE INDEX idx_contents_status       ON contents(status);
CREATE INDEX idx_contents_published_at ON contents(published_at DESC);
CREATE INDEX idx_content_tags_tag      ON content_tags(tag_id);
CREATE INDEX idx_sessions_expires      ON sessions(expires_at);
```

## 5. 目录结构

```
ai_persion_web/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── docs/superpowers/specs/        # 设计文档与计划
├── data/                          # SQLite 文件（gitignore）
├── server/
│   ├── api/                       # 所有后端接口
│   │   ├── auth/                  # login / logout / me
│   │   ├── contents/              # 内容 CRUD
│   │   ├── tags/                  # 标签 CRUD
│   │   ├── search.get.ts          # FTS5 搜索
│   │   ├── upload/                # OSS presign + callback
│   │   └── wechat/                # 公众号格式导出
│   ├── middleware/auth.ts         # 私有路由守卫
│   ├── utils/                     # db / oss / fts / markdown / jwt
│   └── plugins/00.db-init.ts      # 启动建表 + FTS 触发器
├── pages/
│   ├── index.vue
│   ├── blog/        { index, [slug] }.vue   # SSG
│   ├── wechat/      { index, [slug] }.vue   # SSG
│   ├── tags/[slug].vue                       # SSG
│   ├── search.vue                            # SSR
│   ├── notes/       { index, [slug] }.vue   # SSR + auth
│   ├── inspiration/ { index, [slug] }.vue   # SSR + auth
│   ├── admin/                                # SSR + auth
│   │   ├── index.vue
│   │   ├── posts/    { index, new, [id] }.vue
│   │   ├── tags.vue
│   │   └── wechat-export.vue
│   └── login.vue
├── components/
│   ├── content/      Editor / MarkdownImporter / ContentCard
│   ├── layout/       Header / Footer / Sidebar
│   └── ui/
├── composables/      useAuth / useUpload / useSearch
├── shared/types/     前后端共享类型
├── assets/
└── public/
```

## 6. 关键数据流

### 6.1 写文章 → 发布

```
Web 编辑器 / .md 导入
  → POST /api/contents (入库 contents + content_tags)
  → FTS5 触发器自动同步 contents_fts
  → 调用 nitro hook 失效对应 SSG 路由缓存
  → 返回 200
```

### 6.2 公开访问

```
浏览器 → CDN（HIT）→ 直接返回预渲染 HTML（不走 Node）
```

### 6.3 私密访问

```
浏览器 → nginx → Nuxt SSR
  → server middleware 检查 cookie
  → 未登录 → 302 /login
  → 已登录 → 渲染页面
```

### 6.4 图片上传（直传 OSS，服务器零中转）

```
浏览器 → POST /api/upload/presign（获取 STS）
  → 浏览器直传 OSS（不经过 ECS）
  → POST /api/upload/callback（记录到 assets）
```

## 7. 风险与缓解

| 风险                  | 等级 | 缓解措施                                                          |
| --------------------- | ---- | ----------------------------------------------------------------- |
| 内存 OOM              | 🔴 高 | Node `--max-old-space-size=512`；PM2 `max_memory_restart=600M`；CDN 兜底 90% 静态请求 |
| SQLite 损坏           | 🟡 中 | 启用 WAL + `PRAGMA synchronous=NORMAL`；每天 `sqlite3 .backup`    |
| 数据全丢              | 🔴 高 | 每天 cron 备份 SQLite 到 OSS，保留 7 天滚动 + 月度归档           |
| 备份失败无感知        | 🟡 中 | 备份脚本带校验 + 失败时钉钉/邮件告警                              |
| 公网 SSH 被扫         | 🟡 中 | 改 SSH 端口 + 密钥登录 + fail2ban                                |
| 管理后台被爆破        | 🟡 中 | bcrypt + 失败 5 次锁定 30 分钟                                    |
| OSS AccessKey 泄露    | 🟡 中 | 使用 STS 临时凭证，前端不持久化 AK                                |
| 公众号格式丢失        | 🟡 中 | TipTap 自定义 schema + 导出时 inline-style 化                     |
| FTS5 中文不准         | 🟢 低 | jieba-wasm 自定义 tokenizer                                        |
| CDN 回源被刷          | 🟡 中 | 合理 `Cache-Control` + 防盗链 Referer                            |

## 8. 部署架构

```
公网用户
  │
  ├──→ 阿里云 CDN（缓存静态/图片）──→ ECS (nginx:80/443)
  │                                          │
  │                                          ├──→ Nuxt Node (PM2, :3000)
  │                                          │       │
  │                                          │       ├──→ SQLite (/data/db.sqlite)
  │                                          │       └──→ 阿里云 OSS（图片）
  │                                          │
  │                                          └──→ cron: 03:00 备份 SQLite → OSS
  │
  └──→ 钉钉/邮件告警通道
```

## 9. 实施阶段（13 个）

| #   | 阶段                                                                     | 验证标准                                                |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| P1  | 脚手架（Nuxt 3 + TS + UnoCSS + Drizzle + Lint）                          | `npm run dev` 启动空白页                                |
| P2  | 数据层（schema + 迁移 + 种子 + FTS5 触发器）                             | `drizzle-kit push` 成功                                 |
| P3  | 鉴权（login/logout/me + bcrypt + session + 中间件）                      | 错误密码 5 次锁定                                       |
| P4  | 内容 CRUD（后台 + TipTap 编辑器）                                        | 完整写一篇博客并发布                                    |
| P5  | 公开页面 SSG（/blog /wechat 预渲染）                                     | `npm run generate` 产物可静态部署                       |
| P6  | 私密页面 SSR（/notes /inspiration + auth 守卫）                          | 未登录访问 /notes 跳 login                              |
| P7  | 标签 + 搜索（标签 CRUD + FTS5 + jieba）                                 | 搜索"技术"命中相关笔记                                  |
| P8  | 图片上传（OSS STS + 直传 + assets 记录）                                 | 上传图片在笔记里正确显示                                |
| P9  | Markdown 导入（.md 拖拽解析 frontmatter/标签/封面）                      | 导入 Hexo 文章能正确入库                                |
| P10 | 公众号导出（生成 inline-style HTML 一键复制）                           | 粘贴到微信编辑器效果与站内一致                          |
| P11 | 部署脚本（PM2 + nginx + 备份 cron + 健康检查）                          | ECS 上能访问首页                                        |
| P12 | CDN/SSL（CDN 配置 + SSL 证书 + DNS 解析）                                | 域名 HTTPS 访问 + 静态命中 CDN                          |
| P13 | 监控告警（备份失败告警 + 进程异常自愈 + 健康检查）                      | kill Node 后 30s 内自动恢复                             |

### MVP 切片

**MVP 范围**：P1 - P6，跑通核心闭环（建站 + 鉴权 + 公开/私密页面渲染）。

**增强阶段**：P7 - P13，在 MVP 跑通后再做。

## 10. 成本估算

| 项目                       | 月费用      |
| -------------------------- | ----------- |
| ECS (2核 2G 40G)           | 已有        |
| 阿里云 OSS (40G + 流量)    | ~5-10 元    |
| 阿里云 CDN (10G 内)        | ~5 元       |
| 阿里云 SSL (DV 免费)       | 0 元        |
| 域名                       | 已有        |
| **合计**                   | **~10-15 元/月** |

## 11. 验收标准

- [ ] 本地 `npm run dev` 可启动，访问 `http://localhost:3000` 看到首页
- [ ] 登录后能创建、编辑、删除、发布文章
- [ ] 公开文章 `/blog/<slug>` 命中 SSG 缓存（CDN 部署后命中率 > 80%）
- [ ] 私密文章 `/notes/<slug>` 未登录 302 到 `/login`
- [ ] 全文搜索"关键词"能命中对应文章
- [ ] 图片上传后在 OSS 中可见，笔记中显示正确
- [ ] 公众号导出按钮复制的 HTML 粘贴到微信编辑器效果正常
- [ ] ECS 上 `pm2 status` 显示在线，`curl https://你的域名/` 返回 200
- [ ] 手动 `rm /data/db.sqlite` 后能从 OSS 备份恢复
- [ ] 每月账单 < 20 元
