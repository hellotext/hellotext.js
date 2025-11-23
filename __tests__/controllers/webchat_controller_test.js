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

  describe('onMessageReceived', () => {
    let mockMessageTemplate
    let mockAttachmentImage
    let mockUnreadCounter
    let mockMessagesAPI
    let mockHellotext

    beforeEach(() => {
      // Set up message template mock
      mockMessageTemplate = document.createElement('div')
      mockMessageTemplate.style.display = 'none'
      const bodyElement = document.createElement('div')
      bodyElement.setAttribute('data-body', '')
      const attachmentContainer = document.createElement('div')
      attachmentContainer.setAttribute('data-attachment-container', '')
      mockMessageTemplate.appendChild(bodyElement)
      mockMessageTemplate.appendChild(attachmentContainer)

      // Set up attachment image mock
      mockAttachmentImage = document.createElement('img')
      mockAttachmentImage.style.display = 'none'

      // Set up unread counter mock
      mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.style.display = 'none'
      mockUnreadCounter.textContent = '0'

      // Mock the targets
      controller.messageTemplateTarget = mockMessageTemplate
      controller.attachmentImageTarget = mockAttachmentImage
      controller.unreadCounterTarget = mockUnreadCounter

      // Mock messagesAPI
      mockMessagesAPI = {
        markAsSeen: jest.fn()
      }
      controller.messagesAPI = mockMessagesAPI

      // Mock Hellotext
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn()
        }
      }

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = jest.fn()

      // Import and setup Hellotext mock
      const Hellotext = require('../../src/hellotext').default
      Object.assign(Hellotext, mockHellotext)
    })

    describe('basic message handling', () => {
      it('creates and appends a message element with body content', () => {
        const message = {
          body: '<p>Hello world!</p>',
          id: 'msg-123'
        }

        controller.onMessageReceived(message)

        expect(mockMessagesContainer.children).toHaveLength(1)
        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.style.display).toBe('flex')
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('<p>Hello world!</p>')
        expect(addedElement.getAttribute('data-hellotext--webchat-target')).toBe('message')
      })

      it('handles plain text messages', () => {
        const message = {
          body: 'Simple text message',
          id: 'msg-456'
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('Simple text message')
      })

      it('handles HTML content in message body', () => {
        const message = {
          body: '<strong>Bold text</strong> and <em>italic text</em>',
          id: 'msg-789'
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('<strong>Bold text</strong> and <em>italic text</em>')
      })
    })

    describe('attachment handling', () => {
      it('processes single attachment correctly', () => {
        const message = {
          body: 'Message with attachment',
          attachments: ['https://example.com/image1.jpg']
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(1)

        const attachmentImage = attachmentContainer.children[0]
        expect(attachmentImage.src).toBe('https://example.com/image1.jpg')
        expect(attachmentImage.style.display).toBe('block')
      })

      it('processes multiple attachments correctly', () => {
        const message = {
          body: 'Message with multiple attachments',
          attachments: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.png',
            'https://example.com/image3.gif'
          ]
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(3)

        expect(attachmentContainer.children[0].src).toBe('https://example.com/image1.jpg')
        expect(attachmentContainer.children[1].src).toBe('https://example.com/image2.png')
        expect(attachmentContainer.children[2].src).toBe('https://example.com/image3.gif')
      })

      it('handles messages without attachments', () => {
        const message = {
          body: 'Message without attachments'
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('handles empty attachments array', () => {
        const message = {
          body: 'Message with empty attachments',
          attachments: []
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })
    })

    describe('scroll behavior', () => {
      it('scrolls new message into view smoothly', () => {
        const message = {
          body: 'Scroll test message'
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      })
    })

    describe('read status when chat is open', () => {
      beforeEach(() => {
        controller.openValue = true
      })

      it('marks message as seen when chat is open', () => {
        const message = {
          body: 'Open chat message',
          id: 'msg-open-chat'
        }

        controller.onMessageReceived(message)
        expect(mockMessagesAPI.markAsSeen).toHaveBeenCalledWith('msg-open-chat')
      })
    })

    describe('unread counter when chat is closed', () => {
      beforeEach(() => {
        controller.openValue = false
      })

      it('does not mark message as seen when chat is closed', () => {
        const message = {
          body: 'Closed chat message'
        }

        controller.onMessageReceived(message)
        expect(mockMessagesAPI.markAsSeen).not.toHaveBeenCalled()
      })
    })

    describe('typing indicator timeout clearance', () => {
      let mockTypingIndicatorTarget
      let mockClearTimeout

      beforeEach(() => {
        mockTypingIndicatorTarget = document.createElement('div')
        mockTypingIndicatorTarget.setAttribute('data-hellotext--webchat-target', 'typingIndicator')
        controller.typingIndicatorTarget = mockTypingIndicatorTarget
        // Mock hasTypingIndicatorTarget to return true when target exists
        Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
          get: () => !!controller.typingIndicatorTarget
        })

        mockClearTimeout = jest.fn()
        global.clearTimeout = mockClearTimeout

        controller.incomingTypingIndicatorTimeout = 'mock-timeout-id'
      })

      it('clears typing indicator timeout when indicator is visible', () => {
        controller.typingIndicatorVisible = true

        const message = {
          body: 'Test message',
          id: 'msg-typing-clear'
        }

        controller.onMessageReceived(message)

        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
      })

      it('removes typing indicator element when indicator is visible', () => {
        controller.typingIndicatorVisible = true
        const removeSpy = jest.spyOn(mockTypingIndicatorTarget, 'remove')

        const message = {
          body: 'Test message',
          id: 'msg-typing-remove'
        }

        controller.onMessageReceived(message)

        expect(removeSpy).toHaveBeenCalled()
      })

      it('sets typing indicator visibility to false when indicator is visible', () => {
        controller.typingIndicatorVisible = true

        const message = {
          body: 'Test message',
          id: 'msg-typing-hide'
        }

        controller.onMessageReceived(message)

        expect(controller.typingIndicatorVisible).toBe(false)
      })

      it('does not clear timeout when typing indicator is not visible', () => {
        controller.typingIndicatorVisible = false

        const message = {
          body: 'Test message',
          id: 'msg-no-typing'
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalled()
      })

      it('does not remove typing indicator element when indicator is not visible', () => {
        controller.typingIndicatorVisible = false
        const removeSpy = jest.spyOn(mockTypingIndicatorTarget, 'remove')

        const message = {
          body: 'Test message',
          id: 'msg-no-typing-remove'
        }

        controller.onMessageReceived(message)
        expect(removeSpy).toHaveBeenCalled()
      })

      it('handles multiple messages with typing indicator clearance', () => {
        controller.typingIndicatorVisible = true

        const message1 = {
          body: 'First message',
          id: 'msg-1'
        }

        const message2 = {
          body: 'Second message',
          id: 'msg-2'
        }

        controller.onMessageReceived(message1)
        expect(mockClearTimeout).toHaveBeenCalledTimes(2) // Now calls clearTimeout twice per message
        expect(controller.typingIndicatorVisible).toBe(false)

        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = 'mock-timeout-id-2'

        controller.onMessageReceived(message2)
        expect(mockClearTimeout).toHaveBeenCalledTimes(4) // 2 calls per message, 2 messages = 4 total
        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id-2')
        expect(controller.typingIndicatorVisible).toBe(false)
      })

      it('handles typing indicator clearance with different timeout IDs', () => {
        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = 'timeout-123'

        const message = {
          body: 'Test message',
          id: 'msg-timeout-id'
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith('timeout-123')
      })

      it('handles typing indicator clearance with null timeout ID', () => {
        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = null

        const message = {
          body: 'Test message',
          id: 'msg-null-timeout'
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith(null)
      })

      it('handles typing indicator clearance with undefined timeout ID', () => {
        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = undefined

        const message = {
          body: 'Test message',
          id: 'msg-undefined-timeout'
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith(undefined)
      })

      it('handles typing indicator clearance when typing indicator target is null', () => {
        controller.typingIndicatorVisible = true
        controller.typingIndicatorTarget = null

        const message = {
          body: 'Test message',
          id: 'msg-null-target'
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()
        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
        expect(controller.typingIndicatorVisible).toBe(false)
      })

      it('handles typing indicator clearance when typing indicator target is undefined', () => {
        controller.typingIndicatorVisible = true
        controller.typingIndicatorTarget = undefined

        const message = {
          body: 'Test message',
          id: 'msg-undefined-target'
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()
        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
        expect(controller.typingIndicatorVisible).toBe(false)
      })
    })

    describe('edge cases and error handling', () => {
      it('handles missing message body gracefully', () => {
        const message = {
          id: 'msg-no-body'
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('undefined')
      })

      it('handles null/undefined message', () => {
        expect(() => controller.onMessageReceived(null)).toThrow()
        expect(() => controller.onMessageReceived(undefined)).toThrow()
      })

      it('handles message with null attachments', () => {
        const message = {
          body: 'Message with null attachments',
          attachments: null
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('handles malformed HTML in message body', () => {
        const message = {
          body: '<div><span>Unclosed tags and <strong>bold text'
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]')).toBeTruthy()
      })

      it('handles complex nested message structure', () => {
        const message = {
          body: `
            <div class="complex-message">
              <h3>Title</h3>
              <p>Paragraph with <a href="#">link</a></p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          `,
          attachments: ['https://example.com/file.pdf'],
          id: 'complex-msg',
          metadata: { important: true }
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body] h3')).toBeTruthy()
        expect(addedElement.querySelector('[data-body] ul li')).toBeTruthy()
        expect(addedElement.querySelector('[data-attachment-container] img')).toBeTruthy()
      })
    })
  })

  describe('onMessageInputChange', () => {
    let mockWebChatChannel

    beforeEach(() => {
      mockWebChatChannel = {
        startTypingIndicator: jest.fn()
      }
      controller.webChatChannel = mockWebChatChannel
      controller.hasSentTypingIndicator = false
      controller.typingIndicatorTimeout = null

      // Mock inputTarget for resizeInput method
      controller.inputTarget = {
        style: {},
        scrollHeight: 50
      }
    })

    afterEach(() => {
      if (controller.typingIndicatorTimeout) {
        clearTimeout(controller.typingIndicatorTimeout)
      }
    })

    it('sends typing indicator on first call', () => {
      controller.onMessageInputChange()

      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)
      expect(controller.hasSentTypingIndicator).toBe(true)
      expect(controller.typingIndicatorTimeout).toBeTruthy()
    })

    it('does not send typing indicator on subsequent calls within timeout period', () => {
      controller.onMessageInputChange()
      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)
      expect(controller.hasSentTypingIndicator).toBe(true)

      controller.onMessageInputChange()
      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)
      expect(controller.hasSentTypingIndicator).toBe(true)
    })

    it('handles rapid successive calls without race conditions', () => {
      for (let i = 0; i < 10; i++) {
        controller.onMessageInputChange()
      }

      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)
      expect(controller.hasSentTypingIndicator).toBe(true)
    })

    it('resets flag after timeout expires', () => {
      jest.useFakeTimers()

      controller.onMessageInputChange()
      expect(controller.hasSentTypingIndicator).toBe(true)

      jest.advanceTimersByTime(3000)

      expect(controller.hasSentTypingIndicator).toBe(false)

      jest.useRealTimers()
    })

    it('can send typing indicator again after timeout expires', () => {
      jest.useFakeTimers()

      controller.onMessageInputChange()
      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(3000)

      mockWebChatChannel.startTypingIndicator.mockClear()

      controller.onMessageInputChange()
      expect(mockWebChatChannel.startTypingIndicator).toHaveBeenCalledTimes(1)
      expect(controller.hasSentTypingIndicator).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('onPopoverClosed', () => {
    let mockHellotext
    let mockLocalStorage

    beforeEach(() => {
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn()
        }
      }

      // Mock localStorage
      mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })

      // Import and setup Hellotext mock
      const Hellotext = require('../../src/hellotext').default
      Object.assign(Hellotext, mockHellotext)
    })

    it('dispatches webchat:closed event', () => {
      controller.onPopoverClosed()

      expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:closed')
    })

    it('sets closed state in localStorage with correct key', () => {
      controller.idValue = 'test-webchat-123'

      controller.onPopoverClosed()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hellotext--webchat--test-webchat-123', 'closed')
    })
  })

  describe('sendQuickReplyMessage', () => {
    let mockMessageTemplate
    let mockMessagesAPI
    let mockHellotext
    let mockLocale
    let mockCardElement
    let mockImageElement
    let mockBroadcastChannel
    let mockClearTimeout

    beforeEach(() => {
      // Set up message template mock
      mockMessageTemplate = document.createElement('div')
      mockMessageTemplate.id = 'template'
      mockMessageTemplate.style.display = 'none'
      const bodyElement = document.createElement('div')
      bodyElement.setAttribute('data-body', '')
      const attachmentContainer = document.createElement('div')
      attachmentContainer.setAttribute('data-attachment-container', '')
      mockMessageTemplate.appendChild(bodyElement)
      mockMessageTemplate.appendChild(attachmentContainer)

      // Set up card element with image
      mockImageElement = document.createElement('img')
      mockImageElement.src = 'https://example.com/product.jpg'
      mockImageElement.width = 200
      mockImageElement.height = 150
      mockImageElement.alt = 'Product image'

      mockCardElement = document.createElement('div')
      mockCardElement.appendChild(mockImageElement)

      // Mock the targets
      controller.messageTemplateTarget = mockMessageTemplate
      controller.messagesContainerTarget = mockMessagesContainer

      // Mock messagesAPI
      mockMessagesAPI = {
        create: jest.fn()
      }
      controller.messagesAPI = mockMessagesAPI

      // Mock Hellotext
      mockHellotext = {
        session: 'test-session-123',
        eventEmitter: {
          dispatch: jest.fn()
        }
      }

      // Mock Locale
      mockLocale = {
        toString: jest.fn().mockReturnValue('en')
      }

      // Mock broadcast channel
      mockBroadcastChannel = {
        postMessage: jest.fn()
      }
      controller.broadcastChannel = mockBroadcastChannel

      // Mock clearTimeout
      mockClearTimeout = jest.fn()
      global.clearTimeout = mockClearTimeout

      // Mock dispatch method
      controller.dispatch = jest.fn()

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = jest.fn()

      // Import and setup mocks
      const Hellotext = require('../../src/hellotext').default
      Object.assign(Hellotext, mockHellotext)

      const { Locale } = require('../../src/core/configuration/locale')
      Object.assign(Locale, mockLocale)
    })

    describe('successful message sending', () => {
      beforeEach(() => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123'
          })
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)
      })

      it('creates FormData with all required parameters', async () => {
        const eventDetail = {
          id: 'original-msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Quick reply message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockMessagesAPI.create).toHaveBeenCalledWith(expect.any(FormData))

        const formData = mockMessagesAPI.create.mock.calls[0][0]
        expect(formData.get('message[body]')).toBe('Quick reply message')
        expect(formData.get('message[replied_to]')).toBe('original-msg-123')
        expect(formData.get('message[product]')).toBe('product-456')
        expect(formData.get('message[button]')).toBe('btn-789')
        expect(formData.get('session')).toBe('test-session-123')
        expect(formData.get('locale')).toBe('en')
      })

      it('builds and appends message element to container', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Test message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockMessagesContainer.children).toHaveLength(1)
        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerText).toBe('Test message')
        expect(addedElement.getAttribute('data-hellotext--webchat-target')).toBe('message')
      })

      it('clones and processes attachment image correctly', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Message with image',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(1)

        const clonedImage = attachmentContainer.children[0]
        expect(clonedImage.src).toBe('https://example.com/product.jpg')
        expect(clonedImage.alt).toBe('Product image')
        expect(clonedImage.hasAttribute('width')).toBe(false)
        expect(clonedImage.hasAttribute('height')).toBe(false)
      })

      it('scrolls message into view smoothly', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Scroll test',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      })

      it('posts message:sent broadcast message', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Broadcast test',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
          type: 'message:sent',
          element: expect.any(String)
        })

        const broadcastCall = mockBroadcastChannel.postMessage.mock.calls[0][0]
        expect(broadcastCall.type).toBe('message:sent')
        expect(broadcastCall.element).toContain('data-hellotext--webchat-target="message"')
        expect(broadcastCall.element).toContain('data-body')
      })

      it('dispatches set:id action with server response', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'ID dispatch test',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(controller.dispatch).toHaveBeenCalledWith('set:id', {
          target: expect.any(Element),
          detail: 'server-message-123'
        })
      })

      it('dispatches webchat:message:sent event with message data', async () => {
        const eventDetail = {
          id: 'original-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Event dispatch test',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:message:sent', {
          id: 'server-message-123',
          body: 'Event dispatch test',
          attachments: ['https://example.com/product.jpg'],
          replied_to: 'original-123',
          product: 'product-456',
          button: 'btn-789',
          type: 'quick_reply'
        })
      })
    })

    describe('failed message sending', () => {
      beforeEach(() => {
        const mockFailedResponse = {
          failed: true
        }
        mockMessagesAPI.create.mockResolvedValue(mockFailedResponse)
        controller.optimisticTypingTimeout = 'mock-timeout-id'
      })

      it('clears optimistic typing timeout on failure', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
      })

      it('posts message:failed broadcast message', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
          type: 'message:failed',
          id: expect.any(String)
        })
      })

      it('adds failed class to message element', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.classList.contains('failed')).toBe(true)
      })

      it('does not dispatch set:id action on failure', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(controller.dispatch).not.toHaveBeenCalledWith('set:id', expect.anything())
      })

      it('does not dispatch webchat:message:sent event on failure', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockHellotext.eventEmitter.dispatch).not.toHaveBeenCalledWith('webchat:message:sent', expect.anything())
      })
    })

    describe('edge cases', () => {
      beforeEach(() => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123'
          })
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)
      })

      it('handles missing attachment gracefully', async () => {
        const mockCardElementNoImage = document.createElement('div')
        mockCardElementNoImage.innerHTML = '<span>No image here</span>'

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'No attachment message',
          cardElement: mockCardElementNoImage
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('handles null attachment gracefully', async () => {
        // Mock querySelector to return null
        const originalQuerySelector = mockCardElement.querySelector
        mockCardElement.querySelector = jest.fn().mockReturnValue(null)

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Null attachment message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)

        // Restore original method
        mockCardElement.querySelector = originalQuerySelector
      })

      it('handles empty body text', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: '',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerText).toBe('')
      })

      it('handles missing event detail properties', async () => {
        const eventDetail = {
          body: 'Minimal message',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const formData = mockMessagesAPI.create.mock.calls[0][0]
        expect(formData.get('message[replied_to]')).toBe('undefined')
        expect(formData.get('message[product]')).toBe('undefined')
        expect(formData.get('message[button]')).toBe('undefined')
      })

      it('handles API response without id', async () => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({})
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'No ID response',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(controller.dispatch).toHaveBeenCalledWith('set:id', {
          target: expect.any(Element),
          detail: undefined
        })
      })

      it('handles network errors gracefully', async () => {
        mockMessagesAPI.create.mockRejectedValue(new Error('Network error'))

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Network error test',
          cardElement: mockCardElement
        }

        await expect(controller.sendQuickReplyMessage({ detail: eventDetail })).rejects.toThrow('Network error')
      })

      it('inserts message before typing indicator when visible', async () => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123'
          })
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        // Set up typing indicator
        const mockTypingIndicator = document.createElement('div')
        mockTypingIndicator.setAttribute('data-hellotext--webchat-target', 'typingIndicator')
        mockMessagesContainer.appendChild(mockTypingIndicator)

        controller.typingIndicatorTarget = mockTypingIndicator
        controller.typingIndicatorVisible = true
        Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
          get: () => true
        })

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Insert before typing',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        // Message should be inserted before typing indicator
        expect(mockMessagesContainer.children).toHaveLength(2)
        expect(mockMessagesContainer.children[0]).not.toBe(mockTypingIndicator)
        expect(mockMessagesContainer.children[1]).toBe(mockTypingIndicator)
      })

      it('appends message normally when no typing indicator', async () => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123'
          })
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        controller.typingIndicatorVisible = false
        Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
          get: () => false
        })

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Normal append',
          cardElement: mockCardElement
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockMessagesContainer.children).toHaveLength(1)
      })
    })
  })

  describe('carousel message handling', () => {
    let mockHellotext

    beforeEach(() => {
      // Mock DOMParser for carousel tests
      global.DOMParser = jest.fn(() => ({
        parseFromString: jest.fn((html) => ({
          body: {
            firstElementChild: document.createElement('div')
          }
        }))
      }))

      // Mock Hellotext
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn()
        }
      }

      const Hellotext = require('../../src/hellotext').default
      Object.assign(Hellotext, mockHellotext)
    })

    it('handles carousel messages correctly', () => {
      controller.openValue = true // Set to open to avoid unread counter issues
      const mockMessagesAPI = {
        markAsSeen: jest.fn()
      }
      controller.messagesAPI = mockMessagesAPI

      const message = {
        id: 'carousel-123',
        html: '<div class="carousel">Test Carousel</div>',
        carousel: { title: 'Test' }
      }

      controller.onMessageReceived(message)

      expect(mockMessagesContainer.children).toHaveLength(1)
      expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:message:received', {
        ...message,
        body: '',
      })
    })

    it('marks carousel as seen when chat is open', () => {
      controller.openValue = true
      const mockMessagesAPI = {
        markAsSeen: jest.fn()
      }
      controller.messagesAPI = mockMessagesAPI

      const message = {
        id: 'carousel-read',
        html: '<div>Carousel</div>',
        carousel: {}
      }

      controller.onMessageReceived(message)

      expect(mockMessagesAPI.markAsSeen).toHaveBeenCalledWith('carousel-read')
    })

    it('updates unread counter when chat is closed', () => {
      controller.openValue = false
      const mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.innerText = '2'
      controller.unreadCounterTarget = mockUnreadCounter

      const message = {
        id: 'carousel-unread',
        html: '<div>Carousel</div>',
        carousel: {}
      }

      controller.onMessageReceived(message)

      expect(mockUnreadCounter.style.display).toBe('flex')
      expect(mockUnreadCounter.innerText).toBe(3)
    })
  })
})
