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

test('home reads as a cover, contents list and author archive', async () => {
  const html = await read('index.html')
  assert.match(html, /class="cover-story"/)
  assert.match(html, /class="contents-list"/)
  assert.match(html, /class="author-file"/)
  assert.doesNotMatch(html, /aurora-bg/)
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

test('filter implementation combines query and tags and restores URL state', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /function applyContentFilters/)
  assert.match(js, /queryMatch\s*&&\s*tagMatch/)
  assert.match(js, /searchParams\.set\(['"]q['"]/)
  assert.match(js, /searchParams\.set\(['"]tag['"]/)
  assert.match(js, /data-result-count/)
})

test('detail pages expose toc and progress hooks', async () => {
  for (const page of ['blog-post.html', 'note-post.html']) {
    const html = await read(page)
    assert.match(html, /data-reading-progress/)
    assert.match(html, /data-toc/)
    assert.match(html, /data-toc-toggle/)
  }
})

test('detail interactions include active toc, progress and publish confirmation', async () => {
  const js = await read('assets/app.js')
  const note = await read('note-post.html')
  assert.match(js, /IntersectionObserver/)
  assert.match(js, /data-reading-progress/)
  assert.match(js, /data-toc-drawer/)
  assert.match(note, /data-publish-note/)
  assert.match(note, /data-confirm-dialog/)
})

test('login exposes password and submit states', async () => {
  const html = await read('login.html')
  assert.match(html, /data-login-form/)
  assert.match(html, /data-password-toggle/)
  assert.match(html, /data-form-error/)
  assert.match(html, /aria-live="polite"/)
})

test('login implementation handles visibility, loading, errors and redirect', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /function togglePasswordVisibility/)
  assert.match(js, /setLoginLoading/)
  assert.match(js, /setLoginError/)
  assert.match(js, /window\.location\.href\s*=\s*['"]index\.html['"]/)
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

test('theme and drawer implementation expose accessible state', async () => {
  const js = await read('assets/app.js')
  assert.match(js, /matchMedia\(['"]\(prefers-color-scheme: dark\)['"]\)/)
  assert.match(js, /aria-expanded/)
  assert.match(js, /focus\(\)/)
  assert.match(js, /previouslyFocusedElement/)
})
