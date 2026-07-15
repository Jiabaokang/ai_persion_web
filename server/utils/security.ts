export const MAX_MUTATION_BODY_BYTES = 256 * 1024

const DEFAULT_CSP = [
  'default-src \'self\'',
  'base-uri \'self\'',
  'object-src \'none\'',
  'frame-ancestors \'none\'',
  'form-action \'self\'',
  'img-src \'self\' https: data:',
  'font-src \'self\' data:',
  'style-src \'self\' \'unsafe-inline\'',
  'script-src \'self\' \'unsafe-inline\'',
  'connect-src \'self\'',
].join('; ')

export function isSafeProductionBootstrap(username: string, password: string): boolean {
  return Boolean(username.trim()) && password.length >= 16 && password !== 'admin123'
}

export interface MutationRequestMeta {
  origin?: string
  expectedOrigin: string
  contentType?: string
  contentLength?: string
}

export function assertValidMutationRequest(request: MutationRequestMeta) {
  if (!request.origin || request.origin !== request.expectedOrigin) {
    throw new Error('Invalid request origin')
  }

  if (!request.contentType?.toLowerCase().startsWith('application/json')) {
    throw new Error('Content-Type must be application/json')
  }

  const contentLength = Number(request.contentLength)
  if (!Number.isInteger(contentLength) || contentLength < 0 || contentLength > MAX_MUTATION_BODY_BYTES) {
    throw new Error('Request body too large')
  }
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'content-security-policy': DEFAULT_CSP,
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  }
}
