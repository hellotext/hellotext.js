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

  describe('.webchat', () => {
    it('can be modified', () => {
      Configuration.assign({ webchat: { id: '123' } })
      expect(Configuration.webchat.id).toEqual('123')
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
