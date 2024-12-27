import { WebChat } from '../../../src/core/configuration/web_chat'

describe('WebChat', () => {
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

    it('can be set to any other value', () => {
      WebChat.classes = 'custom-class'
      expect(WebChat.classes).toEqual('custom-class')
    });
  })

  describe('triggerClasses', () => {
    it('is undefined by default', () => {
      expect(WebChat.triggerClasses).toEqual(undefined)
    });

    it('can be set to any other value', () => {
      WebChat.triggerClasses = 'custom-class'
      expect(WebChat.triggerClasses).toEqual('custom-class')
    });
  })
})
