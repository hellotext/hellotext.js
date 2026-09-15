import { Configuration } from '../../src/core'
import { Locale } from '../../src/core/configuration/locale'

describe('Configuration', () => {
  describe('.autoGenerateSession', () => {
    it('is true by default', () => {
      expect(Configuration.autoGenerateSession).toEqual(true)
    })

    it('can be set to false', () => {
      Configuration.autoGenerateSession = false
      expect(Configuration.autoGenerateSession).toEqual(false)
    })
  })

  describe('.forms', () => {
    it('has default values', () => {
      expect(Configuration.forms.autoMount).toEqual(true)
      expect(Configuration.forms.successMessage).toEqual(true)
    });

    it('can be modified', () => {
      Configuration.assign({ forms: { autoMount: false, successMessage: false } })

      expect(Configuration.forms.autoMount).toEqual(false)
      expect(Configuration.forms.successMessage).toEqual(false)
    })
  })

  describe('.actionCableUrl', () => {
    const defaultApiRoot = Configuration.apiRoot
    const defaultActionCableUrl = Configuration.actionCableUrl

    afterEach(() => {
      Configuration.apiRoot = defaultApiRoot
      Configuration.actionCableUrl = defaultActionCableUrl
    })

    it('is inferred from apiRoot when actionCableUrl is not provided', () => {
      Configuration.assign({ apiRoot: 'http://api.example.test/v1' })

      expect(Configuration.actionCableUrl).toEqual('ws://api.example.test/cable')
    })

    it('preserves an explicit actionCableUrl', () => {
      Configuration.assign({
        apiRoot: 'http://api.example.test/v1',
        actionCableUrl: 'ws://cable.example.test/cable',
      })

      expect(Configuration.actionCableUrl).toEqual('ws://cable.example.test/cable')
    })
  })

  describe('.webchat', () => {
    it('can be modified', () => {
      Configuration.assign({ webchat: { id: '123' } })
      expect(Configuration.webchat.id).toEqual('123')
    })

    it('accepts false as an opt-out value', () => {
      expect(() => {
        Configuration.assign({ webchat: false })
      }).not.toThrow()
    })
  })

  describe('.popup', () => {
    afterEach(() => {
      Configuration.popup.id = undefined
      Configuration.popup.container = 'body'
      Configuration.popup.device = 'auto'
    })

    it('can be modified', () => {
      Configuration.assign({ popup: { id: 'popup-id', container: '#popup-root', device: 'desktop' } })

      expect(Configuration.popup.id).toEqual('popup-id')
      expect(Configuration.popup.container).toEqual('#popup-root')
      expect(Configuration.popup.device).toEqual('desktop')
    })

    it('accepts false as an opt-out value', () => {
      expect(() => {
        Configuration.assign({ popup: false })
      }).not.toThrow()
    })
  })

  describe('.locale', () => {
    beforeEach(() => {
      Locale._identifier = undefined
    })

    it('can be set', () => {
      Configuration.locale = 'es'
      expect(Configuration.locale).toEqual('es')
    })

    it('defaults to "en" when nothing is set', () => {
      expect(Configuration.locale).toEqual('en')
    })
  })
})
