/**
 * @jest-environment jsdom
 */

import { Cookies, User } from '../../src/models'

beforeEach(() => {
  document.cookie = 'hello_user_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'hello_user_source=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'hello_user_identification_hash=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  jest.clearAllMocks()
})

describe('User', () => {
  describe('id', () => {
    it('returns undefined when not set', () => {
      expect(User.id).toBeUndefined()
    })

    it('returns the user id from cookie', () => {
      Cookies.set('hello_user_id', 'user_123')
      expect(User.id).toEqual('user_123')
    })
  })

  describe('source', () => {
    it('returns undefined when not set', () => {
      expect(User.source).toBeUndefined()
    })

    it('returns the source from cookie', () => {
      Cookies.set('hello_user_source', 'shopify')
      expect(User.source).toEqual('shopify')
    })
  })

  describe('fingerprint', () => {
    it('returns undefined when not set', () => {
      expect(User.fingerprint).toBeUndefined()
    })

    it('returns the fingerprint from cookie', () => {
      Cookies.set('hello_user_identification_hash', 'v1:fingerprint')
      expect(User.fingerprint).toEqual('v1:fingerprint')
    })
  })

  describe('remember', () => {
    it('sets user_id, source, and fingerprint when all are provided', () => {
      User.remember('user_123', 'shopify', 'v1:fingerprint')

      expect(User.id).toEqual('user_123')
      expect(User.source).toEqual('shopify')
      expect(User.fingerprint).toEqual('v1:fingerprint')
    })

    it('sets only user_id when source is falsy', () => {
      User.remember('user_456', undefined)

      expect(User.id).toEqual('user_456')
      expect(User.source).toBeUndefined()
      expect(User.fingerprint).toBeUndefined()
    })

    it('updates existing cookies', () => {
      User.remember('user_old', 'shopify', 'v1:old')
      User.remember('user_new', 'woocommerce', 'v1:new')

      expect(User.id).toEqual('user_new')
      expect(User.source).toEqual('woocommerce')
      expect(User.fingerprint).toEqual('v1:new')
    })
  })

  describe('forget', () => {
    it('removes user cookies', () => {
      User.remember('user_789', 'shopify', 'v1:fingerprint')
      User.forget()

      expect(User.id).toBeUndefined()
      expect(User.source).toBeUndefined()
      expect(User.fingerprint).toBeUndefined()
    })

    it('does not throw when no cookies exist', () => {
      expect(() => User.forget()).not.toThrow()
    })
  })

  describe('identificationData', () => {
    it('returns empty object when no user identified', () => {
      expect(User.identificationData).toEqual({})
    })

    it('returns user_id and source when both set', () => {
      User.remember('user_111', 'shopify')

      expect(User.identificationData).toEqual({
        id: 'user_111',
        source: 'shopify'
      })
    })

    it('returns empty object when only source set', () => {
      Cookies.set('hello_user_source', 'shopify')
      expect(User.identificationData).toEqual({})
    })

    it('includes undefined source when not provided', () => {
      User.remember('user_222')

      expect(User.identificationData).toEqual({
        id: 'user_222',
        source: undefined
      })
    })
  })
})
