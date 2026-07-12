# 智识花园暖纸风整站重设计实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将智识花园全部公开页面、登录页和管理后台统一改造成第二版“编辑手记”暖纸风，并完成安全、完整的 Markdown 阅读、编辑、预览和本地文件导入能力。

**架构：** 保留现有 Nuxt 3 + Nitro + Drizzle + SQLite 内容模型，以新的纸张设计令牌和公共布局组件替换极光玻璃体系。服务端继续保存 `contentMd` 并生成安全的 `contentHtml`；客户端使用 Vue 3 Markdown 编辑组件直接编辑源文本，本地导入只通过浏览器读取文件，不新增上传 API。

**技术栈：** Nuxt 3、Vue 3、TypeScript、UnoCSS、Nitro、Drizzle ORM、SQLite、Vitest、markdown-it、sanitize-html、md-editor-v3、Iconify Carbon。

**设计基准：** `/Users/jiabaokang/.codex/generated_images/019f4f0e-1b07-7cd1-9728-2b950de0766b/exec-02ef3bd8-293b-4f36-97ec-1b5b700b5814.png`

---

## 文件结构与职责

### 新建文件

- `assets/css/paper.css`：暖纸设计令牌、全局纸面背景、通用分隔线和排版工具。
- `assets/css/markdown.css`：公开详情页和编辑器预览共用的 Markdown 排版规则。
- `public/images/paper-texture.webp`：可平铺的低对比真实纸纹资源。
- `public/images/ink-plant.webp`：首页/登录页可复用的克制水墨植物资源。
- `components/layout/PaperSidebar.vue`：桌面左栏和移动端导航抽屉。
- `components/layout/ReadingAside.vue`：桌面右侧索引/近期内容容器。
- `components/content/ContentList.vue`：博客、笔记、公众号共用的编辑部行列表。
- `components/content/MarkdownContent.vue`：安全渲染后的 HTML 展示边界。
- `components/content/MarkdownEditor.vue`：编辑、分屏、预览模式和 Markdown 文本绑定。
- `components/content/ImportMarkdownButton.vue`：本地 Markdown 文件选择、读取、校验和事件输出。
- `composables/useMarkdownImport.ts`：无 UI 的文件验证和读取逻辑。
- `tests/unit/markdown-import.test.ts`：本地导入逻辑单元测试。
- `tests/unit/markdown-rendering.test.ts`：服务端 Markdown 渲染和清理测试。
- `tests/unit/components/MarkdownContent.test.ts`：统一 Markdown 展示组件测试。
- `tests/unit/components/MarkdownEditor.test.ts`：编辑模式与导入事件测试。
- `tests/unit/layout/paper-layout.test.ts`：公共布局结构测试。
- `design-qa.md`：最终视觉对比报告，完成前必须写入 `final result: passed`。

### 修改文件

- `nuxt.config.ts`：注册暖纸和 Markdown 样式，配置需要的客户端包。
- `uno.config.ts`：删除/替换极光语义快捷方式，增加纸面语义快捷方式。
- `package.json`、`pnpm-lock.yaml`：替换 TipTap 依赖，加入 Markdown 编辑和渲染依赖。
- `assets/css/tokens.css`、`assets/css/main.css`、`assets/css/layout.css`：迁移到暖纸令牌和响应式结构。
- `layouts/default.vue`：使用纸面公共框架。
- `layouts/admin.vue`：使用同源后台纸面框架。
- `components/AppHeader.vue`、`components/AppDrawer.vue`、`components/AppFooter.vue`：收口到新的导航系统；不再重复桌面导航。
- `components/admin/PostForm.vue`：接入 Markdown 编辑器、导入入口和暖纸发布设置。
- `server/utils/markdown.ts`：完整 Markdown 渲染、安全清理和标题锚点。
- `pages/index.vue`：第二版首页结构。
- `pages/blog/index.vue`、`pages/blog/[slug].vue`：编辑部列表和书页详情。
- `pages/notes/index.vue`、`pages/notes/[slug].vue`：高密度笔记列表和详情。
- `pages/inspiration/index.vue`、`pages/inspiration/new.vue`、`pages/inspiration/edit/[id].vue`、`pages/inspiration/[slug].vue`：统一灵感列表和编辑体验。
- `pages/wechat/index.vue`、`pages/wechat/[slug].vue`：公众号索引和统一详情。
- `pages/ai.vue`：纸面工具书架。
- `pages/login.vue`：纸面登录构图。
- `pages/admin/index.vue`、`pages/admin/posts/index.vue`、`pages/admin/posts/new.vue`、`pages/admin/posts/[id].vue`：后台工作台和列表。
- 现有相关测试：更新原有极光/玻璃断言为纸面语义断言。

---

### 任务 1：锁定依赖与 Markdown 服务端契约

**文件：**
- 修改：`package.json`
- 修改：`pnpm-lock.yaml`
- 修改：`server/utils/markdown.ts`
- 创建：`tests/unit/markdown-rendering.test.ts`
- 修改：`tests/unit/markdown.test.ts`

- [x] **步骤 1：核对依赖并记录选择**

检查 `md-editor-v3`、`markdown-it`、`markdown-it-anchor`、`markdown-it-task-lists` 和 `isomorphic-dompurify` 的当前 Nuxt SSR 兼容性、许可证和包体积。若 `md-editor-v3` 无法 ClientOnly 稳定运行，使用 `vue-codemirror` + 共用预览组件替代，并在本计划头部更新技术栈。

- [x] **步骤 2：编写失败的 Markdown 渲染测试**

```ts
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '~/server/utils/markdown'

describe('renderMarkdown', () => {
  it('renders gfm blocks and heading ids', async () => {
    const html = await renderMarkdown('# 标题\n\n- [x] 完成\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```ts\nconst n = 1\n```')
    expect(html).toContain('<h1 id="标题">')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('<table>')
    expect(html).toContain('language-ts')
  })

  it('removes dangerous html', async () => {
    const html = await renderMarkdown('<script>alert(1)</script><a href="javascript:alert(1)">x</a>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('javascript:')
  })
})
```

- [x] **步骤 3：运行测试确认失败**

运行：`pnpm vitest run tests/unit/markdown-rendering.test.ts`

预期：FAIL；当前实现不包含表格、任务列表、代码语言类和安全清理。

- [x] **步骤 4：安装最小依赖**

运行：

```bash
pnpm add markdown-it markdown-it-anchor markdown-it-task-lists sanitize-html md-editor-v3
# TipTap 在任务 5 完成 MarkdownEditor 替换后删除，避免中间态 typecheck 失败。
```

- [x] **步骤 5：实现安全 Markdown 渲染**

`server/utils/markdown.ts` 应建立单例渲染器并返回清理后的 HTML：

```ts
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'
import sanitizeHtml from 'sanitize-html'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })
  .use(anchor, { permalink: false })
  .use(taskLists, { enabled: true, label: true })

export async function renderMarkdown(source: string): Promise<string> {
  return sanitizeHtml(md.render(source), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'input'],
  })
}
```

为外链增加安全的 `target="_blank" rel="noopener noreferrer"` 规则；不要开启原始 HTML。

- [x] **步骤 6：运行局部测试**

运行：`pnpm vitest run tests/unit/markdown-rendering.test.ts tests/unit/markdown.test.ts`

预期：全部 PASS。

- [x] **步骤 7：Commit**

```bash
git add package.json pnpm-lock.yaml server/utils/markdown.ts tests/unit/markdown-rendering.test.ts tests/unit/markdown.test.ts
git commit -m "feat: 完善 Markdown 安全渲染"
```

### 任务 2：建立暖纸设计令牌与真实视觉资源

**文件：**
- 创建：`assets/css/paper.css`
- 创建：`public/images/paper-texture.webp`
- 创建：`public/images/ink-plant.webp`
- 修改：`assets/css/tokens.css`
- 修改：`assets/css/main.css`
- 修改：`assets/css/layout.css`
- 修改：`nuxt.config.ts`
- 修改：`uno.config.ts`
- 修改：`tests/unit/css/tokens.test.ts`
- 修改：`tests/unit/config/shortcuts.test.ts`

- [x] **步骤 1：生成并检查两个真实图片资源**

使用选定视觉稿作为风格参考生成：

- `paper-texture.webp`：1024×1024 可平铺、低对比、无文字、无污渍。
- `ink-plant.webp`：1600×1000 暖灰水墨植物、浅纸底、主体位于右侧，可裁切。

用图片查看工具检查资源没有文字、边缘断裂和明显重复图案。

- [x] **步骤 2：先更新失败的令牌测试**

测试需断言：

```ts
expect(tokens).toContain('--paper-base: #F3EBDD')
expect(tokens).toContain('--ink-primary: #2A241D')
expect(tokens).toContain('--accent-terracotta: #B85C38')
expect(tokens).not.toContain('--gradient-aurora')
```

- [x] **步骤 3：运行测试确认失败**

运行：`pnpm vitest run tests/unit/css/tokens.test.ts tests/unit/config/shortcuts.test.ts`

预期：FAIL，当前仍为极光令牌。

- [x] **步骤 4：实现纸面令牌**

在 `tokens.css` 中建立：

```css
:root {
  --paper-base: #F3EBDD;
  --paper-surface: #F8F2E7;
  --paper-muted: #E9DECC;
  --ink-primary: #2A241D;
  --ink-secondary: #6F6558;
  --ink-muted: #968B7C;
  --accent-terracotta: #B85C38;
  --accent-moss: #667653;
  --rule-color: rgba(71, 59, 43, 0.18);
  --focus-ring: rgba(184, 92, 56, 0.24);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 10px;
}
```

`paper.css` 使用真实纹理作为背景，不以 CSS 噪声或渐变替代资源。

- [x] **步骤 5：注册全局 CSS 与语义快捷方式**

`nuxt.config.ts` 中按 `tokens.css`、`paper.css`、`markdown.css`、`main.css`、`layout.css` 的顺序注册。UnoCSS 快捷方式新增 `paper-surface`、`paper-rule`、`paper-focus`，删除视觉层面的 `glass` 和 `gradient-text` 使用入口。

- [x] **步骤 6：运行测试和静态检查**

运行：

```bash
pnpm vitest run tests/unit/css/tokens.test.ts tests/unit/config/shortcuts.test.ts
git diff --check
```

预期：全部通过，无空白错误。

- [x] **步骤 7：Commit**

```bash
git add assets/css public/images nuxt.config.ts uno.config.ts tests/unit/css/tokens.test.ts tests/unit/config/shortcuts.test.ts
git commit -m "feat: 建立暖纸视觉系统"
```

### 任务 3：实现公共三栏布局与移动导航

**文件：**
- 创建：`components/layout/PaperSidebar.vue`
- 创建：`components/layout/ReadingAside.vue`
- 修改：`layouts/default.vue`
- 修改：`components/AppDrawer.vue`
- 修改：`components/AppFooter.vue`
- 修改：`components/AppHeader.vue`
- 创建：`tests/unit/layout/paper-layout.test.ts`
- 修改：`tests/unit/components/AppDrawer.test.ts`

- [x] **步骤 1：编写失败的布局测试**

```ts
it('defines the public paper shell and navigation', () => {
  const layout = readFileSync('layouts/default.vue', 'utf8')
  expect(layout).toContain('<LayoutPaperSidebar')
  expect(layout).toContain('paper-shell__main')
  expect(layout).toContain('<LayoutReadingAside')
})
```

同时断言侧栏包含首页、博客、笔记、灵感、AI 导航和公众号的稳定路由。

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/layout/paper-layout.test.ts tests/unit/components/AppDrawer.test.ts`

预期：FAIL，公共布局仍使用 `AppAuroraBackground + AppHeader`。

- [x] **步骤 3：实现桌面三栏骨架**

`layouts/default.vue` 结构应保持简单：

```vue
<template>
  <div class="paper-shell">
    <LayoutPaperSidebar />
    <main id="main-content" class="paper-shell__main"><slot /></main>
    <LayoutReadingAside />
  </div>
</template>
```

右栏通过插槽/路由元信息展示内容；没有辅助内容时保持窄栏或隐藏，不填充无关卡片。

- [x] **步骤 4：实现移动导航**

小于 900px 时：隐藏桌面侧栏和右栏，展示 64px 顶部品牌栏；抽屉使用现有 `useDrawer`，具备焦点管理、Esc 关闭和 44px 触控目标。

- [x] **步骤 5：运行测试**

运行：`pnpm vitest run tests/unit/layout/paper-layout.test.ts tests/unit/components/AppDrawer.test.ts tests/unit/components/AppFooter.test.ts`

预期：全部 PASS。

- [x] **步骤 6：Commit**

```bash
git add layouts/default.vue components/layout components/AppDrawer.vue components/AppHeader.vue components/AppFooter.vue tests/unit/layout tests/unit/components
git commit -m "feat: 重构整站纸面布局"
```

### 任务 4：实现统一 Markdown 阅读组件与排版

**文件：**
- 创建：`assets/css/markdown.css`
- 创建：`components/content/MarkdownContent.vue`
- 创建：`tests/unit/components/MarkdownContent.test.ts`
- 修改：`pages/blog/[slug].vue`
- 修改：`pages/notes/[slug].vue`
- 修改：`pages/wechat/[slug].vue`
- 修改：`pages/inspiration/[slug].vue`

- [x] **步骤 1：编写失败的组件测试**

```ts
it('renders sanitized html inside the shared prose boundary', () => {
  const wrapper = mount(MarkdownContent, { props: { html: '<h2 id="x">标题</h2><p>正文</p>' } })
  expect(wrapper.find('.markdown-content').exists()).toBe(true)
  expect(wrapper.find('h2#x').text()).toBe('标题')
})
```

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/components/MarkdownContent.test.ts`

预期：FAIL，组件不存在。

- [x] **步骤 3：实现展示组件和样式**

组件只负责稳定展示边界：

```vue
<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<template>
  <div class="markdown-content" v-html="html" />
</template>
```

`markdown.css` 完整覆盖标题、段落、链接、列表、任务列表、引用、表格、图片、行内代码和代码块；正文 `max-width` 保持约 65ch；表格外层允许横向滚动。

- [x] **步骤 4：替换所有详情页直接 `v-html`**

每个详情页统一使用：

```vue
<ContentMarkdownContent :html="post.contentHtml" />
```

不要在页面文件中复制 Markdown 样式。

- [x] **步骤 5：运行测试**

运行：`pnpm vitest run tests/unit/components/MarkdownContent.test.ts tests/unit/pages`

预期：全部 PASS。

- [x] **步骤 6：Commit**

```bash
git add assets/css/markdown.css components/content/MarkdownContent.vue pages tests/unit/components/MarkdownContent.test.ts
git commit -m "feat: 统一 Markdown 阅读体验"
```

### 任务 5：实现 Markdown 编辑、预览与本地导入

**文件：**
- 创建：`composables/useMarkdownImport.ts`
- 创建：`components/content/ImportMarkdownButton.vue`
- 创建：`components/content/MarkdownEditor.vue`
- 删除：`components/content/Editor.vue`
- 创建：`tests/unit/markdown-import.test.ts`
- 创建：`tests/unit/components/MarkdownEditor.test.ts`
- 修改：`components/admin/PostForm.vue`

- [x] **步骤 1：编写失败的导入逻辑测试**

```ts
describe('readMarkdownFile', () => {
  it('reads markdown text and suggests a title', async () => {
    const file = new File(['# 正文'], '我的文章.md', { type: 'text/markdown' })
    await expect(readMarkdownFile(file)).resolves.toEqual({ content: '# 正文', suggestedTitle: '我的文章' })
  })

  it('rejects unsupported extensions', async () => {
    const file = new File(['x'], 'note.txt', { type: 'text/plain' })
    await expect(readMarkdownFile(file)).rejects.toThrow('仅支持 .md 或 .markdown 文件')
  })
})
```

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/markdown-import.test.ts`

预期：FAIL，导入函数不存在。

- [x] **步骤 3：实现无 UI 的文件读取**

```ts
export async function readMarkdownFile(file: File) {
  if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('仅支持 .md 或 .markdown 文件')
  const content = await file.text()
  if (!content.trim()) throw new Error('Markdown 文件为空')
  return { content, suggestedTitle: file.name.replace(/\.(md|markdown)$/i, '') }
}
```

- [x] **步骤 4：实现导入按钮**

使用隐藏的 `<input type="file" accept=".md,.markdown,text/markdown">`。组件只发出 `{ content, suggestedTitle }`，覆盖确认由拥有当前表单状态的 `PostForm` 负责。

- [x] **步骤 5：实现 MarkdownEditor**

使用 `ClientOnly` 包裹第三方编辑器，`v-model` 直接绑定 Markdown 字符串。桌面默认分屏，小屏默认编辑模式；暴露 `mode`，提供编辑/分屏/预览切换和导入插槽。

- [x] **步骤 6：接入 PostForm 覆盖确认**

```ts
function applyImportedMarkdown(payload: { content: string, suggestedTitle: string }) {
  if (form.contentMd.trim() && !window.confirm('当前正文已有内容，是否用导入文件覆盖？')) return
  form.contentMd = payload.content
  if (!form.title.trim()) form.title = payload.suggestedTitle
  importMessage.value = 'Markdown 已导入，请确认内容后保存'
}
```

导入不调用 API，不自动保存。

- [x] **步骤 7：运行测试**

运行：`pnpm vitest run tests/unit/markdown-import.test.ts tests/unit/components/MarkdownEditor.test.ts tests/unit/pages`

预期：全部 PASS。

- [x] **步骤 8：Commit**

```bash
git add components/content components/admin/PostForm.vue composables/useMarkdownImport.ts tests/unit/markdown-import.test.ts tests/unit/components/MarkdownEditor.test.ts
git commit -m "feat: 支持 Markdown 编辑预览与本地导入"
```

### 任务 6：重构首页与公共内容列表

**文件：**
- 创建：`components/content/ContentList.vue`
- 修改：`pages/index.vue`
- 修改：`pages/blog/index.vue`
- 修改：`pages/notes/index.vue`
- 修改：`pages/wechat/index.vue`
- 修改：`tests/unit/pages`

- [x] **步骤 1：编写失败的首页结构测试**

断言首页包含站点宣言、`ContentList`、写文章、导入 Markdown 和右栏近期内容数据，不包含 `glass`、`gradient-text`。

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/pages`

预期：FAIL，页面仍使用玻璃卡片。

- [x] **步骤 3：实现 ContentList**

组件输入：

```ts
defineProps<{
  items: Array<{ id: number, slug: string, type: string, title: string, summary?: string, publishedAt?: string, readingTime?: number, tags?: Array<{ name: string }> }>
  density?: 'editorial' | 'compact'
}>()
```

博客/公众号使用 `editorial`，笔记使用 `compact`。使用行分隔线，不给每一项单独厚重卡片。

- [x] **步骤 4：实现第二版首页**

中栏只保留站点宣言、最新文章流和一个主要写作动作；右栏展示近期笔记/灵感。使用 `ink-plant.webp` 作为克制装饰，不在 CSS 中绘制植物。

- [x] **步骤 5：迁移三个列表页**

将博客、笔记、公众号列表统一迁移至 `ContentList`，页面只负责查询、标题和辅助信息。

- [x] **步骤 6：运行测试**

运行：`pnpm vitest run tests/unit/pages tests/unit/components`

预期：全部 PASS。

- [x] **步骤 7：Commit**

```bash
git add components/content/ContentList.vue pages/index.vue pages/blog/index.vue pages/notes/index.vue pages/wechat/index.vue tests/unit/pages
git commit -m "feat: 重构首页与内容列表"
```

### 任务 7：迁移灵感、AI 导航与登录页

**文件：**
- 修改：`pages/inspiration/index.vue`
- 修改：`pages/inspiration/new.vue`
- 修改：`pages/inspiration/edit/[id].vue`
- 修改：`pages/ai.vue`
- 修改：`pages/login.vue`
- 修改：`tests/unit/pages/ai.test.ts`
- 创建/修改：相关页面测试

- [x] **步骤 1：更新失败的页面测试**

测试要求：灵感列表使用时间线/行结构；AI 导航保留搜索和分类；登录页包含可见标签、暖纸表面和真实水墨图片，且不包含 Aurora 背景。

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/pages/ai.test.ts tests/unit/pages`

预期：FAIL，现有页面仍使用旧视觉结构。

- [x] **步骤 3：迁移灵感流程**

保持私密、创建、编辑和保存行为不变，只更换为纸面时间线和统一 Markdown 编辑组件。

- [x] **步骤 4：迁移 AI 导航**

保留现有数据查询、分类和搜索 composable。工具改为紧凑行/书架分组；类别用苔藓绿或陶土红小标记，不使用渐变卡片。

- [x] **步骤 5：迁移登录页**

使用单张纸面表单，真实水墨植物位于辅助区。保持用户名、密码、显示密码和提交行为；完善聚焦、错误和禁用状态。

- [x] **步骤 6：运行测试**

运行：`pnpm vitest run tests/unit/pages tests/unit/components`

预期：全部 PASS。

- [x] **步骤 7：Commit**

```bash
git add pages/inspiration pages/ai.vue pages/login.vue tests/unit/pages
git commit -m "feat: 迁移灵感导航与登录页面"
```

### 任务 8：迁移管理后台

**文件：**
- 修改：`layouts/admin.vue`
- 修改：`pages/admin/index.vue`
- 修改：`pages/admin/posts/index.vue`
- 修改：`components/admin/PostForm.vue`
- 修改：`pages/admin/posts/new.vue`
- 修改：`pages/admin/posts/[id].vue`
- 创建/修改：后台页面测试

- [x] **步骤 1：编写失败的后台结构测试**

断言后台布局包含同源纸面侧栏、仪表盘工作区、内容行列表、正文主编辑区和右侧粘性发布设置，并且不包含 `gradient-text` 或 `glass`。

- [x] **步骤 2：运行测试确认失败**

运行：`pnpm vitest run tests/unit/pages tests/unit/components`

预期：FAIL，后台仍使用深色极光样式。

- [x] **步骤 3：实现后台纸面布局**

后台侧栏使用“概览、内容、标签、返回网站”任务导航；移动端使用抽屉。保持中间内容区域最大宽度适合表单。

- [x] **步骤 4：迁移仪表盘和内容列表**

统计信息用编辑部摘要行表达，内容列表使用表格/行列表；保证编辑、删除和新建入口可见且键盘可达。

- [x] **步骤 5：完成 PostForm 纸面样式**

正文编辑器占主栏，发布设置在桌面右侧粘性显示；标题、摘要和标签使用可见标签；保存状态、导入结果和错误信息靠近对应操作。

- [x] **步骤 6：运行测试**

运行：`pnpm vitest run tests/unit/pages tests/unit/components`

预期：全部 PASS。

- [x] **步骤 7：Commit**

```bash
git add layouts/admin.vue pages/admin components/admin/PostForm.vue tests/unit
git commit -m "feat: 重构暖纸风管理后台"
```

### 任务 9：清理旧视觉与执行全量自动化验证

**文件：**
- 删除：`components/AppAuroraBackground.vue`
- 删除或收缩：`assets/css/aurora.css`
- 修改：`nuxt.config.ts`
- 修改：所有仍引用 `glass`、`gradient-text`、`aurora` 的源文件和测试

- [x] **步骤 1：扫描旧视觉引用**

运行：

```bash
rg -n "AppAuroraBackground|gradient-text|gradient-aurora|glass-strong|class=\"glass|aurora" app.vue layouts pages components assets uno.config.ts nuxt.config.ts tests
```

预期：列出所有遗留引用；逐项确认应删除还是属于历史文档。

- [x] **步骤 2：删除运行时代码中的旧视觉引用**

只保留 Git 历史和已有设计文档中的说明；运行时代码、配置和当前测试不得继续依赖极光/玻璃语义。

- [x] **步骤 3：执行全量验证**

运行：

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
git diff --check
```

预期：所有命令退出码 0；记录测试数量和构建结果。

- [x] **步骤 4：Commit**

```bash
git add -A
git commit -m "refactor: 清理旧极光视觉体系"
```

### 任务 10：浏览器交互验证与视觉 QA

**文件：**
- 创建：`design-qa.md`
- 可能修改：视觉 QA 发现问题涉及的页面、组件和样式文件

- [ ] **步骤 1：启动本地应用**

运行：`pnpm dev --host 127.0.0.1 --port 3000`

预期：应用可在 `http://127.0.0.1:3000/` 访问。

- [ ] **步骤 2：桌面端检查核心页面**

以 1440×1024 检查：

- `/`
- `/blog`
- 一篇 `/blog/:slug`
- `/notes`
- `/inspiration`
- `/ai`
- `/wechat`
- `/login`
- `/admin`
- `/admin/posts`
- `/admin/posts/new`

验证导航、抽屉、搜索、编辑/分屏/预览、导入 Markdown、保存和错误反馈。

- [ ] **步骤 3：移动端检查核心流程**

以 390×844 检查首页、文章详情、AI 导航、登录和后台编辑页。确认无横向页面滚动；表格与代码块只在自身容器滚动；保存和导入操作始终可达。

- [ ] **步骤 4：进行参考图对比**

将选定视觉稿与 1440×1024 首页截图放入同一视觉比较输入，检查布局比例、暖纸色、字体层级、左中右栏宽度、线条、圆角、阴影和装饰资源。

- [ ] **步骤 5：写入首轮 QA 报告并修复**

`design-qa.md` 使用 P0/P1/P2/P3 分级。修复所有 P0/P1/P2 后重新截图和比较；P3 只记录，不阻塞。

- [ ] **步骤 6：通过最终 QA**

只有在报告末尾写入以下内容后才可交付：

```md
final result: passed
```

- [ ] **步骤 7：再次运行自动化验证**

运行：

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
git diff --check
```

预期：全部退出码 0。

- [ ] **步骤 8：Commit**

```bash
git add design-qa.md assets components layouts pages tests
git commit -m "fix: 完成暖纸整站视觉验收"
```

---

## 计划完成判定

只有同时满足以下条件才算完成：

- 任务 1–10 的复选框全部勾选。
- 所有主要页面已迁移到暖纸设计系统。
- Markdown 阅读、编辑、预览、导入和保存主流程可用。
- 全量 typecheck、lint、test、build 和 `git diff --check` 通过。
- 桌面 1440×1024 与移动 390×844 浏览器验证完成。
- `design-qa.md` 明确包含 `final result: passed`。
