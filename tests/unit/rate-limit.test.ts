import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginRateLimiter } from '~/server/utils/rate-limit'

describe('LoginRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('locks after 5 failures', () => {
    const rl = new LoginRateLimiter()
    for (let i = 0; i < 5; i++) rl.recordFailure('user')
    expect(rl.isLocked('user')).toBe(true)
  })

  it('unlocks after 30 minutes', () => {
    const rl = new LoginRateLimiter()
    for (let i = 0; i < 5; i++) rl.recordFailure('user')
    vi.advanceTimersByTime(31 * 60 * 1000)
    expect(rl.isLocked('user')).toBe(false)
  })

  it('resets on success', () => {
    const rl = new LoginRateLimiter()
    rl.recordFailure('user')
    rl.recordSuccess('user')
    for (let i = 0; i < 4; i++) rl.recordFailure('user')
    expect(rl.isLocked('user')).toBe(false)
  })
})
