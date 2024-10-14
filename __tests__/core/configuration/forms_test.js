import { Forms } from '../../../src/core/configuration/forms'

describe('Forms', () => {
  describe('.autoMount', () => {
    it('is true by default', () => {
      expect(Forms.autoMount).toEqual(true)
    })

    it('can be set to false', () => {
      Forms.autoMount = false
      expect(Forms.autoMount).toEqual(false)
    })
  })

  describe('.successMessage', () => {
    it('is true by default', () => {
      expect(Forms.successMessage).toEqual(true)
    })

    it('can be set to false', () => {
      Forms.successMessage = false
      expect(Forms.successMessage).toEqual(false)
    })

    it('can be set to a string', () => {
      Forms.successMessage = 'Thank you for your submission'
      expect(Forms.successMessage).toEqual('Thank you for your submission')
    })
  })
})
