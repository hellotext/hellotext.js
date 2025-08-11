/**
 * @jest-environment jsdom
 */

import WebchatController from '../../src/controllers/webchat_controller'

// Mock dependencies
jest.mock('../../src/api/webchat/messages')
jest.mock('../../src/channels/webchat_channel')
jest.mock('../../src/hellotext')
jest.mock('../../src/core/configuration/webchat')
jest.mock('../../src/builders/logo_builder')
jest.mock('../../src/controllers/mixins/usePopover')

describe('WebchatController', () => {
  let controller
  let mockElement
  let mockMessagesContainer
  let mockBroadcastChannel
  let consoleLogSpy

  beforeEach(() => {
    mockMessagesContainer = document.createElement('div')
    mockMessagesContainer.setAttribute('data-hellotext--webchat-target', 'messagesContainer')

    mockElement = document.createElement('div')
    mockElement.appendChild(mockMessagesContainer)

    controller = new WebchatController()

    Object.defineProperty(controller, 'element', {
      value: mockElement,
      writable: false,
      configurable: true
    })

    controller.messagesContainerTarget = mockMessagesContainer

    controller.idValue = 'test-webchat-id'
    controller.conversationIdValue = 'test-conversation-id'

    mockBroadcastChannel = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }

    global.BroadcastChannel = jest.fn(() => mockBroadcastChannel)

    global.DOMParser = jest.fn(() => ({
      parseFromString: jest.fn()
    }))

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore()
    }
  })

  describe('onOutboundMessageSent', () => {
    describe('when event type is "message:sent"', () => {
      it('parses the HTML element and appends it to messages container', () => {
        const mockHtmlString = '<div class="message" id="msg-123">Test message</div>'
        const mockParsedElement = document.createElement('div')
        mockParsedElement.className = 'message'
        mockParsedElement.id = 'msg-123'
        mockParsedElement.textContent = 'Test message'

        const mockBody = { firstElementChild: mockParsedElement }
        const mockDocument = { body: mockBody }

        const mockDOMParser = {
          parseFromString: jest.fn().mockReturnValue(mockDocument)
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: mockHtmlString
          }
        }

        controller.onOutboundMessageSent(event)

        expect(mockDOMParser.parseFromString).toHaveBeenCalledWith(mockHtmlString, 'text/html')
        expect(mockMessagesContainer.children).toHaveLength(1)
        expect(mockMessagesContainer.children[0]).toBe(mockParsedElement)
        expect(mockParsedElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant' })
      })

      it('handles complex HTML structures correctly', () => {
        const complexHtml = `
          <div class="message sent" data-id="456">
            <div class="message-content">
              <p>Hello world!</p>
              <img src="test.jpg" alt="test" />
            </div>
          </div>
        `

        const mockComplexElement = document.createElement('div')
        mockComplexElement.innerHTML = complexHtml.trim()
        const mockParsedElement = mockComplexElement.firstElementChild

        const mockBody = { firstElementChild: mockParsedElement }
        const mockDocument = { body: mockBody }

        const mockDOMParser = {
          parseFromString: jest.fn().mockReturnValue(mockDocument)
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: complexHtml
          }
        }

        controller.onOutboundMessageSent(event)

        expect(mockDOMParser.parseFromString).toHaveBeenCalledWith(complexHtml, 'text/html')
        expect(mockMessagesContainer.children).toHaveLength(1)
        expect(mockParsedElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant' })
      })
    })

    describe('when event type is "message:failed"', () => {
      it('adds "failed" class to the message element with matching id', () => {
        const messageId = 'failed-message-123'
        const existingMessage = document.createElement('div')
        existingMessage.id = messageId
        existingMessage.className = 'message'
        mockMessagesContainer.appendChild(existingMessage)

        const event = {
          data: {
            type: 'message:failed',
            id: messageId
          }
        }

        controller.onOutboundMessageSent(event)

        expect(existingMessage.classList.contains('failed')).toBe(true)
        expect(existingMessage.className).toBe('message failed')
      })

      it('does nothing when message with id is not found', () => {
        const event = {
          data: {
            type: 'message:failed',
            id: 'non-existent-message'
          }
        }

        expect(() => controller.onOutboundMessageSent(event)).not.toThrow()
      })

      it('handles multiple messages and only affects the correct one', () => {
        const message1 = document.createElement('div')
        message1.id = 'message-1'
        message1.className = 'message'

        const message2 = document.createElement('div')
        message2.id = 'message-2'
        message2.className = 'message'

        const message3 = document.createElement('div')
        message3.id = 'message-3'
        message3.className = 'message'

        mockMessagesContainer.appendChild(message1)
        mockMessagesContainer.appendChild(message2)
        mockMessagesContainer.appendChild(message3)

        const event = {
          data: {
            type: 'message:failed',
            id: 'message-2'
          }
        }

        controller.onOutboundMessageSent(event)

        expect(message1.classList.contains('failed')).toBe(false)
        expect(message2.classList.contains('failed')).toBe(true)
        expect(message3.classList.contains('failed')).toBe(false)
      })
    })

    describe('when event type is unhandled', () => {
      it('logs unhandled message event', () => {
        const event = {
          data: {
            type: 'unknown:event',
            someData: 'test'
          }
        }

        controller.onOutboundMessageSent(event)

        expect(console.log).toHaveBeenCalledWith('Unhandled message event: unknown:event')
      })

      it('handles missing type gracefully', () => {
        const event = {
          data: {
            someData: 'test'
          }
        }

        controller.onOutboundMessageSent(event)

        expect(console.log).toHaveBeenCalledWith('Unhandled message event: undefined')
      })
    })

    describe('edge cases', () => {
      it('throws error when event has missing data property', () => {
        const event = {}

        expect(() => controller.onOutboundMessageSent(event)).toThrow()
      })

      it('throws error when event data is null', () => {
        const event = { data: null }

        expect(() => controller.onOutboundMessageSent(event)).toThrow()
      })

      it('throws error when trying to append null element for message:sent', () => {
        const mockEmptyElement = null
        const mockBody = { firstElementChild: mockEmptyElement }
        const mockDocument = { body: mockBody }

        const mockDOMParser = {
          parseFromString: jest.fn().mockReturnValue(mockDocument)
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        const event = {
          data: {
            type: 'message:sent',
            element: ''
          }
        }


        expect(() => controller.onOutboundMessageSent(event)).toThrow()
      })

      it('handles malformed HTML for message:sent', () => {
        const malformedHtml = '<div><span>Unclosed tags'
        const mockParsedElement = document.createElement('div')

        const mockBody = { firstElementChild: mockParsedElement }
        const mockDocument = { body: mockBody }

        const mockDOMParser = {
          parseFromString: jest.fn().mockReturnValue(mockDocument)
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: malformedHtml
          }
        }

        controller.onOutboundMessageSent(event)

        expect(mockDOMParser.parseFromString).toHaveBeenCalledWith(malformedHtml, 'text/html')
        expect(mockMessagesContainer.children).toHaveLength(1)
      })
    })
  })
})
