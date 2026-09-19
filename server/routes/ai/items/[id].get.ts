// 旧的 /ai/items/:id 详情入口已迁移到 /ai/:id，保留 301 兼容历史分享链接。
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') ?? ''
  return sendRedirect(event, `/ai/${encodeURIComponent(id)}`, 301)
})
