import { describe, expect, it } from 'vitest'
import {
  MAX_MUTATION_BODY_BYTES,
  assertValidMutationRequest,
  getSecurityHeaders,
  isSafeProductionBootstrap,
} from '~/server/utils/security'

describe('security hardening', () => {
  it('rejects production bootstrap credentials that are missing or default', () => {
    expect(isSafeProductionBootstrap('', '')).toBe(false)
    expect(isSafeProductionBootstrap('admin', 'admin123')).toBe(false)
    expect(isSafeProductionBootstrap('writer', 'a-long-unique-password')).toBe(true)
  })

  it('requires same-origin JSON mutations within the body-size limit', () => {
    expect(() => assertValidMutationRequest({
      origin: 'https://jbksy.cn',
      expectedOrigin: 'https://jbksy.cn',
      contentType: 'application/json; charset=utf-8',
      contentLength: String(MAX_MUTATION_BODY_BYTES),
    })).not.toThrow()

    expect(() => assertValidMutationRequest({
      origin: 'https://attacker.example',
      expectedOrigin: 'https://jbksy.cn',
      contentType: 'application/json',
      contentLength: '10',
    })).toThrow('Invalid request origin')

    expect(() => assertValidMutationRequest({
      origin: 'https://jbksy.cn',
      expectedOrigin: 'https://jbksy.cn',
      contentType: 'text/plain',
      contentLength: '10',
    })).toThrow('Content-Type must be application/json')

    expect(() => assertValidMutationRequest({
      origin: 'https://jbksy.cn',
      expectedOrigin: 'https://jbksy.cn',
      contentType: 'application/json',
      contentLength: String(MAX_MUTATION_BODY_BYTES + 1),
    })).toThrow('Request body too large')
  })

  it('returns protective headers without enabling unsafe object embedding', () => {
    const headers = getSecurityHeaders()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['content-security-policy']).toContain('object-src \'none\'')
    expect(headers['content-security-policy']).toContain('frame-ancestors \'none\'')
  })
})
