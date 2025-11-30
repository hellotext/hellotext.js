import Hellotext from '../hellotext'
import { Page } from './page'

class Cookies {
  static set(name, value) {
    if (typeof document !== 'undefined') {
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      const domain = Page.getRootDomain()
      const maxAge = 10 * 365 * 24 * 60 * 60 // 10 years in seconds

      if (domain) {
        document.cookie = `${name}=${value}; path=/${secure}; domain=${domain}; max-age=${maxAge}; SameSite=Lax`
      } else {
        document.cookie = `${name}=${value}; path=/${secure}; max-age=${maxAge}; SameSite=Lax`
      }
    }

    if (name === 'hello_session') {
      Hellotext.eventEmitter.dispatch('session-set', value)
    }

    if (name === 'hello_utm') {
      Hellotext.eventEmitter.dispatch('utm-set', value)
    }

    return value
  }

  static get(name) {
    if (typeof document !== 'undefined') {
      return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()
    } else {
      return undefined
    }
  }
}

export { Cookies }
