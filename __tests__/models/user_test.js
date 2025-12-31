/**
 * @jest-environment jsdom
 */

import { Cookies, User } from '../../src/models'

beforeEach(() => {
  document.cookie = 'hello_user_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'hello_user_source=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
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

  describe('persist', () => {
    it('sets both user_id and source when both provided', () => {
      User.persist('user_123', 'shopify')

      expect(User.id).toEqual('user_123')
      expect(User.source).toEqual('shopify')
    })

    it('sets only user_id when source is falsy', () => {
      User.persist('user_456', undefined)

      expect(User.id).toEqual('user_456')
      expect(User.source).toBeUndefined()
    })

    it('updates existing cookies', () => {
      User.persist('user_old', 'shopify')
      User.persist('user_new', 'woocommerce')

      expect(User.id).toEqual('user_new')
      expect(User.source).toEqual('woocommerce')
    })
  })

  describe('forget', () => {
    it('removes user cookies', () => {
      User.persist('user_789', 'shopify')
      User.forget()

      expect(User.id).toBeUndefined()
      expect(User.source).toBeUndefined()
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
      User.persist('user_111', 'shopify')

      expect(User.identificationData).toEqual({
        user_id: 'user_111',
        source: 'shopify'
      })
    })

    it('returns empty object when only source set', () => {
      Cookies.set('hello_user_source', 'shopify')
      expect(User.identificationData).toEqual({})
    })

    it('includes undefined source when not provided', () => {
      User.persist('user_222')

      expect(User.identificationData).toEqual({
        user_id: 'user_222',
        source: undefined
      })
    })
  })
})
