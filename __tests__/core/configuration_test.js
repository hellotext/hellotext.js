import { Configuration } from '../../src/core'

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
})
