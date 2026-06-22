// 智识花园 - 健康检查 API
//
// 调用 server/utils/health.ts 的纯函数
// 用于验证 Nitro 服务运行状态，部署时供监控/负载均衡调用
// server/utils/* 在 Nitro 中自动导入，无需显式 import

export default defineEventHandler(() => getHealthStatus())
