# “编辑部档案馆”前端重设计实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `prototype/` 下 6 个静态页面重设计为统一的“编辑部档案馆”，完善主题、导航、组合筛选、文章目录、登录演示和移动端交互。

**架构：** 保留静态 HTML + 共享 CSS + 共享 JavaScript 结构，以语义类和 `data-*` 属性建立可迁移的组件契约。先用 Node 内置测试锁定页面结构与交互接口，再逐层实现视觉系统、页面结构和行为；真实浏览器验收作为最终检查，不引入 Nuxt 或后端依赖。

**技术栈：** HTML5、CSS 自定义属性、原生 JavaScript、Node.js `node:test`

---

## 文件结构

- 创建：`prototype/tests/prototype.test.mjs` —— 6 页结构、共享资源、交互钩子、可访问性与响应式契约测试。
- 修改：`prototype/assets/styles.css` —— 设计变量、基础排版、共享布局、页面组件、主题和响应式规则。
- 修改：`prototype/assets/app.js` —— 主题、抽屉、组合筛选、目录、确认操作和登录演示。
- 修改：`prototype/index.html` —— 刊物封面、文章目录与作者档案。
- 修改：`prototype/blog.html` —— 公开文章搜索、标签筛选、结果计数和目录列表。
- 修改：`prototype/blog-post.html` —— 长文阅读、桌面目录、移动目录和阅读进度。
- 修改：`prototype/notes.html` —— 私密档案提示、组合筛选和最近更新。
- 修改：`prototype/note-post.html` —— 档案详情、移动操作栏和转公开确认。
- 修改：`prototype/login.html` —— 分栏登录、密码显示、加载和错误状态。

## 任务 1：建立原型契约测试

**文件：**

- 创建：`prototype/tests/prototype.test.mjs`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：编写失败的页面与资源契约测试**

创建使用 Node 内置测试的脚本，明确页面、共享资源和关键 `data-*` 接口：

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const pages = [
  'index.html',
  'blog.html',
  'blog-post.html',
  'notes.html',
  'note-post.html',
  'login.html',
]

async function read(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('all pages use the editorial shell and shared assets', async () => {
  for (const page of pages) {
    const html = await read(page)
    assert.match(html, /class="site-header"/)
    assert.match(html, /assets\/styles\.css/)
    assert.match(html, /assets\/app\.js/)
    assert.match(html, /<main[^>]*id="main-content"/)
  }
})

test('list pages expose combined filter state', async () => {
  for (const page of ['blog.html', 'notes.html']) {
    const html = await read(page)
    assert.match(html, /data-filter-form/)
    assert.match(html, /data-search/)
    assert.match(html, /data-tag-filter/)
    assert.match(html, /data-result-count/)
    assert.match(html, /data-empty/)
  }
})

test('detail pages expose toc and progress hooks', async () => {
  for (const page of ['blog-post.html', 'note-post.html']) {
    const html = await read(page)
    assert.match(html, /data-reading-progress/)
    assert.match(html, /data-toc/)
    assert.match(html, /data-toc-toggle/)
  }
})

test('login exposes password and submit states', async () => {
  const html = await read('login.html')
  assert.match(html, /data-login-form/)
  assert.match(html, /data-password-toggle/)
  assert.match(html, /data-form-error/)
  assert.match(html, /aria-live="polite"/)
})

test('shared styles define themes, focus, mobile and reduced motion', async () => {
  const css = await read('assets/styles.css')
  assert.match(css, /--paper:/)
  assert.match(css, /--ink:/)
  assert.match(css, /--vermilion:/)
  assert.match(css, /:focus-visible/)
  assert.match(css, /@media \(max-width: 767px\)/)
  assert.match(css, /prefers-reduced-motion: reduce/)
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：

```bash
node --test prototype/tests/prototype.test.mjs
```

预期：测试失败，首个错误指出现有页面缺少 `site-header` 或 `main-content`。

- [ ] **步骤 3：检查现有 JavaScript 语法基线**

运行：

```bash
node --check prototype/assets/app.js
```

预期：退出码为 0，无语法错误。

- [ ] **步骤 4：提交测试契约**

```bash
git add prototype/tests/prototype.test.mjs
git commit -m "test: add prototype redesign contracts"
```

## 任务 2：实现共享视觉系统与页面外壳

**文件：**

- 修改：`prototype/assets/styles.css`
- 修改：`prototype/index.html`
- 修改：`prototype/blog.html`
- 修改：`prototype/blog-post.html`
- 修改：`prototype/notes.html`
- 修改：`prototype/note-post.html`
- 修改：`prototype/login.html`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：用设计令牌替换现有极光与玻璃变量**

在 `styles.css` 顶部建立完整主题接口：

```css
:root {
  color-scheme: light;
  --paper: #f3efe5;
  --paper-raised: #faf7ef;
  --ink: #201d18;
  --ink-soft: #5f594f;
  --ink-faint: #8d8577;
  --line: #cec5b5;
  --line-strong: #958b7a;
  --vermilion: #b43122;
  --vermilion-dark: #842419;
  --pine: #2f5a48;
  --focus: #2767a5;
  --font-display: "Noto Serif SC", "Songti SC", serif;
  --font-body: "Noto Sans SC", "PingFang SC", sans-serif;
  --font-mono: "SFMono-Regular", Consolas, monospace;
  --content: 1180px;
  --reading: 720px;
  --header-height: 76px;
  --ease: cubic-bezier(.2, .75, .25, 1);
}

[data-theme="dark"] {
  color-scheme: dark;
  --paper: #191713;
  --paper-raised: #211e19;
  --ink: #eee8dc;
  --ink-soft: #bdb4a6;
  --ink-faint: #8f8679;
  --line: #3d3830;
  --line-strong: #71685b;
  --vermilion: #d75a43;
  --vermilion-dark: #ec7964;
  --pine: #7caa91;
  --focus: #82b8e8;
}
```

- [ ] **步骤 2：实现共享刊头和跳转链接结构**

六页统一使用以下语义接口，页面只改变当前导航状态：

```html
<a class="skip-link" href="#main-content">跳到正文</a>
<header class="site-header">
  <div class="site-header__inner">
    <a class="masthead" href="index.html" aria-label="智识花园首页">
      <span class="masthead__issue">NO. 06 / 2026</span>
      <span class="masthead__name">智识花园</span>
    </a>
    <nav class="desktop-nav" aria-label="主导航">
      <a data-nav-link="home" href="index.html">01 首页</a>
      <a data-nav-link="blog" href="blog.html">02 博客</a>
      <a data-nav-link="notes" href="notes.html">03 私密档案</a>
    </nav>
    <div class="header-actions">
      <button class="icon-button" data-theme-toggle type="button">切换主题</button>
      <button class="icon-button menu-button" data-menu-toggle type="button"
        aria-expanded="false" aria-controls="mobile-navigation">菜单</button>
    </div>
  </div>
</header>
```

- [ ] **步骤 3：实现移动抽屉、页脚和通用内容容器样式**

在共享 CSS 中定义 `.mobile-nav`、`.page-shell`、`.edition-rule`、`.site-footer` 和 `.icon-button`，确保按钮最小尺寸为 44px，并为安全区添加 `env(safe-area-inset-bottom)`。

- [ ] **步骤 4：运行共享契约测试**

运行：

```bash
node --test prototype/tests/prototype.test.mjs
```

预期：外壳相关断言通过；列表、详情和登录状态相关断言仍可能失败。

- [ ] **步骤 5：提交共享视觉系统**

```bash
git add prototype/assets/styles.css prototype/*.html
git commit -m "feat: build editorial prototype shell"
```

## 任务 3：重构首页为刊物封面

**文件：**

- 修改：`prototype/index.html`
- 修改：`prototype/assets/styles.css`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：增加首页结构测试**

在测试文件新增：

```js
test('home reads as a cover, contents list and author archive', async () => {
  const html = await read('index.html')
  assert.match(html, /class="cover-story"/)
  assert.match(html, /class="contents-list"/)
  assert.match(html, /class="author-file"/)
  assert.doesNotMatch(html, /aurora-bg/)
})
```

- [ ] **步骤 2：运行首页测试确认失败**

运行：

```bash
node --test --test-name-pattern="home reads" prototype/tests/prototype.test.mjs
```

预期：FAIL，缺少 `cover-story`。

- [ ] **步骤 3：实现封面主稿、目录行和作者档案**

首页主内容使用：

```html
<main id="main-content" class="page-shell home-page">
  <section class="cover-story" aria-labelledby="cover-title">
    <p class="eyebrow">FEATURED / 本期主稿</p>
    <h1 id="cover-title">在代码与思考之间，<em>记录、沉淀、生长</em></h1>
    <p class="cover-story__dek">一个软件工程师的公开写作与私密知识档案。</p>
    <a class="text-link text-link--strong" href="blog-post.html">阅读本期主稿</a>
  </section>
  <section class="contents-section" aria-labelledby="latest-title">
    <h2 id="latest-title">最新内容</h2>
    <ol class="contents-list"><!-- 三条真实文章数据 --></ol>
  </section>
  <section class="author-file" aria-labelledby="author-title"><!-- 作者档案 --></section>
</main>
```

- [ ] **步骤 4：实现桌面非对称网格与移动单栏**

桌面封面使用两列编辑网格；`max-width: 767px` 时改为单栏，标题使用 `clamp()`，目录行元信息自动换行，不出现横向滚动。

- [ ] **步骤 5：运行首页与全量测试**

```bash
node --test prototype/tests/prototype.test.mjs
```

预期：首页断言通过，其余已实现契约保持通过。

- [ ] **步骤 6：提交首页**

```bash
git add prototype/index.html prototype/assets/styles.css prototype/tests/prototype.test.mjs
git commit -m "feat: redesign home as editorial cover"
```

## 任务 4：实现博客与笔记组合筛选

**文件：**

- 修改：`prototype/blog.html`
- 修改：`prototype/notes.html`
- 修改：`prototype/assets/styles.css`
- 修改：`prototype/assets/app.js`
- 修改：`prototype/tests/prototype.test.mjs`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：增加组合筛选行为契约测试**

```js
test('filter implementation combines query and tags and restores URL state', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /function applyContentFilters/)
  assert.match(js, /queryMatch\s*&&\s*tagMatch/)
  assert.match(js, /searchParams\.set\(['"]q['"]/)
  assert.match(js, /searchParams\.set\(['"]tag['"]/)
  assert.match(js, /data-result-count/)
})
```

- [ ] **步骤 2：运行筛选测试确认失败**

```bash
node --test --test-name-pattern="filter implementation" prototype/tests/prototype.test.mjs
```

预期：FAIL，缺少 `applyContentFilters`。

- [ ] **步骤 3：重构两个列表页面的共享标记**

两个页面统一使用 `data-filter-form`、`data-search`、`data-tag-filter`、`data-card`、`data-result-count` 和 `data-empty`。文章条目改为 `.archive-entry`，保留现有真实标题、摘要、日期和标签。

- [ ] **步骤 4：实现单一筛选状态函数**

在 `app.js` 中按以下语义实现：

```js
function applyContentFilters() {
  const query = searchInput.value.trim().toLocaleLowerCase('zh-CN')
  const selectedTags = getSelectedTags()
  let visibleCount = 0

  cards.forEach((card) => {
    const text = card.textContent.toLocaleLowerCase('zh-CN')
    const tags = (card.dataset.tags || '').split(',').filter(Boolean)
    const queryMatch = query === '' || text.includes(query)
    const tagMatch = selectedTags.length === 0 || selectedTags.some((tag) => tags.includes(tag))
    const isVisible = queryMatch && tagMatch
    card.hidden = !isVisible
    if (isVisible) visibleCount += 1
  })

  resultCount.textContent = `共 ${visibleCount} 篇`
  emptyState.hidden = visibleCount !== 0
  syncFilterUrl(query, selectedTags)
}
```

- [ ] **步骤 5：实现 URL 初始化与统一清除**

页面加载时恢复 `q` 和逗号分隔的 `tag`；清除按钮重置输入、标签、URL、结果数量和空状态。

- [ ] **步骤 6：运行测试和语法检查**

```bash
node --test prototype/tests/prototype.test.mjs
node --check prototype/assets/app.js
```

预期：全部 PASS，JavaScript 无语法错误。

- [ ] **步骤 7：提交列表页**

```bash
git add prototype/blog.html prototype/notes.html prototype/assets/styles.css prototype/assets/app.js prototype/tests/prototype.test.mjs
git commit -m "feat: add editorial content filtering"
```

## 任务 5：实现长文目录、阅读进度与笔记操作

**文件：**

- 修改：`prototype/blog-post.html`
- 修改：`prototype/note-post.html`
- 修改：`prototype/assets/styles.css`
- 修改：`prototype/assets/app.js`
- 修改：`prototype/tests/prototype.test.mjs`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：增加详情交互契约测试**

```js
test('detail interactions include active toc, progress and publish confirmation', async () => {
  const js = await read('assets/app.js')
  const note = await read('note-post.html')
  assert.match(js, /IntersectionObserver/)
  assert.match(js, /data-reading-progress/)
  assert.match(js, /data-toc-drawer/)
  assert.match(note, /data-publish-note/)
  assert.match(note, /data-confirm-dialog/)
})
```

- [ ] **步骤 2：运行详情测试确认失败**

```bash
node --test --test-name-pattern="detail interactions" prototype/tests/prototype.test.mjs
```

预期：FAIL，缺少阅读进度或确认对话框接口。

- [ ] **步骤 3：统一详情页阅读结构**

两个详情页使用 `.article-layout`、`.article-header`、`.article-body`、`.article-toc` 和 `.mobile-toc`；保留现有正文和标题 ID，不改写文章内容。

- [ ] **步骤 4：实现阅读进度和当前章节**

滚动时按正文起止位置更新 `[data-reading-progress]` 宽度；通过 `IntersectionObserver` 更新目录链接的 `aria-current="location"`。减少动态效果开启时使用即时定位。

- [ ] **步骤 5：实现移动目录抽屉**

`[data-toc-toggle]` 控制 `[data-toc-drawer]`，复用全局抽屉的焦点、Escape、遮罩和滚动锁定规则；无标题时隐藏入口。

- [ ] **步骤 6：实现笔记转公开确认**

`[data-publish-note]` 打开原生 `<dialog data-confirm-dialog>`；确认后只更新原型状态文案，不调用后端。取消或 Escape 不改变状态。

- [ ] **步骤 7：运行测试和语法检查**

```bash
node --test prototype/tests/prototype.test.mjs
node --check prototype/assets/app.js
```

预期：全部 PASS。

- [ ] **步骤 8：提交详情页**

```bash
git add prototype/blog-post.html prototype/note-post.html prototype/assets/styles.css prototype/assets/app.js prototype/tests/prototype.test.mjs
git commit -m "feat: improve editorial reading experience"
```

## 任务 6：实现登录演示状态

**文件：**

- 修改：`prototype/login.html`
- 修改：`prototype/assets/styles.css`
- 修改：`prototype/assets/app.js`
- 修改：`prototype/tests/prototype.test.mjs`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：增加登录行为契约测试**

```js
test('login implementation handles visibility, loading, errors and redirect', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /function togglePasswordVisibility/)
  assert.match(js, /setLoginLoading/)
  assert.match(js, /setLoginError/)
  assert.match(js, /window\.location\.href\s*=\s*['"]index\.html['"]/)
})
```

- [ ] **步骤 2：运行登录测试确认失败**

```bash
node --test --test-name-pattern="login implementation" prototype/tests/prototype.test.mjs
```

预期：FAIL，缺少 `togglePasswordVisibility`。

- [ ] **步骤 3：重构登录页为编辑部分栏**

桌面端左侧展示站点刊名、私密空间说明和期号，右侧为表单；移动端仅保留紧凑品牌、说明和表单。

- [ ] **步骤 4：实现密码、加载与错误状态**

密码按钮切换 `type` 和 `aria-pressed`；提交时禁用按钮并显示“验证中”；用户名为 `demo-error` 时在 500ms 后展示演示错误，其余非空值在 500ms 后跳转 `index.html`。

- [ ] **步骤 5：运行测试和语法检查**

```bash
node --test prototype/tests/prototype.test.mjs
node --check prototype/assets/app.js
```

预期：全部 PASS。

- [ ] **步骤 6：提交登录页**

```bash
git add prototype/login.html prototype/assets/styles.css prototype/assets/app.js prototype/tests/prototype.test.mjs
git commit -m "feat: redesign prototype login flow"
```

## 任务 7：完善主题、移动端与可访问性

**文件：**

- 修改：`prototype/assets/styles.css`
- 修改：`prototype/assets/app.js`
- 修改：`prototype/*.html`
- 修改：`prototype/tests/prototype.test.mjs`
- 测试：`prototype/tests/prototype.test.mjs`

- [ ] **步骤 1：增加主题与抽屉状态测试**

```js
test('theme and drawer implementation expose accessible state', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /matchMedia\(['"]\(prefers-color-scheme: dark\)['"]\)/)
  assert.match(js, /aria-expanded/)
  assert.match(js, /focus\(\)/)
  assert.match(js, /previouslyFocusedElement/)
})
```

- [ ] **步骤 2：运行状态测试确认失败**

```bash
node --test --test-name-pattern="theme and drawer" prototype/tests/prototype.test.mjs
```

预期：FAIL，现有主题没有系统偏好回退或抽屉焦点恢复。

- [ ] **步骤 3：完善主题初始化**

优先级为本地选择、系统偏好、浅色默认；同步所有主题按钮、`meta[name="theme-color"]` 与控件标签。

- [ ] **步骤 4：完善抽屉焦点和状态**

打开时记录当前焦点，将焦点移入抽屉并设置 `aria-expanded="true"`；关闭时恢复焦点和滚动并设置 `aria-expanded="false"`。

- [ ] **步骤 5：完成响应式与减少动态效果样式**

在 375px、768px、1440px 三档确保：无非预期横向滚动；筛选条可触控滚动；目录和笔记操作栏不遮挡正文；`prefers-reduced-motion` 下动画时长接近 0。

- [ ] **步骤 6：运行全量自动检查**

```bash
node --test prototype/tests/prototype.test.mjs
node --check prototype/assets/app.js
git diff --check
```

预期：测试全部 PASS，JavaScript 语法正确，Git 空白检查无输出。

- [ ] **步骤 7：启动本地静态服务做功能验收**

运行：

```bash
python3 -m http.server 4173 --directory prototype
```

逐页检查 `http://127.0.0.1:4173/`、`blog.html`、`blog-post.html`、`notes.html`、`note-post.html`、`login.html`，验证桌面和移动导航、主题、筛选、目录、确认对话框和登录状态。

- [ ] **步骤 8：提交最终质量修正**

```bash
git add prototype
git commit -m "fix: polish responsive prototype interactions"
```

## 任务 8：最终验证与交付

**文件：**

- 检查：`prototype/`
- 检查：`docs/superpowers/specs/2026-06-20-editorial-archive-redesign-design.md`
- 检查：`docs/superpowers/plans/2026-06-20-editorial-archive-redesign-plan.md`

- [ ] **步骤 1：重新运行全部自动检查**

```bash
node --test prototype/tests/prototype.test.mjs
node --check prototype/assets/app.js
git diff --check
```

预期：全部通过且无空白错误。

- [ ] **步骤 2：确认提交范围**

```bash
git status --short
git diff --stat HEAD
```

预期：只包含本次 `prototype/` 重设计及对应计划；没有无关文件。

- [ ] **步骤 3：记录验收结论**

在最终回复中列出：完成的 6 个页面、已验证的交互、自动检查结果、未执行或受环境限制的检查，不使用未经验证的“已完成”表述。
