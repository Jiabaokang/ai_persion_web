// 智识花园 - 健康检查 API
// 用于验证 Nitro 服务运行状态，部署时供监控/负载均衡调用

export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
  }
})
