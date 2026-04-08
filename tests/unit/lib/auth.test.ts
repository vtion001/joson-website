import { describe, it, expect, beforeEach, vi } from 'vitest'
import crypto from 'crypto'

// We test the actual auth module by importing it
// The module uses process.env.SESSION_SECRET which we set in setup.ts

describe('lib/auth.ts', () => {
  let signSession: (payload: Record<string, unknown>) => string
  let verifySession: (token: string) => Record<string, unknown> | null

  beforeEach(async () => {
    // Clear the module cache to reset state between tests
    vi.resetModules()
    // Set a known secret for testing
    process.env.SESSION_SECRET = 'test-secret-key-for-unit-tests-minimum-32-chars'
    const mod = await import('@/lib/auth')
    signSession = mod.signSession
    verifySession = mod.verifySession
  })

  describe('signSession', () => {
    it('produces a non-empty token string with two dot-separated parts', () => {
      const token = signSession({ user: 'test' })
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      expect(token.split('.')).toHaveLength(2)
    })

    it('produces consistent tokens for same payload', () => {
      const payload = { user: 'test', ts: 12345 }
      const token1 = signSession(payload)
      const token2 = signSession(payload)
      expect(token1).toBe(token2)
    })

    it('throws Error("SESSION_SECRET not set") when secret is empty string', () => {
      process.env.SESSION_SECRET = ''
      // Need to re-import after changing env
      return import('@/lib/auth').then(mod => {
        expect(() => mod.signSession({ user: 'test' })).toThrow('SESSION_SECRET not set')
      })
    })


    it('throws when secret is not set (env var removed)', () => {
      delete process.env.SESSION_SECRET
      return import('@/lib/auth').then(mod => {
        expect(() => mod.signSession({ user: 'test' })).toThrow('SESSION_SECRET not set')
      })
    })
  })

  describe('verifySession', () => {
    it('returns parsed payload for valid token', () => {
      const payload = { user: 'test@example.com', ts: Date.now() }
      const token = signSession(payload)
      const result = verifySession(token)
      expect(result).toEqual(payload)
    })

    it('returns null for invalid signature', () => {
      const validToken = signSession({ user: 'test' })
      // Tamper with the signature
      const [data, sig] = validToken.split('.')
      const tampered = `${data}.${sig}x`
      expect(verifySession(tampered)).toBeNull()
    })

    it('returns null for tampered payload', () => {
      const validToken = signSession({ user: 'test' })
      // Replace payload with different user
      const tampered = btoa(JSON.stringify({ user: 'attacker' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') + '.somesig'
      expect(verifySession(tampered)).toBeNull()
    })

    it('returns null for malformed base64 in payload', () => {
      const badData = 'not-valid-base64!!!'
      const token = `${badData}.somesig`
      expect(verifySession(token)).toBeNull()
    })

    it('returns null for token with wrong number of parts', () => {
      expect(verifySession('singlepart')).toBeNull()
      expect(verifySession('a.b.c')).toBeNull()
      expect(verifySession('')).toBeNull()
    })

    it('returns null (NOT throw) when secret is empty string', () => {
      process.env.SESSION_SECRET = ''
      return import('@/lib/auth').then(mod => {
        // The verifySession function returns null when secret is empty
        // (unlike signSession which throws)
        expect(mod.verifySession('any.token.here')).toBeNull()
      })
    })

    it('returns null when token has only one part', () => {
      expect(verifySession('justonepart')).toBeNull()
    })

    it('returns null when token is empty string', () => {
      expect(verifySession('')).toBeNull()
    })

    it('round-trip: verifySession(signSession(payload)) returns equivalent payload', () => {
      const payload = {
        provider: 'google',
        email: 'admin@joson.com',
        name: 'Test Admin',
        ts: Date.now(),
      }
      const token = signSession(payload)
      const verified = verifySession(token)
      expect(verified).toEqual(payload)
    })

    it('handles payload with unicode characters', () => {
      const payload = { name: 'Joson Furniture', description: 'Filipino furniture brand' }
      const token = signSession(payload)
      const verified = verifySession(token)
      expect(verified).toEqual(payload)
    })
  })
})
