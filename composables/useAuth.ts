export interface AuthUser { id: number, username: string }

export function useAuth() {
  const user = useState<AuthUser | null>('auth.user', () => null)

  async function login(username: string, password: string) {
    const result = await $fetch<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = result
    return result
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  async function fetchMe() {
    try {
      const nuxtApp = useNuxtApp()
      const fetcher = nuxtApp.ssrContext ? (useRequestFetch() as typeof $fetch) : $fetch
      user.value = await fetcher<AuthUser>('/api/auth/me')
    }
    catch {
      user.value = null
    }
    return user.value
  }

  return { user, login, logout, fetchMe }
}
