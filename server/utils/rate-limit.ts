const MAX_FAILURES = 5
const LOCK_DURATION_MS = 30 * 60 * 1000

export class LoginRateLimiter {
  private failures = new Map<string, { count: number, lockedUntil?: number }>()

  isLocked(key: string): boolean {
    const entry = this.failures.get(key)
    if (!entry?.lockedUntil) return false
    if (Date.now() >= entry.lockedUntil) {
      this.failures.delete(key)
      return false
    }
    return true
  }

  recordFailure(key: string) {
    const entry = this.failures.get(key) ?? { count: 0 }
    entry.count += 1
    if (entry.count >= MAX_FAILURES) entry.lockedUntil = Date.now() + LOCK_DURATION_MS
    this.failures.set(key, entry)
  }

  recordSuccess(key: string) {
    this.failures.delete(key)
  }
}

let _instance: LoginRateLimiter | null = null
export function useLoginRateLimiter() {
  if (!_instance) _instance = new LoginRateLimiter()
  return _instance
}
