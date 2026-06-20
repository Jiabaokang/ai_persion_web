/* 智识花园 · 原型交互 */
(function () {
  'use strict'

  const html = document.documentElement
  const body = document.body
  const THEME_KEY = 'ai-personal-website-theme'
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
  let previouslyFocusedElement = null

  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY)
    } catch {
      return null
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // 隐私模式下仍允许本次会话切换主题。
    }
  }

  function preferredTheme() {
    return storedTheme() || (darkMedia.matches ? 'dark' : 'light')
  }

  function applyTheme(theme, persist = false) {
    html.dataset.theme = theme
    if (persist) saveTheme(theme)

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const nextTheme = theme === 'dark' ? '浅色' : '深色'
      button.setAttribute('aria-label', `切换到${nextTheme}主题`)
      button.setAttribute('aria-pressed', String(theme === 'dark'))
    })

    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#191713' : '#f2ede2'
  }

  applyTheme(preferredTheme())

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-theme-toggle]')
    if (!toggle) return
    applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', true)
  })

  darkMedia.addEventListener?.('change', (event) => {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light')
  })

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
  }

  function setDrawerState(drawer, overlay, trigger, isOpen) {
    if (!drawer) return
    drawer.classList.toggle('is-open', isOpen)
    overlay?.classList.toggle('is-open', isOpen)
    drawer.setAttribute('aria-hidden', String(!isOpen))
    trigger?.setAttribute('aria-expanded', String(isOpen))
    body.classList.toggle('drawer-open', isOpen)

    if (isOpen) {
      previouslyFocusedElement = document.activeElement
      const firstFocusable = getFocusableElements(drawer)[0]
      ;(firstFocusable || drawer).focus()
    } else if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus()
      previouslyFocusedElement = null
    }
  }

  const menuButton = document.querySelector('[data-menu-toggle]')
  const mobileDrawer = document.querySelector('[data-drawer]')
  const mobileOverlay = document.querySelector('[data-drawer-overlay]')
  const drawerClose = document.querySelector('[data-drawer-close]')

  menuButton?.addEventListener('click', () => setDrawerState(mobileDrawer, mobileOverlay, menuButton, true))
  drawerClose?.addEventListener('click', () => setDrawerState(mobileDrawer, mobileOverlay, menuButton, false))
  mobileOverlay?.addEventListener('click', () => setDrawerState(mobileDrawer, mobileOverlay, menuButton, false))

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (mobileDrawer?.classList.contains('is-open')) {
      setDrawerState(mobileDrawer, mobileOverlay, menuButton, false)
    }
  })

  const currentPage = body.dataset.page
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const isCurrent = link.dataset.navLink === currentPage
    link.classList.toggle('is-active', isCurrent)
    if (isCurrent) link.setAttribute('aria-current', 'page')
  })

  /* 列表页：搜索条件与多标签使用同一状态源。 */
  const filterForm = document.querySelector('[data-filter-form]')
  if (filterForm) {
    const searchInput = filterForm.querySelector('[data-search]')
    const tagFilter = filterForm.querySelector('[data-tag-filter]')
    const cards = Array.from(document.querySelectorAll('[data-card]'))
    const resultCount = document.querySelector('[data-result-count]')
    const emptyState = document.querySelector('[data-empty]')

    function getSelectedTags() {
      return Array.from(tagFilter.querySelectorAll('[data-tag][aria-pressed="true"]')).map((button) => button.dataset.tag)
    }

    function syncFilterUrl(query, selectedTags) {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      if (query) searchParams.set('q', query)
      else searchParams.delete('q')
      if (selectedTags.length) searchParams.set('tag', selectedTags.join(','))
      else searchParams.delete('tag')
      history.replaceState(null, '', url)
    }

    function applyContentFilters({ updateUrl = true } = {}) {
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
      if (updateUrl) syncFilterUrl(query, selectedTags)
    }

    function clearContentFilters() {
      searchInput.value = ''
      tagFilter.querySelectorAll('[data-tag]').forEach((button) => {
        button.setAttribute('aria-pressed', 'false')
        button.classList.remove('is-selected')
      })
      applyContentFilters()
      searchInput.focus()
    }

    const initialParams = new URLSearchParams(window.location.search)
    searchInput.value = initialParams.get('q') || ''
    const initialTags = (initialParams.get('tag') || '').split(',').filter(Boolean)
    tagFilter.querySelectorAll('[data-tag]').forEach((button) => {
      const selected = initialTags.includes(button.dataset.tag)
      button.setAttribute('aria-pressed', String(selected))
      button.classList.toggle('is-selected', selected)
    })

    searchInput.addEventListener('input', () => applyContentFilters())
    tagFilter.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tag]')
      if (!button) return
      const selected = button.getAttribute('aria-pressed') !== 'true'
      button.setAttribute('aria-pressed', String(selected))
      button.classList.toggle('is-selected', selected)
      applyContentFilters()
    })
    document.querySelectorAll('[data-filter-clear]').forEach((button) => button.addEventListener('click', clearContentFilters))
    applyContentFilters({ updateUrl: false })
  }

  /* 文章页：阅读进度、目录跟随和移动目录抽屉。 */
  const articleBody = document.querySelector('[data-article-body]')
  if (articleBody) {
    const progressBar = document.querySelector('[data-reading-progress]')
    const progressText = document.querySelector('[data-reading-percent]')
    const tocLinks = Array.from(document.querySelectorAll('[data-toc] a, [data-toc-drawer] a'))
    const headings = Array.from(articleBody.querySelectorAll('h2[id], h3[id]'))

    function updateReadingProgress() {
      const rect = articleBody.getBoundingClientRect()
      const start = window.scrollY + rect.top - window.innerHeight * 0.25
      const end = start + articleBody.offsetHeight - window.innerHeight * 0.5
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)))
      const percent = Math.round(progress * 100)
      if (progressBar) progressBar.style.width = `${percent}%`
      if (progressText) progressText.textContent = `${percent}%`
    }

    updateReadingProgress()
    window.addEventListener('scroll', updateReadingProgress, { passive: true })
    window.addEventListener('resize', updateReadingProgress)

    if (headings.length && 'IntersectionObserver' in window) {
      const headingObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (!visible.length) return
        const activeId = visible[0].target.id
        tocLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${activeId}`) link.setAttribute('aria-current', 'location')
          else link.removeAttribute('aria-current')
        })
      }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 1] })
      headings.forEach((heading) => headingObserver.observe(heading))
    }

    const tocToggle = document.querySelector('[data-toc-toggle]')
    const tocDrawer = document.querySelector('[data-toc-drawer]')
    const tocOverlay = document.querySelector('[data-toc-overlay]')
    const tocClose = document.querySelector('[data-toc-close]')

    function setTocDrawer(isOpen) {
      setDrawerState(tocDrawer, tocOverlay, tocToggle, isOpen)
    }

    if (!headings.length) tocToggle?.closest('.mobile-toc-bar')?.setAttribute('hidden', '')
    tocToggle?.addEventListener('click', () => setTocDrawer(true))
    tocClose?.addEventListener('click', () => setTocDrawer(false))
    tocOverlay?.addEventListener('click', () => setTocDrawer(false))
    tocDrawer?.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) setTocDrawer(false)
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && tocDrawer?.classList.contains('is-open')) setTocDrawer(false)
    })
  }

  const publishButton = document.querySelector('[data-publish-note]')
  const confirmDialog = document.querySelector('[data-confirm-dialog]')
  const cancelPublish = document.querySelector('[data-confirm-cancel]')
  const confirmPublish = document.querySelector('[data-confirm-publish]')
  publishButton?.addEventListener('click', () => confirmDialog?.showModal())
  cancelPublish?.addEventListener('click', () => confirmDialog?.close())
  confirmPublish?.addEventListener('click', () => {
    const status = document.querySelector('[data-note-status]')
    if (status) status.textContent = '已转为公开博客'
    publishButton.textContent = '已转公开'
    publishButton.disabled = true
    confirmDialog.close()
  })

  /* 登录页：本地演示完整表单状态。 */
  const loginForm = document.querySelector('[data-login-form]')
  if (loginForm) {
    const passwordInput = loginForm.querySelector('#password')
    const passwordToggle = loginForm.querySelector('[data-password-toggle]')
    const submitButton = loginForm.querySelector('[data-login-submit]')
    const submitLabel = loginForm.querySelector('[data-submit-label]')
    const formError = loginForm.querySelector('[data-form-error]')

    function togglePasswordVisibility() {
      const isVisible = passwordInput.type === 'text'
      passwordInput.type = isVisible ? 'password' : 'text'
      passwordToggle.textContent = isVisible ? '显示密码' : '隐藏密码'
      passwordToggle.setAttribute('aria-pressed', String(!isVisible))
      passwordInput.focus()
    }

    function setLoginLoading(isLoading) {
      submitButton.disabled = isLoading
      submitLabel.textContent = isLoading ? '验证中…' : '进入私密档案'
      loginForm.setAttribute('aria-busy', String(isLoading))
    }

    function setLoginError(message = '') {
      formError.textContent = message
      formError.hidden = message === ''
    }

    passwordToggle.addEventListener('click', togglePasswordVisibility)
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      setLoginError()
      if (!loginForm.reportValidity()) return
      setLoginLoading(true)
      window.setTimeout(() => {
        const username = loginForm.elements.username.value.trim()
        if (username === 'demo-error') {
          setLoginLoading(false)
          setLoginError('账号或密码不正确，请检查后重试。')
          loginForm.elements.username.focus()
          return
        }
        window.location.href = 'index.html'
      }, 500)
    })
  }
})()
