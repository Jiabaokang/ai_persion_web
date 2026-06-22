export default defineNuxtRouteMiddleware(async (to) => {
  const protectedPaths = ['/notes', '/inspiration', '/admin']
  if (!protectedPaths.some(p => to.path.startsWith(p))) return
  const { user, fetchMe } = useAuth()
  if (!user.value) await fetchMe()
  if (!user.value) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
