<script setup lang="ts">
definePageMeta({ layout: false })

useHead({ title: '登录 · 智识花园' })

const { login } = useAuth()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const shake = ref(false)
const loading = ref(false)

const canSubmit = computed(() =>
  username.value.trim().length > 0 && password.value.length > 0,
)

// 提交登录凭据并将错误映射为不会暴露服务端细节的提示。
async function submit() {
  if (!canSubmit.value || loading.value) return
  error.value = ''
  loading.value = true

  try {
    await login(username.value.trim(), password.value)
    await navigateTo('/admin')
  }
  catch (caught: any) {
    const status = caught?.response?.status ?? caught?.statusCode
    if (status === 401 || status === 400) error.value = '用户名或密码不正确'
    else if (!status) error.value = '网络异常，请检查连接后重试'
    else error.value = '登录失败，请稍后重试'
    triggerShake()
  }
  finally {
    loading.value = false
  }
}

// 短暂抖动纸面表单，让错误反馈在不依赖颜色时仍清晰可见。
function triggerShake() {
  shake.value = true
  setTimeout(() => {
    shake.value = false
  }, 420)
}

watch([username, password], () => {
  if (error.value) error.value = ''
})
</script>

<template>
  <!-- 暖纸登录页：真实水墨植物辅助区与单张登录纸面并置。 -->
  <div class="login-page">
    <header class="login-top">
      <NuxtLink
        to="/"
        class="login-back"
        aria-label="返回首页"
      >
        <span
          class="i-carbon-arrow-left"
          aria-hidden="true"
        />
        返回智识花园
      </NuxtLink>
      <span>Private writing desk</span>
    </header>

    <main class="login-main">
      <section
        class="login-illustration"
        aria-label="智识花园登录引言"
      >
        <div class="login-illustration__copy">
          <span
            class="login-seal"
            aria-hidden="true"
          >智</span>
          <p class="paper-kicker">
            Editorial archive
          </p>
          <h1>回到你的<br>写作桌前。</h1>
          <blockquote>“留下来的文字，会在下一次翻阅时继续生长。”</blockquote>
        </div>
        <img
          src="/images/ink-plant.webp"
          alt="淡墨植物枝叶"
          class="login-plant"
        >
      </section>

      <section
        class="login-sheet"
        :class="{ 'is-shaking': shake }"
        aria-labelledby="login-title"
      >
        <div class="login-sheet__head">
          <p class="paper-kicker">
            Member access
          </p>
          <h2 id="login-title">
            欢迎回来
          </h2>
          <p>登录后继续整理笔记、灵感与文章。</p>
        </div>

        <form
          class="login-form"
          novalidate
          @submit.prevent="submit"
        >
          <label class="login-field">
            <span>用户名</span>
            <span class="login-field__control">
              <span
                class="i-carbon-user"
                aria-hidden="true"
              />
              <input
                v-model="username"
                type="text"
                name="username"
                autocomplete="username"
                autocapitalize="off"
                spellcheck="false"
                autofocus
                placeholder="请输入用户名"
                :disabled="loading"
              >
            </span>
          </label>

          <label class="login-field">
            <span>密码</span>
            <span class="login-field__control">
              <span
                class="i-carbon-locked"
                aria-hidden="true"
              />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                placeholder="请输入密码"
                :disabled="loading"
              >
              <button
                type="button"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <span
                  :class="showPassword ? 'i-carbon-view-off' : 'i-carbon-view'"
                  aria-hidden="true"
                />
              </button>
            </span>
          </label>

          <Transition name="login-error">
            <p
              v-if="error"
              class="login-message"
              role="alert"
            >
              <span
                class="i-carbon-warning-alt"
                aria-hidden="true"
              />
              {{ error }}
            </p>
          </Transition>

          <button
            type="submit"
            class="login-submit"
            :disabled="!canSubmit || loading"
          >
            <span
              v-if="loading"
              class="i-carbon-progress-bar-round login-spin"
              aria-hidden="true"
            />
            {{ loading ? '登录中…' : '进入写作后台' }}
            <span
              v-if="!loading"
              aria-hidden="true"
            >→</span>
          </button>
        </form>

        <p class="login-sheet__foot">
          忘记密码？请通过服务器命令重置 · <NuxtLink to="/">继续浏览</NuxtLink>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-page { min-height: 100vh; min-height: 100dvh; background: var(--paper-base) url('/images/paper-texture.webp') repeat; background-size: 1024px auto; color: var(--ink-primary); }
.login-top { display: flex; min-height: 72px; align-items: center; justify-content: space-between; gap: 20px; padding: 0 clamp(18px, 4vw, 54px); border-bottom: 1px solid var(--rule-color); color: var(--ink-muted); font-size: 0.7rem; letter-spacing: 0.08em; }
.login-back { display: inline-flex; min-height: 44px; align-items: center; gap: 8px; color: var(--ink-secondary); font-size: 0.78rem; letter-spacing: 0; }
.login-back:hover { color: var(--accent-terracotta-dark); }
.login-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(400px, 520px); min-height: calc(100vh - 72px); }
.login-illustration { position: relative; display: flex; min-height: 650px; align-items: center; padding: clamp(40px, 8vw, 110px); overflow: hidden; border-right: 1px solid var(--rule-color); }
.login-illustration__copy { position: relative; z-index: 1; max-width: 580px; }
.login-seal { display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; margin-bottom: 40px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-family: var(--font-display); font-weight: 700; }
.login-illustration h1 { margin-top: 10px; font-size: clamp(3.4rem, 8vw, 7.6rem); font-weight: 500; line-height: 1.02; letter-spacing: -0.06em; }
.login-illustration blockquote { max-width: 30em; margin: 42px 0 0; padding-left: 18px; border-left: 2px solid var(--accent-moss); color: var(--ink-secondary); font-family: var(--font-display); line-height: 1.9; }
.login-plant { position: absolute; right: -15%; bottom: -12%; width: min(800px, 80%); mix-blend-mode: multiply; opacity: 0.32; pointer-events: none; }
.login-sheet { align-self: center; margin: 46px clamp(24px, 5vw, 64px); padding: clamp(28px, 5vw, 48px); border: 1px solid var(--rule-strong); border-radius: var(--radius-md); background: rgba(248, 242, 231, 0.9); box-shadow: var(--shadow-soft); }
.login-sheet__head { padding-bottom: 26px; border-bottom: 1px solid var(--rule-color); }
.login-sheet__head h2 { margin-top: 7px; font-size: clamp(2.1rem, 4vw, 3.25rem); font-weight: 500; }
.login-sheet__head > p:last-child { margin: 10px 0 0; color: var(--ink-secondary); font-size: 0.85rem; }
.login-form { display: grid; gap: 20px; padding-top: 28px; }
.login-field { display: grid; gap: 8px; color: var(--ink-secondary); font-size: 0.78rem; font-weight: 650; }
.login-field__control { display: flex; min-height: 50px; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); background: var(--paper-surface); color: var(--ink-muted); }
.login-field__control:focus-within { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.login-field input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink-primary); }
.login-field button { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; color: var(--ink-muted); }
.login-message { display: flex; gap: 8px; margin: 0; padding: 10px 12px; border-left: 3px solid var(--accent-terracotta); background: var(--paper-muted); color: var(--accent-terracotta-dark); font-size: 0.78rem; }
.login-submit { display: flex; min-height: 50px; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-weight: 700; }
.login-submit:not(:disabled):hover { background: var(--accent-terracotta-dark); }
.login-submit:disabled { cursor: not-allowed; opacity: 0.5; }
.login-sheet__foot { margin: 24px 0 0; color: var(--ink-muted); font-size: 0.68rem; line-height: 1.6; }
.login-sheet__foot a { color: var(--accent-terracotta-dark); text-decoration: underline; text-underline-offset: 3px; }
.login-sheet.is-shaking { animation: login-shake 0.42s var(--ease-out); }
.login-spin { animation: login-spin 0.9s linear infinite; }
.login-error-enter-active,
.login-error-leave-active { transition: opacity 0.2s, transform 0.2s; }
.login-error-enter-from,
.login-error-leave-to { opacity: 0; transform: translateY(-4px); }
@keyframes login-shake { 20%, 80% { transform: translateX(4px); } 40%, 60% { transform: translateX(-6px); } }
@keyframes login-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) {
  .login-main { grid-template-columns: 1fr; }
  .login-illustration { display: none; }
  .login-sheet { width: min(100% - 32px, 480px); margin: 48px auto; }
}
@media (prefers-reduced-motion: reduce) { .login-sheet.is-shaking { animation: none; } }
</style>
