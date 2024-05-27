/**
 * @jest-environment jsdom
 */


import { Business } from '../../src/models/business'

describe('enabledWhitelist', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue({}) })
  })

  it('is true when the whitelist is an array', () => {
    const business = new Business('123')
    business.data = { whitelist: ['www.example.com'] }

    expect(business.enabledWhitelist).toEqual(true)
  })

  it('is false when the whitelist is a string', () => {
    const business = new Business('123')
    business.data = { whitelist: 'disabled' }

    expect(business.enabledWhitelist).toEqual(false)
  })
})
