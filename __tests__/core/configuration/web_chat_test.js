import { WebChat } from '../../../src/core/configuration/web_chat'

describe('WebChat', () => {
  describe('behaviour', () => {
    it('is POPOVER by default', () => {
      expect(WebChat.behaviour).toEqual('popover')
    });

    it('can be set to modal', () => {
      WebChat.behaviour = 'modal'
      expect(WebChat.behaviour).toEqual('modal')
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        WebChat.behaviour = 'invalid'
      }).toThrowError('Invalid behaviour value: invalid')
    });
  })

  describe('container', () => {
    it('is body by default', () => {
      expect(WebChat.container).toEqual('body')
    });

    it('can be set to any other value', () => {
      WebChat.container = 'html'
      expect(WebChat.container).toEqual('html')
    });
  })

  describe('placement', () => {
    it('is bottom-right by default', () => {
      expect(WebChat.placement).toEqual('bottom-right')
    });

    it('can be set to any other value', () => {
      WebChat.placement = 'top-left'
      expect(WebChat.placement).toEqual('top-left')
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        WebChat.placement = 'invalid'
      }).toThrowError('Invalid placement value: invalid')
    });
  })

  describe('classes', () => {
    it('is undefined by default', () => {
      expect(WebChat.classes).toEqual(undefined)
    });

    describe('setting value to a String', () => {
      it('can be set to a string value', () => {
        WebChat.classes = 'custom-class'
      });

      it('returns an array of the values', () => {
        WebChat.classes = 'custom-class, another-class'
        expect(WebChat.classes).toEqual(['custom-class', 'another-class'])
      });
    });

    it('can be set to an Array', () => {
      WebChat.classes = ['custom-class']
      expect(WebChat.classes).toEqual(['custom-class'])
    });

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        WebChat.classes = { invalid: 'value' }
      }).toThrowError('classes must be an array or a string')
    });
  })

  describe('triggerClasses', () => {
    it('is undefined by default', () => {
      expect(WebChat.triggerClasses).toEqual(undefined)
    });

    describe('setting value to a String', () => {
      it('can be set to a string value', () => {
        WebChat.triggerClasses = 'custom-class'
      });

      it('returns an array of the values', () => {
        WebChat.triggerClasses = 'custom-class, another-class'
        expect(WebChat.triggerClasses).toEqual(['custom-class', 'another-class'])
      });
    });

    describe('when setting value to an Array', () => {
      it('can be set', () => {
        WebChat.triggerClasses = ['custom-class']
      });

      it('returns the value', () => {
        WebChat.triggerClasses = ['custom-class', 'another-class']
        expect(WebChat.triggerClasses).toEqual(['custom-class', 'another-class'])
      });
    })

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        WebChat.triggerClasses = { invalid: 'value' }
      }).toThrowError('triggerClasses must be an array or a string')
    });
  })
})
