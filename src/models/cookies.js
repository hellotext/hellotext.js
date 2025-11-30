import Hellotext from '../hellotext'

class Cookies {
  static set(name, value) {
    if (typeof document !== 'undefined') {
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `${name}=${value}; path=/${secure}`
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
