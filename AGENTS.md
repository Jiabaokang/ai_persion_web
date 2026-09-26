# 项目协作规则

## 开发环境

- 使用 `.nvmrc` 指定的 Node 22.22.2，包管理器使用 pnpm 10。
- 安装后依次运行 `pnpm typecheck`、`pnpm lint`、`pnpm test:run` 和 `pnpm build`。
- SQLite 路径由 `NUXT_DB_PATH` 控制；首次运行前先执行 Drizzle 迁移。

## 设计边界

- 当前公共页设计基线是 2026-09-21 选定的第三版“生长中的笔记”（AI 资讯优先）：暖纸、墨褐、陶土红、苔藓绿与细档案线。
- 不恢复深色极光、玻璃拟态、彩色渐变或大面积发光阴影。
- 桌面公共页使用窄左侧导航与宽正文；文章目录按需折叠。移动端使用品牌栏、AI 资讯优先的底栏和更多抽屉。首页依次展示 AI 资讯、公开笔记和文章，完整文章列表位于 `/blog`。
- 纸纹与水墨植物使用 `public/images/` 下的 WebP 资源。

## Markdown 契约

- 数据库以 `contents.contentMd` 保存源文，以 `contents.contentHtml` 保存服务端安全渲染结果。
- 服务端渲染使用 markdown-it，并通过 sanitize-html 清理输出。
- 后台统一使用 `components/content/MarkdownEditor.vue`，支持编辑、分屏、预览和本地 Markdown 导入。
- 本地文件只在浏览器读取；不得新增不必要的上传接口，也不得在导入后自动保存。

## Nuxt 组件命名

- 以 `.nuxt/components.d.ts` 为自动导入名称的权威来源。
- 重复目录/文件段会去重：`components/content/ContentList.vue` 使用 `<ContentList>`，不是 `<ContentContentList>`。

## 任务与文档

- 暖纸改造状态以 `docs/20260711115524+暖纸风整站改造任务接力清单.md` 为准。
- 设计约束与步骤分别见 `docs/superpowers/specs/2026-07-11-warm-paper-site-redesign-design.md` 和 `docs/superpowers/plans/2026-07-11-warm-paper-site-redesign.md`。
- 浏览器验收与参考图对照记录在 `design-qa.md`。
- 修改任务状态时同步更新接力清单、详细计划和 `docs/progress.md`。

## Git 与工作区保护

- 开始前先运行 `git status --short`；不得覆盖或回退用户已有改动。
- 日常开发统一在本地 `dev` 分支进行，不直接在 `main` 上开发。
- 开发完成并通过本地验证后，先推送远端 `dev`，再切换到 `main` 合并 `dev`。
- 每次合并到 `main` 都必须创建带发布内容说明的 annotated Tag；Tag 使用 `V1.0.0` 格式并按语义化版本持续递增，未指定版本级别时默认递增补丁号。
- 合并完成后推送远端 `main` 和本次 Tag，再切换回本地 `dev`。
- 发布收尾时先检查关联 worktree 和未提交改动，再删除其他本地分支；本地最终只保留 `main` 与 `dev`。
- 提交前必须运行 `git diff --check`，并保留可复现的测试或浏览器证据。
