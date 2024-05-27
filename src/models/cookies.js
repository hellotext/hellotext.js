import Hellotext from '../hellotext'

class Cookies {
  static set(name, value) {
    document.cookie = `${name}=${value}`
    Hellotext.eventEmitter.emit('session-set', value)

    return value
  }

  static get(name) {
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()
  }
}

export { Cookies }
