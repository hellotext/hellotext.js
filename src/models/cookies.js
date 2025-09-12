import Hellotext from '../hellotext'

class Cookies {
  static set(name, value) {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=${value}; path=/;`
    }

    Hellotext.eventEmitter.dispatch('session-set', value)

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
