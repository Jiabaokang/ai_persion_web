import { useRoute } from 'vue-router'

export type PublicNavigationItem = {
  to: string
  label: string
  description: string
  icon: string
}

export const publicNavigation: PublicNavigationItem[] = [
  { to: '/ai', label: 'AI 资讯', description: '追踪值得关注的技术动向', icon: 'i-carbon-ibm-watson-discovery' },
  { to: '/notes', label: '笔记', description: '记录实践中的发现', icon: 'i-carbon-notebook' },
  { to: '/blog', label: '文章', description: '读一些完整的思考', icon: 'i-carbon-document' },
  { to: '/inspiration', label: '灵感', description: '收集一闪而过的想法', icon: 'i-carbon-idea' },
  { to: '/wechat', label: '公众号', description: '在微信继续阅读', icon: 'i-carbon-chat' },
]

// 提供公共导航数据与当前路由高亮判断
export function usePublicNavigation() {
  const route = useRoute()

  // 判断导航项是否覆盖当前页面或其子页面
  function isActive(path: string) {
    if (path === '/ai' && route.path === '/') return true
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  return { links: publicNavigation, isActive }
}
