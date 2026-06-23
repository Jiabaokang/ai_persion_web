<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: '登录 · 智识花园',
})

const { login } = useAuth()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const shake = ref(false)
const loading = ref(false)

// 实时校验：空字段时禁用提交
const canSubmit = computed(
  () => username.value.trim().length > 0 && password.value.length > 0,
)

async function submit() {
  if (!canSubmit.value || loading.value) return
  error.value = ''
  loading.value = true
  try {
    await login(username.value.trim(), password.value)
    await navigateTo('/admin')
  }
  catch (e: any) {
    // 友好错误映射：避免暴露后端实现
    const status = e?.response?.status ?? e?.statusCode
    if (status === 401 || status === 400) {
      error.value = '用户名或密码不正确'
    }
    else if (!status) {
      error.value = '网络异常，请检查连接后重试'
    }
    else {
      error.value = '登录失败，请稍后重试'
    }
    triggerShake()
  }
  finally {
    loading.value = false
  }
}

function triggerShake() {
  shake.value = true
  setTimeout(() => (shake.value = false), 420)
}

// 输入时自动清除错误，避免错误信息粘连
watch([username, password], () => {
  if (error.value) error.value = ''
})
</script>

<template>
  <div class="login-page">
    <!-- 极光背景（与全站一致） -->
    <div
      class="aurora-bg"
      aria-hidden="true"
    >
      <span />
    </div>

    <!-- 顶部返回链接，避免用户卡死 -->
    <header class="login-top">
      <NuxtLink
        to="/"
        class="back-link"
        aria-label="返回首页"
      >
        <svg
          class="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>返回首页</span>
      </NuxtLink>
    </header>

    <!-- 登录卡片 -->
    <main class="login-main">
      <div
        class="glass-strong login-card"
        :class="{ 'is-shaking': shake }"
      >
        <!-- 品牌头 -->
        <div class="login-brand">
          <div class="login-brand-mark">
            智
          </div>
          <h1 class="login-title gradient-text">
            欢迎回来
          </h1>
          <p class="login-subtitle">
            登录智识花园，管理你的内容
          </p>
        </div>

        <!-- 表单 -->
        <form
          class="login-form"
          novalidate
          @submit.prevent="submit"
        >
          <!-- 用户名 -->
          <label class="field">
            <span class="field-label">用户名</span>
            <div class="field-control">
              <svg
                class="field-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
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
                class="field-input"
              >
            </div>
          </label>

          <!-- 密码 -->
          <label class="field">
            <span class="field-label">密码</span>
            <div class="field-control">
              <svg
                class="field-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                placeholder="请输入密码"
                :disabled="loading"
                class="field-input has-suffix"
              >
              <button
                type="button"
                class="field-suffix"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </label>

          <!-- 错误提示 -->
          <Transition name="error">
            <div
              v-if="error"
              class="login-error"
              role="alert"
            >
              <svg
                class="field-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{{ error }}</span>
            </div>
          </Transition>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="!canSubmit || loading"
            class="submit-btn"
          >
            <svg
              v-if="loading"
              class="spinner"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>{{ loading ? '登录中…' : '登 录' }}</span>
          </button>
        </form>

        <!-- 底部提示 -->
        <p class="login-footer">
          忘记密码？请通过服务器命令重置 ·
          <NuxtLink
            to="/"
            class="login-footer-link"
          >
            或继续浏览
          </NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* 顶部 */
.login-top {
  padding: 1.25rem 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-decoration: none;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  transition: color var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}
.back-link:hover {
  color: var(--text-primary);
  border-color: var(--glass-border-strong);
  transform: translateX(-2px);
}

.back-link .icon {
  width: 16px;
  height: 16px;
}

/* 主容器 */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1.5rem 4rem;
}

/* 卡片 */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  animation: card-in 0.5s var(--ease-out) both;
}
@media (min-width: 480px) {
  .login-card {
    padding: 2.75rem 2.5rem;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.login-card.is-shaking {
  animation: shake 0.42s var(--ease-out);
}
@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-7px); }
  40%, 60% { transform: translateX(7px); }
}

/* 品牌头 */
.login-brand {
  text-align: center;
  margin-bottom: 1.75rem;
}
.login-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--gradient-aurora);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  box-shadow: var(--shadow-glow-purple);
  margin-bottom: 1rem;
}
.login-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.875rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 0.5rem;
}
.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin: 0;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

.field-control {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  transition: border-color var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    background var(--duration-base) var(--ease-out);
}
.field-control:hover {
  border-color: var(--glass-border-strong);
}
.field-control:focus-within {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12),
    0 0 24px rgba(34, 211, 238, 0.18);
  background: var(--glass-bg-strong);
}

.field-icon {
  margin-left: 0.875rem;
  color: var(--text-muted);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.875rem 0.875rem 0.875rem 0.625rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.4;
}
.field-input.has-suffix {
  padding-right: 0.25rem;
}
.field-input::placeholder {
  color: var(--text-faint);
}
.field-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* 修正 Chrome autofill 蓝色背景 */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--text-primary);
  caret-color: var(--text-primary);
  transition: background-color 9999s ease-out 0s;
}

.field-suffix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-right: 0.25rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-base) var(--ease-out),
    background var(--duration-base) var(--ease-out);
}
.field-suffix:hover {
  color: var(--text-primary);
  background: var(--glass-border);
}
.field-suffix svg {
  width: 18px;
  height: 18px;
}

/* 错误 */
.login-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-sm);
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.3);
  color: #fda4d3;
  font-size: 0.8125rem;
  line-height: 1.5;
}
[data-theme='light'] .login-error {
  background: rgba(236, 72, 153, 0.08);
  color: #be185d;
}
.login-error .field-icon {
  margin-left: 0;
  margin-top: 1px;
  width: 16px;
  height: 16px;
  color: inherit;
  flex-shrink: 0;
}
.error-enter-active,
.error-leave-active {
  transition: opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}
.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 提交按钮 */
.submit-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--gradient-aurora);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    opacity var(--duration-base) var(--ease-out);
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
}
.submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.5),
    var(--shadow-glow-cyan);
}
.submit-btn:not(:disabled):active {
  transform: translateY(0);
}
.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部提示 */
.login-footer {
  margin: 1.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.8125rem;
  text-align: center;
  line-height: 1.6;
}
.login-footer-link {
  color: var(--accent-cyan);
  text-decoration: none;
  transition: color var(--duration-base) var(--ease-out);
}
.login-footer-link:hover {
  color: var(--accent-purple);
}

/* 无动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .login-card,
  .login-card.is-shaking,
  .submit-btn,
  .back-link {
    animation: none !important;
    transition: none !important;
  }
}
</style>
