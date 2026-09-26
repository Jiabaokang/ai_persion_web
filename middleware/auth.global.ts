export default defineNuxtRouteMiddleware(async (to) => {
  // 笔记可公开阅读；私密内容仍由服务端逐条校验，写作区域要求登录。
  const protectedPaths = ['/inspiration', '/admin']
  if (!protectedPaths.some(p => to.path.startsWith(p))) return
  const { user, fetchMe } = useAuth()
  if (!user.value) await fetchMe()
  if (!user.value) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
