// 智识花园 - 健康检查工具（纯函数，便于单测）
//
// 与 server/api/health.get.ts 配套使用
// 业务逻辑放在 utils，handler 只做事件 → 响应的薄包装

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  uptime: number
  version: string
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
  }
}
