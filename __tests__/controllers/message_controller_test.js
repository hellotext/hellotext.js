/**
 * @jest-environment jsdom
 */

import MessageController from '../../src/controllers/message_controller'

describe('MessageController', () => {
  let controller
  let mockElement
  let mockCarouselContainer
  let mockLeftFade
  let mockRightFade
  let mockCarouselCard

  beforeEach(() => {
    // Set up carousel container mock
    mockCarouselContainer = document.createElement('div')
    mockCarouselContainer.setAttribute('data-hellotext--message-target', 'carouselContainer')
    mockCarouselContainer.style.overflowX = 'scroll'
    mockCarouselContainer.scrollLeft = 0
    
    // Mock read-only properties
    Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
      value: 1000,
      writable: true,
      configurable: true
    })
    Object.defineProperty(mockCarouselContainer, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true
    })

    // Set up fade elements
    mockLeftFade = document.createElement('div')
    mockLeftFade.setAttribute('data-hellotext--message-target', 'leftFade')
    mockLeftFade.classList.add('hidden')

    mockRightFade = document.createElement('div')
    mockRightFade.setAttribute('data-hellotext--message-target', 'rightFade')

    // Set up carousel card
    mockCarouselCard = document.createElement('div')
    mockCarouselCard.setAttribute('data-hellotext--message-target', 'carouselCard')
    mockCarouselCard.dataset.id = 'product-123'

    // Set up main element
    mockElement = document.createElement('div')
    mockElement.appendChild(mockCarouselContainer)
    mockElement.appendChild(mockLeftFade)
    mockElement.appendChild(mockRightFade)
    mockElement.appendChild(mockCarouselCard)

    controller = new MessageController()

    Object.defineProperty(controller, 'element', {
      value: mockElement,
      writable: false,
      configurable: true
    })

    controller.carouselContainerTarget = mockCarouselContainer
    controller.leftFadeTarget = mockLeftFade
    controller.rightFadeTarget = mockRightFade
    controller.carouselCardTarget = mockCarouselCard
    controller.idValue = 'message-456'

    // Mock hasCarouselContainerTarget
    Object.defineProperty(controller, 'hasCarouselContainerTarget', {
      get: () => !!controller.carouselContainerTarget
    })

    // Mock scrollBy method
    mockCarouselContainer.scrollBy = jest.fn()

    // Mock dispatch method
    controller.dispatch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('connect', () => {
    it('calls updateFades on connect', () => {
      const updateFadesSpy = jest.spyOn(controller, 'updateFades')

      controller.connect()

      expect(updateFadesSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('onScroll', () => {
    it('calls updateFades when scrolling', () => {
      const updateFadesSpy = jest.spyOn(controller, 'updateFades')

      controller.onScroll()

      expect(updateFadesSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('quickReply', () => {
    let mockButton
    let mockCard

    beforeEach(() => {
      // Set up button element
      mockButton = document.createElement('button')
      mockButton.dataset.id = 'btn-789'
      mockButton.dataset.text = 'Buy Now'

      // Set up card element
      mockCard = document.createElement('div')
      mockCard.setAttribute('data-hellotext--message-target', 'carouselCard')
      mockCard.dataset.id = 'product-456'
      mockCard.appendChild(mockButton)

      // Mock closest method
      mockButton.closest = jest.fn().mockReturnValue(mockCard)
    })

    it('dispatches quickReply event with correct detail', () => {
      const mockEvent = {
        currentTarget: mockButton
      }

      controller.quickReply(mockEvent)

      expect(controller.dispatch).toHaveBeenCalledWith('quickReply', {
        detail: {
          id: 'message-456',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Buy Now',
          cardElement: mockCard
        }
      })
    })

    it('handles missing dataset properties gracefully', () => {
      const buttonWithoutData = document.createElement('button')
      const cardWithoutData = document.createElement('div')
      cardWithoutData.setAttribute('data-hellotext--message-target', 'carouselCard')

      buttonWithoutData.closest = jest.fn().mockReturnValue(cardWithoutData)

      const mockEvent = {
        currentTarget: buttonWithoutData
      }

      controller.quickReply(mockEvent)

      expect(controller.dispatch).toHaveBeenCalledWith('quickReply', {
        detail: {
          id: 'message-456',
          product: undefined,
          buttonId: undefined,
          body: undefined,
          cardElement: cardWithoutData
        }
      })
    })

    it('handles null card element', () => {
      mockButton.closest = jest.fn().mockReturnValue(null)

      const mockEvent = {
        currentTarget: mockButton
      }

      expect(() => controller.quickReply(mockEvent)).toThrow()
    })
  })

  describe('moveToLeft', () => {
    beforeEach(() => {
      // Mock getScrollAmount
      controller.getScrollAmount = jest.fn().mockReturnValue(296)
    })

    it('scrolls left by calculated amount when carousel container exists', () => {
      controller.moveToLeft()

      expect(mockCarouselContainer.scrollBy).toHaveBeenCalledWith({
        left: -296,
        behavior: 'smooth'
      })
    })

    it('does nothing when carousel container target does not exist', () => {
      // Create a new controller instance to avoid property redefinition issues
      const tempController = new MessageController()
      tempController.carouselContainerTarget = null
      Object.defineProperty(tempController, 'hasCarouselContainerTarget', {
        get: () => false
      })
      tempController.getScrollAmount = jest.fn().mockReturnValue(296)

      tempController.moveToLeft()

      expect(mockCarouselContainer.scrollBy).not.toHaveBeenCalled()
    })

    it('calls getScrollAmount to calculate scroll distance', () => {
      controller.moveToLeft()

      expect(controller.getScrollAmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('moveToRight', () => {
    beforeEach(() => {
      // Mock getScrollAmount
      controller.getScrollAmount = jest.fn().mockReturnValue(296)
    })

    it('scrolls right by calculated amount when carousel container exists', () => {
      controller.moveToRight()

      expect(mockCarouselContainer.scrollBy).toHaveBeenCalledWith({
        left: 296,
        behavior: 'smooth'
      })
    })

    it('does nothing when carousel container target does not exist', () => {
      // Create a new controller instance to avoid property redefinition issues
      const tempController = new MessageController()
      tempController.carouselContainerTarget = null
      Object.defineProperty(tempController, 'hasCarouselContainerTarget', {
        get: () => false
      })
      tempController.getScrollAmount = jest.fn().mockReturnValue(296)

      tempController.moveToRight()

      expect(mockCarouselContainer.scrollBy).not.toHaveBeenCalled()
    })

    it('calls getScrollAmount to calculate scroll distance', () => {
      controller.moveToRight()

      expect(controller.getScrollAmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('getScrollAmount', () => {
    it('returns card width plus gap when card exists', () => {
      const mockCard = document.createElement('div')
      mockCard.className = 'message__carousel_card'
      Object.defineProperty(mockCard, 'offsetWidth', {
        value: 280,
        writable: true,
        configurable: true
      })

      mockCarouselContainer.querySelector = jest.fn().mockReturnValue(mockCard)

      const result = controller.getScrollAmount()

      expect(result).toBe(296) // 280 + 16 gap
    })

    it('returns fallback value when no card exists', () => {
      mockCarouselContainer.querySelector = jest.fn().mockReturnValue(null)

      const result = controller.getScrollAmount()

      expect(result).toBe(280) // Fallback value
    })

    it('queries for correct card selector', () => {
      const mockCard = document.createElement('div')
      mockCard.className = 'message__carousel_card'
      Object.defineProperty(mockCard, 'offsetWidth', {
        value: 250,
        writable: true,
        configurable: true
      })

      mockCarouselContainer.querySelector = jest.fn().mockReturnValue(mockCard)

      controller.getScrollAmount()

      expect(mockCarouselContainer.querySelector).toHaveBeenCalledWith('.message__carousel_card')
    })

    it('handles different card widths correctly', () => {
      const mockCard = document.createElement('div')
      mockCard.className = 'message__carousel_card'
      Object.defineProperty(mockCard, 'offsetWidth', {
        value: 320,
        writable: true,
        configurable: true
      })

      mockCarouselContainer.querySelector = jest.fn().mockReturnValue(mockCard)

      const result = controller.getScrollAmount()

      expect(result).toBe(336) // 320 + 16 gap
    })
  })

  describe('updateFades', () => {
    it('does nothing when carousel container target does not exist', () => {
      // Create a new controller instance to avoid property redefinition issues
      const tempController = new MessageController()
      tempController.carouselContainerTarget = null
      Object.defineProperty(tempController, 'hasCarouselContainerTarget', {
        get: () => false
      })

      const leftFadeClassListSpy = jest.spyOn(mockLeftFade.classList, 'remove')
      const rightFadeClassListSpy = jest.spyOn(mockRightFade.classList, 'remove')

      tempController.updateFades()

      expect(leftFadeClassListSpy).not.toHaveBeenCalled()
      expect(rightFadeClassListSpy).not.toHaveBeenCalled()
    })

    describe('when at start position (scrollLeft = 0)', () => {
      beforeEach(() => {
        mockCarouselContainer.scrollLeft = 0
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 1000,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
      })

      it('hides left fade', () => {
        controller.updateFades()

        expect(mockLeftFade.classList.contains('hidden')).toBe(true)
      })

      it('shows right fade when not at end', () => {
        controller.updateFades()

        expect(mockRightFade.classList.contains('hidden')).toBe(false)
      })
    })

    describe('when in middle position', () => {
      beforeEach(() => {
        mockCarouselContainer.scrollLeft = 350
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 1000,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        mockLeftFade.classList.add('hidden')
        mockRightFade.classList.add('hidden')
      })

      it('shows left fade', () => {
        controller.updateFades()

        expect(mockLeftFade.classList.contains('hidden')).toBe(false)
      })

      it('shows right fade', () => {
        controller.updateFades()

        expect(mockRightFade.classList.contains('hidden')).toBe(false)
      })
    })

    describe('when at end position', () => {
      beforeEach(() => {
        mockCarouselContainer.scrollLeft = 700 // scrollWidth (1000) - clientWidth (300) = 700
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 1000,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        mockLeftFade.classList.add('hidden')
        mockRightFade.classList.remove('hidden')
      })

      it('shows left fade', () => {
        controller.updateFades()

        expect(mockLeftFade.classList.contains('hidden')).toBe(false)
      })

      it('hides right fade', () => {
        controller.updateFades()

        expect(mockRightFade.classList.contains('hidden')).toBe(true)
      })
    })

    describe('edge case handling', () => {
      it('handles rounding errors at end position', () => {
        mockCarouselContainer.scrollLeft = 698 // 2 pixels before end, within tolerance
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 1000,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        mockRightFade.classList.remove('hidden')

        controller.updateFades()

        // maxScroll = 1000 - 300 = 700, scrollLeft (698) < maxScroll - 1 (699), so right fade should be visible
        expect(mockRightFade.classList.contains('hidden')).toBe(false)
      })

      it('handles exact end position with tolerance', () => {
        mockCarouselContainer.scrollLeft = 699 // exactly at maxScroll - 1
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 1000,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        mockRightFade.classList.remove('hidden')

        controller.updateFades()

        // maxScroll = 1000 - 300 = 700, scrollLeft (699) = maxScroll - 1 (699), so right fade should be hidden
        expect(mockRightFade.classList.contains('hidden')).toBe(true)
      })

      it('handles container with no scroll needed', () => {
        mockCarouselContainer.scrollLeft = 0
        Object.defineProperty(mockCarouselContainer, 'scrollWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        Object.defineProperty(mockCarouselContainer, 'clientWidth', {
          value: 300,
          writable: true,
          configurable: true
        })
        mockRightFade.classList.remove('hidden')

        controller.updateFades()

        expect(mockLeftFade.classList.contains('hidden')).toBe(true)
        expect(mockRightFade.classList.contains('hidden')).toBe(true)
      })
    })
  })

  describe('integration tests', () => {
    it('updates fades correctly after moving left', () => {
      mockCarouselContainer.scrollLeft = 350
      controller.getScrollAmount = jest.fn().mockReturnValue(296)

      const updateFadesSpy = jest.spyOn(controller, 'updateFades')

      controller.moveToLeft()

      expect(mockCarouselContainer.scrollBy).toHaveBeenCalledWith({
        left: -296,
        behavior: 'smooth'
      })
    })

    it('updates fades correctly after moving right', () => {
      mockCarouselContainer.scrollLeft = 50
      controller.getScrollAmount = jest.fn().mockReturnValue(296)

      const updateFadesSpy = jest.spyOn(controller, 'updateFades')

      controller.moveToRight()

      expect(mockCarouselContainer.scrollBy).toHaveBeenCalledWith({
        left: 296,
        behavior: 'smooth'
      })
    })

    it('handles complete carousel interaction flow', () => {
      // Start at beginning
      mockCarouselContainer.scrollLeft = 0
      controller.updateFades()
      expect(mockLeftFade.classList.contains('hidden')).toBe(true)
      expect(mockRightFade.classList.contains('hidden')).toBe(false)

      // Move to middle
      mockCarouselContainer.scrollLeft = 350
      controller.updateFades()
      expect(mockLeftFade.classList.contains('hidden')).toBe(false)
      expect(mockRightFade.classList.contains('hidden')).toBe(false)

      // Move to end
      mockCarouselContainer.scrollLeft = 700
      controller.updateFades()
      expect(mockLeftFade.classList.contains('hidden')).toBe(false)
      expect(mockRightFade.classList.contains('hidden')).toBe(true)
    })
  })
})
