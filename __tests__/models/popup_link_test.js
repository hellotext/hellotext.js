/**
 * @jest-environment jsdom
 */

import { Popup } from '../../src/models/popup'

describe('Popup.linkedId', () => {
  const link = '?hello_session=session&hello_popup=popup-id'
  const originalLocation = window.location

  let navigationEntry

  const visit = ({ search, loadedWith = search, referrer = '', type = 'navigate', hostname = 'www.store.com' }) => {
    window.location = { search, hostname }
    navigationEntry = { name: `https://${hostname}/landing${loadedWith}`, type }
    Object.defineProperty(document, 'referrer', { value: referrer, configurable: true })

    return Popup.linkedId
  }

  beforeEach(() => {
    delete window.location
    window.performance.getEntriesByType = jest.fn(type => (type === 'navigation' ? [navigationEntry] : []))
  })

  afterEach(() => {
    window.location = originalLocation
    Object.defineProperty(document, 'referrer', { value: '', configurable: true })
  })

  it('opens the popup of a short link the visitor followed', () => {
    expect(visit({ search: link })).toEqual('popup-id')
  })

  it('opens the popup of a short link followed from another site', () => {
    expect(visit({ search: link, referrer: 'https://www.instagram.com/' })).toEqual('popup-id')
  })

  it('opens the popup of a short link opened from inside the store', () => {
    expect(visit({ search: link, referrer: 'https://www.store.com/products/shirt' })).toEqual('popup-id')
  })

  it('opens nothing without hello_popup', () => {
    expect(visit({ search: '?hello_session=session' })).toBeNull()
  })

  it.each(['../businesses/xy76ks', 'popup/id', 'popup id', 'popup?id=1', ''])(
    'ignores %p, which is not a public popup id',
    id => {
      expect(visit({ search: `?hello_popup=${encodeURIComponent(id)}` })).toBeNull()
    },
  )

  it.each(['reload', 'back_forward'])('does not open it again on a %s of the link', type => {
    expect(visit({ search: link, type })).toBeNull()
  })

  it('does not open it again on store pages whose links kept the query', () => {
    expect(visit({ search: `${link}&page=2`, referrer: `https://www.store.com/collection${link}` })).toBeNull()
  })

  it('opens a different popup that a store page links to', () => {
    expect(
      visit({ search: '?hello_popup=other-popup', referrer: `https://www.store.com/collection${link}` }),
    ).toEqual('other-popup')
  })
})
