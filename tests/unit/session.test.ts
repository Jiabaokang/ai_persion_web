import { describe, it, expect } from 'vitest'
import { generateSessionId, hashSessionId } from '~/server/utils/session'

describe('session', () => {
  it('generates 64-char hex id', () => {
    const id = generateSessionId()
    expect(id).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashes session id deterministically', () => {
    const id = 'abc123'
    expect(hashSessionId(id)).toBe(hashSessionId(id))
    expect(hashSessionId(id)).not.toBe(id)
  })
})
