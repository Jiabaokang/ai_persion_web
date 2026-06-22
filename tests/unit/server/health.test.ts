// 任务 3 - Vitest 示例测试 1：健康检查
// 验证 server/utils/health.ts 导出的纯函数行为

import { describe, it, expect } from 'vitest'
import { getHealthStatus } from '../../../server/utils/health'

describe('getHealthStatus', () => {
  it('返回 ok 状态', () => {
    const result = getHealthStatus()
    expect(result.status).toBe('ok')
  })

  it('返回 ISO 时间戳', () => {
    const result = getHealthStatus()
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('返回数字类型的 uptime', () => {
    const result = getHealthStatus()
    expect(typeof result.uptime).toBe('number')
    expect(result.uptime).toBeGreaterThan(0)
  })

  it('返回版本号 0.1.0', () => {
    const result = getHealthStatus()
    expect(result.version).toBe('0.1.0')
  })
})
