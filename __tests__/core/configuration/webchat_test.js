import { Webchat } from '../../../src/core/configuration/webchat'

describe('Webchat', () => {
  describe('behaviour', () => {
    it('is POPOVER by default', () => {
      expect(Webchat.behaviour).toEqual('popover')
    });

    it('can be set to modal', () => {
      Webchat.behaviour = 'modal'
      expect(Webchat.behaviour).toEqual('modal')
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        Webchat.behaviour = 'invalid'
      }).toThrowError('Invalid behaviour value: invalid')
    });
  })

  describe('container', () => {
    it('is body by default', () => {
      expect(Webchat.container).toEqual('body')
    });

    it('can be set to any other value', () => {
      Webchat.container = 'html'
      expect(Webchat.container).toEqual('html')
    });
  })

  describe('placement', () => {
    it('is bottom-right by default', () => {
      expect(Webchat.placement).toEqual('bottom-right')
    });

    it('can be set to any other value', () => {
      Webchat.placement = 'top-left'
      expect(Webchat.placement).toEqual('top-left')
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        Webchat.placement = 'invalid'
      }).toThrowError('Invalid placement value: invalid')
    });
  })

  describe('classes', () => {
    it('is an empty array by default', () => {
      expect(Webchat.classes).toEqual([])
    });

    describe('setting value to a String', () => {
      it('can be set to a string value', () => {
        Webchat.classes = 'custom-class'
      });

      it('returns an array of the values', () => {
        Webchat.classes = 'custom-class, another-class'
        expect(Webchat.classes).toEqual(['custom-class', 'another-class'])
      });
    });

    it('can be set to an Array', () => {
      Webchat.classes = ['custom-class']
      expect(Webchat.classes).toEqual(['custom-class'])
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        Webchat.classes = { invalid: 'value' }
      }).toThrowError('classes must be an array or a string')
    });
  })

  describe('triggerClasses', () => {
    it('is an empty array by default', () => {
      expect(Webchat.triggerClasses).toEqual([undefined])
    });

    describe('setting value to a String', () => {
      it('can be set to a string value', () => {
        Webchat.triggerClasses = 'custom-class'
      });

      it('returns an array of the values', () => {
        Webchat.triggerClasses = 'custom-class, another-class'
        expect(Webchat.triggerClasses).toEqual(['custom-class', 'another-class'])
      });
    });

    describe('when setting value to an Array', () => {
      it('can be set', () => {
        Webchat.triggerClasses = ['custom-class']
      });

      it('returns the value', () => {
        Webchat.triggerClasses = ['custom-class', 'another-class']
        expect(Webchat.triggerClasses).toEqual(['custom-class', 'another-class'])
      });
    })

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        Webchat.triggerClasses = { invalid: 'value' }
      }).toThrowError('triggerClasses must be an array or a string')
    });
  })
})
