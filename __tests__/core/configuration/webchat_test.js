import { Webchat } from '../../../src/core/configuration/webchat';

beforeEach(() => {
  Webchat.strategy = null
})

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

  describe('strategy', () => {
    it('can be set to fixed', () => {
      Webchat.strategy = 'fixed'
      expect(Webchat.strategy).toEqual('fixed')
    });

    it('can be set to absolute', () => {
      Webchat.strategy = 'absolute'
      expect(Webchat.strategy).toEqual('absolute')
    });

    describe('when the value is not set', () => {
      it('is fixed when the container is body', () => {
        Webchat.container = 'body'
        expect(Webchat.strategy).toEqual('fixed')
      });

      it('is fixed when the container is not specified', () => {
        expect(Webchat.strategy).toEqual('fixed')
      });

      it('is absolute when the container is not body', () => {
        Webchat.container = '#container'
        expect(Webchat.strategy).toEqual('absolute')
      });
    })

    it('throws an exception when an invalid value is supplied', () => {
      expect(() => {
        Webchat.strategy = 'invalid'
      }).toThrowError('Invalid strategy value: invalid')
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

  describe('styles', () => {
    it('raises an exception when an invalid style is set', () => {
      expect(() => {
        Webchat.style = { fill: 'value' }
      }).toThrowError('Invalid style property: fill')
    })
    describe('primaryColor', () => {
      it('can be set to a hex string', () => {
        Webchat.style = { primaryColor: '#EEEEEE' }
        expect(Webchat.style.primaryColor).toEqual('#EEEEEE')
      });

      it('can be set to an rgb string', () => {
        Webchat.style = { primaryColor: 'rgb(255, 255, 255)' }
        expect(Webchat.style.primaryColor).toEqual('rgb(255, 255, 255)')
      });

      it('can be set to an rgba string', () => {
        Webchat.style = { primaryColor: 'rgba(255, 255, 255, 0.5)' }
        expect(Webchat.style.primaryColor).toEqual('rgba(255, 255, 255, 0.5)')
      });

      it('throws an exception when an invalid value is supplied', () => {
        expect(() => {
          Webchat.style = { primaryColor: 'red' }
        }).toThrowError('Invalid color value: red for primaryColor. Colors must be hex or rgb/a.')
      });
    })

    describe('secondaryColor', () => {
      it('can be set to a hex string', () => {
        Webchat.style = { secondaryColor: '#EEEEEE' }
        expect(Webchat.style.secondaryColor).toEqual('#EEEEEE')
      });

      it('can be set to an rgb string', () => {
        Webchat.style = { secondaryColor: 'rgb(255, 255, 255)' }
        expect(Webchat.style.secondaryColor).toEqual('rgb(255, 255, 255)')
      });

      it('can be set to an rgba string', () => {
        Webchat.style = { secondaryColor: 'rgba(255, 255, 255, 0.5)' }
        expect(Webchat.style.secondaryColor).toEqual('rgba(255, 255, 255, 0.5)')
      });

      it('throws an exception when an invalid value is supplied', () => {
        expect(() => {
          Webchat.style = { secondaryColor: 'red' }
        }).toThrowError('Invalid color value: red for secondaryColor. Colors must be hex or rgb/a.')
      });
    })
  })
})
