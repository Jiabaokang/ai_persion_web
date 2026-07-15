const MAX_FAILURES = 5
const LOCK_DURATION_MS = 30 * 60 * 1000

export class LoginRateLimiter {
  private failures = new Map<string, { count: number, lockedUntil?: number }>()

  constructor(private readonly options: { maxEntries?: number } = {}) {}

  get size() {
    return this.failures.size
  }

  has(key: string) {
    return this.failures.has(key)
  }

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
    this.failures.delete(key)
    entry.count += 1
    if (entry.count >= MAX_FAILURES) entry.lockedUntil = Date.now() + LOCK_DURATION_MS
    this.failures.set(key, entry)
    this.trim()
  }

  recordSuccess(key: string) {
    this.failures.delete(key)
  }

  private trim() {
    const maxEntries = this.options.maxEntries ?? 10_000
    while (this.failures.size > maxEntries) {
      const oldest = this.failures.keys().next().value
      if (!oldest) return
      this.failures.delete(oldest)
    }
  }
}

export class RequestRateLimiter {
  private requests = new Map<string, { count: number, resetAt: number }>()

  constructor(private readonly limit = 120, private readonly windowMs = 60_000, private readonly maxEntries = 10_000) {}

  allow(key: string, now = Date.now()) {
    const existing = this.requests.get(key)
    if (!existing || now >= existing.resetAt) {
      this.requests.delete(key)
      this.requests.set(key, { count: 1, resetAt: now + this.windowMs })
      this.trim()
      return true
    }
    existing.count += 1
    return existing.count <= this.limit
  }

  private trim() {
    while (this.requests.size > this.maxEntries) {
      const oldest = this.requests.keys().next().value
      if (!oldest) return
      this.requests.delete(oldest)
    }
  }
}

let _instance: LoginRateLimiter | null = null
export function useLoginRateLimiter() {
  if (!_instance) _instance = new LoginRateLimiter()
  return _instance
}

let _apiInstance: RequestRateLimiter | null = null
export function useApiRateLimiter() {
  if (!_apiInstance) _apiInstance = new RequestRateLimiter()
  return _apiInstance
}
