import { useRoute } from 'vue-router'

export type PublicNavigationItem = {
  to: string
  label: string
  icon: string
}

export const publicNavigation: PublicNavigationItem[] = [
  { to: '/ai', label: 'AI 导航', icon: 'i-carbon-ibm-watson-discovery' },
  { to: '/', label: '博客', icon: 'i-carbon-document' },
  { to: '/notes', label: '笔记', icon: 'i-carbon-notebook' },
  { to: '/inspiration', label: '灵感', icon: 'i-carbon-idea' },
  { to: '/wechat', label: '公众号', icon: 'i-carbon-chat' },
]

// 提供公共导航数据与当前路由高亮判断
export function usePublicNavigation() {
  const route = useRoute()

  // 判断导航项是否覆盖当前页面或其子页面
  function isActive(path: string) {
    if (path === '/') return route.path === '/' || route.path.startsWith('/blog/')
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  return { links: publicNavigation, isActive }
}
