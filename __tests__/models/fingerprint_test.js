/**
 * @jest-environment jsdom
 */

import { Fingerprint } from '../../src/models'

describe('Fingerprint', () => {
  it('matches when nested object keys are reordered', async () => {
    const storedFingerprint = await Fingerprint.generate('session_123', 'user_123', {
      tags: ['vip', 'repeat'],
      shopify: {
        customer: {
          email: 'customer@example.com',
          phone: '+1234567890',
        },
        domain: 'example.myshopify.com',
      },
    })

    const fingerprint = await Fingerprint.generate('session_123', 'user_123', {
      shopify: {
        domain: 'example.myshopify.com',
        customer: {
          phone: '+1234567890',
          email: 'customer@example.com',
        },
      },
      tags: ['vip', 'repeat'],
    })

    expect(
      Fingerprint.matches(storedFingerprint, fingerprint),
    ).toEqual(true)
  })

  it('does not match when array order changes', async () => {
    const storedFingerprint = await Fingerprint.generate('session_123', 'user_123', {
      tags: ['vip', 'repeat'],
    })

    const fingerprint = await Fingerprint.generate('session_123', 'user_123', {
      tags: ['repeat', 'vip'],
    })

    expect(
      Fingerprint.matches(storedFingerprint, fingerprint),
    ).toEqual(false)
  })

  it('treats blank strings as omitted values', async () => {
    const storedFingerprint = await Fingerprint.generate('session_123', 'user_123', {
      email: 'customer@example.com',
      phone: '',
      shopify: {
        domain: 'example.myshopify.com',
      },
    })

    const fingerprint = await Fingerprint.generate('session_123', 'user_123', {
      shopify: {
        domain: 'example.myshopify.com',
      },
      email: 'customer@example.com',
    })

    expect(
      Fingerprint.matches(storedFingerprint, fingerprint),
    ).toEqual(true)
  })

  it('does not match when the session changes', async () => {
    const storedFingerprint = await Fingerprint.generate('session_123', 'user_123', {
      email: 'customer@example.com',
    })

    const fingerprint = await Fingerprint.generate('session_456', 'user_123', {
      email: 'customer@example.com',
    })

    expect(
      Fingerprint.matches(storedFingerprint, fingerprint),
    ).toEqual(false)
  })

  it('does not match when the stored fingerprint is missing', async () => {
    const fingerprint = await Fingerprint.generate('session_123', 'user_123', {
      shopify: {
        domain: 'example.myshopify.com',
      },
    })

    expect(
      Fingerprint.matches(undefined, fingerprint),
    ).toEqual(false)
  })
})
