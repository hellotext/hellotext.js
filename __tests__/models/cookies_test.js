/**
 * @jest-environment jsdom
 */

import { Cookies } from '../../src/models/cookies'

beforeEach(() => {
  document.cookie = ''
})

describe('set', () => {
  it('sets the value of a cookie', () => {
    expect(Cookies.get('hello_session')).toEqual(undefined)

    Cookies.set('hello_session', 'session')
    expect(Cookies.get('hello_session')).toEqual('session')
  })
})

describe('get', () => {
  it('gets the value of a cookie', () => {
    document.cookie = 'hello_session=session'
    expect(Cookies.get('hello_session')).toEqual('session')
  })
})
