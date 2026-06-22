import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '~/server/utils/password'

describe('password', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    expect(hash).not.toBe('correct-horse-battery-staple')
    expect(await verifyPassword('correct-horse-battery-staple', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})
