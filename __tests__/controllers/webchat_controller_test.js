/**
 * @jest-environment jsdom
 */

import WebchatController from '../../src/controllers/webchat_controller'
import Hellotext from '../../src/hellotext'
import { Locale } from '../../src/core/configuration/locale'
import { Webchat as WebchatConfiguration, modes } from '../../src/core/configuration/webchat'
import { usePopover } from '../../src/controllers/mixins/usePopover'
import { useOpeningSequence } from '../../src/controllers/webchat/useOpeningSequence'
import { useTeaser } from '../../src/controllers/webchat/useTeaser'

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
      configurable: true,
    })

    controller.messagesContainerTarget = mockMessagesContainer

    controller.idValue = 'test-webchat-id'
    controller.conversationIdValue = 'test-conversation-id'
    controller.messageIds = new Set()
    WebchatController.messageTimestampFormatters = {}

    mockBroadcastChannel = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    }

    global.BroadcastChannel = jest.fn(() => mockBroadcastChannel)

    global.DOMParser = jest.fn(() => ({
      parseFromString: jest.fn(),
    }))

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore()
    }
  })

  describe('localizeMessageTimestamps', () => {
    it('formats rendered message timestamps with the configured locale and browser timezone', () => {
      const formatter = { format: jest.fn(() => '10:18 PM') }
      const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => formatter)
      const localeSpy = jest.spyOn(Locale, 'toString').mockReturnValue('en')
      const timestamp = document.createElement('time')

      timestamp.setAttribute('datetime', '2026-06-01T01:18:36Z')
      timestamp.setAttribute('data-message-timestamp', '')
      timestamp.textContent = '08:18 PM'
      mockMessagesContainer.appendChild(timestamp)

      controller.localizeMessageTimestamps()

      expect(timestamp.getAttribute('datetime')).toBe('2026-06-01T01:18:36.000Z')
      expect(timestamp.textContent).toBe('10:18 PM')
      expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en', {
        hour: 'numeric',
        minute: '2-digit',
      })

      localeSpy.mockRestore()
      dateTimeFormatSpy.mockRestore()
    })

    it('reuses timestamp formatters for the same locale', () => {
      const formatter = { format: jest.fn(() => '10:18 PM') }
      const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => formatter)
      const localeSpy = jest.spyOn(Locale, 'toString').mockReturnValue('en')
      const datetimes = ['2026-06-01T01:18:36Z', '2026-06-01T01:19:36Z']

      datetimes.forEach(datetime => {
        const timestamp = document.createElement('time')
        timestamp.setAttribute('datetime', datetime)
        timestamp.setAttribute('data-message-timestamp', '')
        mockMessagesContainer.appendChild(timestamp)
      })

      controller.localizeMessageTimestamps()

      expect(Intl.DateTimeFormat).toHaveBeenCalledTimes(1)

      localeSpy.mockRestore()
      dateTimeFormatSpy.mockRestore()
    })
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
          parseFromString: jest.fn().mockReturnValue(mockDocument),
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: mockHtmlString,
          },
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
          parseFromString: jest.fn().mockReturnValue(mockDocument),
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: complexHtml,
          },
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
            id: messageId,
          },
        }

        controller.onOutboundMessageSent(event)

        expect(existingMessage.classList.contains('failed')).toBe(true)
        expect(existingMessage.className).toBe('message failed')
      })

      it('writes the failure reason into the message timestamp', () => {
        const messageId = 'failed-message-with-reason'
        const existingMessage = document.createElement('div')
        const timestamp = document.createElement('time')

        existingMessage.id = messageId
        timestamp.setAttribute('data-message-timestamp', '')
        timestamp.textContent = 'Just now'
        existingMessage.appendChild(timestamp)
        mockMessagesContainer.appendChild(existingMessage)

        controller.onOutboundMessageSent({
          data: {
            type: 'message:failed',
            id: messageId,
            reason: 'Message cannot be empty.',
          },
        })

        expect(existingMessage.classList.contains('failed')).toBe(true)
        expect(timestamp.textContent).toBe('Message cannot be empty.')
      })

      it('does nothing when message with id is not found', () => {
        const event = {
          data: {
            type: 'message:failed',
            id: 'non-existent-message',
          },
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
            id: 'message-2',
          },
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
            someData: 'test',
          },
        }

        controller.onOutboundMessageSent(event)

        expect(console.log).toHaveBeenCalledWith('Unhandled message event: unknown:event')
      })

      it('handles missing type gracefully', () => {
        const event = {
          data: {
            someData: 'test',
          },
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
          parseFromString: jest.fn().mockReturnValue(mockDocument),
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        const event = {
          data: {
            type: 'message:sent',
            element: '',
          },
        }

        expect(() => controller.onOutboundMessageSent(event)).toThrow()
      })

      it('handles malformed HTML for message:sent', () => {
        const malformedHtml = '<div><span>Unclosed tags'
        const mockParsedElement = document.createElement('div')

        const mockBody = { firstElementChild: mockParsedElement }
        const mockDocument = { body: mockBody }

        const mockDOMParser = {
          parseFromString: jest.fn().mockReturnValue(mockDocument),
        }
        global.DOMParser = jest.fn(() => mockDOMParser)

        mockParsedElement.scrollIntoView = jest.fn()

        const event = {
          data: {
            type: 'message:sent',
            element: malformedHtml,
          },
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
      const timestamp = document.createElement('time')
      timestamp.setAttribute('data-message-timestamp', '')
      mockMessageTemplate.appendChild(timestamp)
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
        markAsSeen: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      // Mock Hellotext
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn(),
        },
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
          id: 'msg-123',
        }

        controller.onMessageReceived(message)

        expect(mockMessagesContainer.children).toHaveLength(1)
        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.style.display).toBe('flex')
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('<p>Hello world!</p>')
        expect(addedElement.getAttribute('data-hellotext--webchat-target')).toBe('message')
      })

      it('localizes incoming message timestamps with the configured locale and browser timezone', () => {
        const formatter = { format: jest.fn(() => '10:18 PM') }
        const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => formatter)
        const localeSpy = jest.spyOn(Locale, 'toString').mockReturnValue('en')

        controller.onMessageReceived({
          body: '<p>Hello world!</p>',
          created_at: '2026-06-01T01:18:36Z',
          id: 'msg-local-timezone',
        })

        const timestamp = mockMessagesContainer.children[0].querySelector('[data-message-timestamp]')
        expect(timestamp.getAttribute('datetime')).toBe('2026-06-01T01:18:36.000Z')
        expect(timestamp.textContent).toBe('10:18 PM')
        expect(Intl.DateTimeFormat).toHaveBeenCalledWith('en', {
          hour: 'numeric',
          minute: '2-digit',
        })

        localeSpy.mockRestore()
        dateTimeFormatSpy.mockRestore()
      })

      it('silently drops a duplicate message that was already claimed in memory', () => {
        controller.openValue = false

        const message = {
          body: '<p>Hello once</p>',
          id: 'duplicate-msg',
        }

        controller.onMessageReceived(message)
        controller.onMessageReceived({
          ...message,
          body: '<p>Hello twice</p>',
        })

        expect(mockMessagesContainer.children).toHaveLength(1)
        expect(mockMessagesContainer.children[0].querySelector('[data-body]').innerHTML).toBe(
          '<p>Hello once</p>',
        )
        expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(1)
      })

      it('silently drops a duplicate message that already has a rendered target', () => {
        const renderedMessage = document.createElement('div')
        renderedMessage.dataset.id = 'rendered-msg'

        Object.defineProperty(controller, 'messageTargets', {
          get: () => [renderedMessage],
          configurable: true,
        })

        controller.onMessageReceived({
          body: '<p>Already rendered</p>',
          id: 'rendered-msg',
        })

        expect(mockMessagesContainer.children).toHaveLength(0)
        expect(mockHellotext.eventEmitter.dispatch).not.toHaveBeenCalled()
      })

      it('handles plain text messages', () => {
        const message = {
          body: 'Simple text message',
          id: 'msg-456',
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe('Simple text message')
      })

      it('handles HTML content in message body', () => {
        const message = {
          body: '<strong>Bold text</strong> and <em>italic text</em>',
          id: 'msg-789',
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerHTML).toBe(
          '<strong>Bold text</strong> and <em>italic text</em>',
        )
      })
    })

    describe('attachment handling', () => {
      it('processes single attachment correctly', () => {
        const message = {
          body: 'Message with attachment',
          attachments: ['https://example.com/image1.jpg'],
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(1)

        const attachmentImage = attachmentContainer.children[0]
        expect(attachmentImage.src).toBe('https://example.com/image1.jpg')
        expect(attachmentImage.style.display).toBe('block')
      })

      it('renders attachments into the plural attachments container', () => {
        const attachmentContainer = mockMessageTemplate.querySelector('[data-attachment-container]')
        attachmentContainer.removeAttribute('data-attachment-container')
        attachmentContainer.setAttribute('data-attachments-container', '')

        controller.onMessageReceived({
          body: 'Message with attachment',
          id: 'msg-plural-attachment-container',
          attachments: ['https://example.com/image1.jpg'],
        })

        const addedElement = mockMessagesContainer.children[0]
        const pluralAttachmentContainer = addedElement.querySelector('[data-attachments-container]')

        expect(pluralAttachmentContainer.children).toHaveLength(1)
        expect(pluralAttachmentContainer.children[0].src).toBe('https://example.com/image1.jpg')
      })

      it('processes multiple attachments correctly', () => {
        const message = {
          body: 'Message with multiple attachments',
          attachments: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.png',
            'https://example.com/image3.gif',
          ],
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
          body: 'Message without attachments',
        }

        controller.onMessageReceived(message)

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('handles empty attachments array', () => {
        const message = {
          body: 'Message with empty attachments',
          attachments: [],
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
          body: 'Scroll test message',
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
          id: 'msg-open-chat',
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
          body: 'Closed chat message',
        }

        controller.onMessageReceived(message)
        expect(mockMessagesAPI.markAsSeen).not.toHaveBeenCalled()
      })

      it('clamps the unread counter at 9 while chat is closed', () => {
        mockUnreadCounter.innerText = '9'

        controller.onMessageReceived({
          body: 'Closed chat message',
          id: 'msg-unread-cap',
        })

        expect(mockUnreadCounter.style.display).toBe('flex')
        expect(mockUnreadCounter.innerText).toBe(9)
      })
    })

    describe('message teaser handling', () => {
      let mockTeaser
      let mockSessionStorage

      beforeEach(() => {
        useTeaser(controller)
        mockTeaser = document.createElement('div')
        mockTeaser.innerHTML = 'Configured teaser'
        controller.teaserTarget = mockTeaser
        mockSessionStorage = {
          getItem: jest.fn().mockReturnValue(null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        }
        Object.defineProperty(window, 'sessionStorage', {
          value: mockSessionStorage,
          writable: true,
        })

        Object.defineProperty(controller, 'hasTeaserTarget', {
          get: () => true,
          configurable: true,
        })
      })

      const setupInboundMessageTeaserTargets = () => {
        mockTeaser.innerHTML = ''

        const firstConfiguredTeaser = document.createElement('section')
        firstConfiguredTeaser.className = 'hellotext--webchat-teaser-stack'
        firstConfiguredTeaser.setAttribute('data-hellotext--webchat-target', 'teaserMessage')
        firstConfiguredTeaser.setAttribute('data-teaser-message', 'true')
        firstConfiguredTeaser.innerHTML = '<article class="hellotext--webchat-teaser-message">Configured one</article>'

        const secondConfiguredTeaser = document.createElement('section')
        secondConfiguredTeaser.className = 'hellotext--webchat-teaser-stack hidden'
        secondConfiguredTeaser.setAttribute('data-hellotext--webchat-target', 'teaserMessage')
        secondConfiguredTeaser.setAttribute('data-teaser-message', 'true')
        secondConfiguredTeaser.innerHTML = '<article class="hellotext--webchat-teaser-message">Configured two</article>'

        const inboundMessageTeaser = document.createElement('section')
        inboundMessageTeaser.className = 'hellotext--webchat-teaser-stack hidden'
        inboundMessageTeaser.setAttribute('data-hellotext--webchat-target', 'inboundMessageTeaser')

        const inboundMessageTeaserBody = document.createElement('article')
        inboundMessageTeaserBody.className = 'hellotext--webchat-teaser-message'
        inboundMessageTeaserBody.setAttribute('data-hellotext--webchat-target', 'inboundMessageTeaserBody')
        inboundMessageTeaser.appendChild(inboundMessageTeaserBody)

        mockTeaser.append(firstConfiguredTeaser, secondConfiguredTeaser, inboundMessageTeaser)

        Object.defineProperty(controller, 'teaserMessageTargets', {
          get: () => [firstConfiguredTeaser, secondConfiguredTeaser],
          configurable: true,
        })
        Object.defineProperty(controller, 'inboundMessageTeaserTarget', {
          get: () => inboundMessageTeaser,
          configurable: true,
        })
        Object.defineProperty(controller, 'hasInboundMessageTeaserTarget', {
          get: () => true,
          configurable: true,
        })
        Object.defineProperty(controller, 'inboundMessageTeaserBodyTarget', {
          get: () => inboundMessageTeaserBody,
          configurable: true,
        })
        Object.defineProperty(controller, 'hasInboundMessageTeaserBodyTarget', {
          get: () => true,
          configurable: true,
        })

        return {
          firstConfiguredTeaser,
          secondConfiguredTeaser,
          inboundMessageTeaser,
          inboundMessageTeaserBody,
        }
      }

      it('overrides and shows the teaser when a closed chat receives a message teaser', () => {
        controller.openValue = false
        mockTeaser.classList.add('invisible')
        const { firstConfiguredTeaser, secondConfiguredTeaser, inboundMessageTeaser, inboundMessageTeaserBody } =
          setupInboundMessageTeaserTargets()

        controller.onMessageReceived({
          body: 'Closed chat message',
          id: 'msg-closed-teaser',
          teaser: '<span>Message teaser</span>',
        })

        expect(firstConfiguredTeaser.classList.contains('hidden')).toBe(true)
        expect(secondConfiguredTeaser.classList.contains('hidden')).toBe(true)
        expect(inboundMessageTeaser.classList.contains('hidden')).toBe(false)
        expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Message teaser</span>')
        expect(mockTeaser.classList.contains('invisible')).toBe(false)
      })

      it('renders incoming teasers through the inbound teaser target without replacing the teaser layout', () => {
        controller.openValue = false
        mockTeaser.classList.add('invisible')
        const {
          firstConfiguredTeaser,
          secondConfiguredTeaser,
          inboundMessageTeaser,
          inboundMessageTeaserBody,
        } = setupInboundMessageTeaserTargets()

        controller.onMessageReceived({
          body: 'Closed chat message',
          id: 'msg-inbound-target-teaser',
          teaser: '<span>Inbound message teaser</span>',
        })

        expect(mockTeaser.children).toHaveLength(3)
        expect(mockTeaser.contains(firstConfiguredTeaser)).toBe(true)
        expect(mockTeaser.contains(secondConfiguredTeaser)).toBe(true)
        expect(mockTeaser.contains(inboundMessageTeaser)).toBe(true)
        expect(firstConfiguredTeaser.classList.contains('hidden')).toBe(true)
        expect(secondConfiguredTeaser.classList.contains('hidden')).toBe(true)
        expect(inboundMessageTeaser.classList.contains('hidden')).toBe(false)
        expect(inboundMessageTeaserBody.className).toBe('hellotext--webchat-teaser-message')
        expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Inbound message teaser</span>')
        expect(mockTeaser.classList.contains('invisible')).toBe(false)
      })

      it('continues handling inbound messages when the inbound teaser slot is missing', () => {
        controller.openValue = false
        mockTeaser.classList.add('invisible')

        expect(() => {
          controller.onMessageReceived({
            body: 'Closed chat message',
            id: 'msg-missing-inbound-teaser-targets',
            teaser: '<span>Unsupported teaser</span>',
          })
        }).not.toThrow()

        expect(mockMessagesContainer.children).toHaveLength(1)
        expect(mockTeaser.innerHTML).toBe('Configured teaser')
        expect(mockTeaser.classList.contains('invisible')).toBe(true)
        expect(mockUnreadCounter.style.display).toBe('flex')
        expect(mockUnreadCounter.innerText).toBe(1)
      })

      it('continues handling inbound messages when no teaser surface is rendered', () => {
        controller.openValue = false
        Object.defineProperty(controller, 'hasTeaserTarget', {
          get: () => false,
          configurable: true,
        })

        expect(() => {
          controller.onMessageReceived({
            body: 'Closed chat message',
            id: 'msg-without-teaser-surface',
            teaser: '<span>Unsupported teaser</span>',
          })
        }).not.toThrow()

        expect(mockMessagesContainer.children).toHaveLength(1)
        expect(mockUnreadCounter.style.display).toBe('flex')
        expect(mockUnreadCounter.innerText).toBe(1)
      })

      it('keeps incoming message teasers ephemeral without marking the session teaser seen', () => {
        controller.openValue = false
        mockTeaser.classList.add('invisible')
        const { inboundMessageTeaserBody } = setupInboundMessageTeaserTargets()

        controller.onMessageReceived({
          body: 'Closed chat message',
          id: 'msg-ephemeral-teaser',
          teaser: '<span>Ephemeral teaser</span>',
        })

        expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Ephemeral teaser</span>')
        expect(mockTeaser.classList.contains('invisible')).toBe(false)
        expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(
          'hellotext:webchat:test-webchat-id:teaser-seen',
          'true',
        )
      })

      it('overrides and hides the teaser when an open chat receives a message teaser', () => {
        controller.openValue = true
        const { inboundMessageTeaser, inboundMessageTeaserBody } = setupInboundMessageTeaserTargets()

        controller.onMessageReceived({
          body: 'Open chat message',
          id: 'msg-open-teaser',
          teaser: '<span>Open message teaser</span>',
        })

        expect(inboundMessageTeaser.classList.contains('hidden')).toBe(false)
        expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Open message teaser</span>')
        expect(mockTeaser.classList.contains('invisible')).toBe(true)
        expect(mockMessagesAPI.markAsSeen).toHaveBeenCalledWith('msg-open-teaser')
      })

      it('does not replace or show the teaser when the message has no teaser', () => {
        controller.openValue = false
        mockTeaser.classList.add('invisible')

        controller.onMessageReceived({
          body: 'Message without teaser',
          id: 'msg-without-teaser',
        })

        expect(mockTeaser.innerHTML).toBe('Configured teaser')
        expect(mockTeaser.classList.contains('invisible')).toBe(true)
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
          get: () => !!controller.typingIndicatorTarget,
        })

        mockClearTimeout = jest.fn()
        global.clearTimeout = mockClearTimeout

        controller.incomingTypingIndicatorTimeout = 'mock-timeout-id'
      })

      it('clears typing indicator timeout when indicator is visible', () => {
        controller.typingIndicatorVisible = true

        const message = {
          body: 'Test message',
          id: 'msg-typing-clear',
        }

        controller.onMessageReceived(message)

        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
      })

      it('removes typing indicator element when indicator is visible', () => {
        controller.typingIndicatorVisible = true
        const removeSpy = jest.spyOn(mockTypingIndicatorTarget, 'remove')

        const message = {
          body: 'Test message',
          id: 'msg-typing-remove',
        }

        controller.onMessageReceived(message)

        expect(removeSpy).toHaveBeenCalled()
      })

      it('sets typing indicator visibility to false when indicator is visible', () => {
        controller.typingIndicatorVisible = true

        const message = {
          body: 'Test message',
          id: 'msg-typing-hide',
        }

        controller.onMessageReceived(message)

        expect(controller.typingIndicatorVisible).toBe(false)
      })

      it('does not clear timeout when typing indicator is not visible', () => {
        controller.typingIndicatorVisible = false

        const message = {
          body: 'Test message',
          id: 'msg-no-typing',
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalled()
      })

      it('does not remove typing indicator element when indicator is not visible', () => {
        controller.typingIndicatorVisible = false
        const removeSpy = jest.spyOn(mockTypingIndicatorTarget, 'remove')

        const message = {
          body: 'Test message',
          id: 'msg-no-typing-remove',
        }

        controller.onMessageReceived(message)
        expect(removeSpy).toHaveBeenCalled()
      })

      it('handles multiple messages with typing indicator clearance', () => {
        controller.typingIndicatorVisible = true

        const message1 = {
          body: 'First message',
          id: 'msg-1',
        }

        const message2 = {
          body: 'Second message',
          id: 'msg-2',
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
          id: 'msg-timeout-id',
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith('timeout-123')
      })

      it('handles typing indicator clearance with null timeout ID', () => {
        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = null

        const message = {
          body: 'Test message',
          id: 'msg-null-timeout',
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith(null)
      })

      it('handles typing indicator clearance with undefined timeout ID', () => {
        controller.typingIndicatorVisible = true
        controller.incomingTypingIndicatorTimeout = undefined

        const message = {
          body: 'Test message',
          id: 'msg-undefined-timeout',
        }

        controller.onMessageReceived(message)
        expect(mockClearTimeout).toHaveBeenCalledWith(undefined)
      })

      it('handles typing indicator clearance when typing indicator target is null', () => {
        controller.typingIndicatorVisible = true
        controller.typingIndicatorTarget = null

        const message = {
          body: 'Test message',
          id: 'msg-null-target',
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
          id: 'msg-undefined-target',
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()
        expect(mockClearTimeout).toHaveBeenCalledWith('mock-timeout-id')
        expect(controller.typingIndicatorVisible).toBe(false)
      })
    })

    describe('edge cases and error handling', () => {
      it('handles missing message body gracefully', () => {
        const message = {
          id: 'msg-no-body',
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
          attachments: null,
        }

        expect(() => controller.onMessageReceived(message)).not.toThrow()

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('handles malformed HTML in message body', () => {
        const message = {
          body: '<div><span>Unclosed tags and <strong>bold text',
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
          metadata: { important: true },
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
        startTypingIndicator: jest.fn(),
      }
      controller.webChatChannel = mockWebChatChannel
      controller.hasSentTypingIndicator = false
      controller.typingIndicatorTimeout = null

      // Mock inputTarget for resizeInput method
      controller.inputTarget = {
        style: {},
        scrollHeight: 50,
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

  describe('onClickOutside', () => {
    it('closes the popover when mode is popover and the click is outside the controller element', () => {
      WebchatConfiguration.mode = modes.POPOVER
      controller.openValue = true

      controller.onClickOutside({ target: document.createElement('div') })

      expect(controller.openValue).toBe(false)
    })

    it('does not close the popover when mode is modal', () => {
      WebchatConfiguration.mode = modes.MODAL
      controller.openValue = true

      controller.onClickOutside({ target: document.createElement('div') })

      expect(controller.openValue).toBe(true)
    })
  })

  describe('openValueChanged', () => {
    let actualUsePopover

    beforeEach(() => {
      actualUsePopover = jest.requireActual('../../src/controllers/mixins/usePopover').usePopover
      controller.popoverTarget = document.createElement('div')
      controller.popoverTarget.showPopover = jest.fn()
      controller.popoverTarget.hidePopover = jest.fn()
      controller.preparePopoverOpenAnimation = jest.fn()
      controller.onPopoverOpened = jest.fn()
      controller.onPopoverClosed = jest.fn()
      controller.disabledValue = false
      actualUsePopover(controller)
    })

    it('prepares the transient open animation only when the popover opens', () => {
      controller.openValue = true

      controller.openValueChanged()

      expect(controller.preparePopoverOpenAnimation).toHaveBeenCalledTimes(1)
      expect(controller.popoverTarget.showPopover).toHaveBeenCalledTimes(1)
      expect(controller.popoverTarget.getAttribute('aria-expanded')).toBe('true')
      expect(controller.onPopoverOpened).toHaveBeenCalledTimes(1)
    })

    it('does not prepare the open animation when the popover closes', () => {
      controller.openValue = false

      controller.openValueChanged()

      expect(controller.preparePopoverOpenAnimation).not.toHaveBeenCalled()
      expect(controller.popoverTarget.hidePopover).toHaveBeenCalledTimes(1)
      expect(controller.popoverTarget.hasAttribute('aria-expanded')).toBe(false)
      expect(controller.onPopoverClosed).toHaveBeenCalledTimes(1)
    })
  })

  describe('preparePopoverOpenAnimation', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      controller.popoverTarget = document.createElement('div')
      controller.fadeOutClasses = ['fade-out']
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('uses a temporary class for the open animation', () => {
      controller.popoverTarget.classList.add('fade-out')

      controller.preparePopoverOpenAnimation()

      expect(controller.popoverTarget.classList.contains('fade-out')).toBe(false)
      expect(controller.popoverTarget.classList.contains('hellotext--webchat-popover-opening')).toBe(true)

      jest.advanceTimersByTime(119)
      expect(controller.popoverTarget.classList.contains('hellotext--webchat-popover-opening')).toBe(true)

      jest.advanceTimersByTime(1)
      expect(controller.popoverTarget.classList.contains('hellotext--webchat-popover-opening')).toBe(false)
    })
  })

  describe('closePopover', () => {
    beforeEach(() => {
      controller.popoverTarget = document.createElement('div')
      controller.fadeOutClasses = ['fade-out']
      controller.openValue = true
    })

    it('minimizes the popover immediately', () => {
      controller.popoverTarget.classList.add('fade-out')
      controller.closePopover()

      expect(controller.popoverTarget.classList.contains('fade-out')).toBe(false)
      expect(controller.openValue).toBe(false)
    })
  })

  describe('closePopoverOnEscape', () => {
    beforeEach(() => {
      controller.closePopover = jest.fn()
      controller.openValue = true
      controller.triggerTarget = document.createElement('button')
      document.body.appendChild(controller.triggerTarget)
    })

    it('closes the popover when Escape is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      const stopPropagation = jest.spyOn(event, 'stopPropagation')

      controller.closePopoverOnEscape(event)

      expect(controller.closePopover).toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(true)
      expect(stopPropagation).toHaveBeenCalled()
      expect(document.activeElement).toBe(controller.triggerTarget)
    })

    it('ignores other keys', () => {
      controller.closePopoverOnEscape(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))

      expect(controller.closePopover).not.toHaveBeenCalled()
    })

    it('ignores Escape when the popover is already closed', () => {
      controller.openValue = false
      controller.closePopoverOnEscape(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))

      expect(controller.closePopover).not.toHaveBeenCalled()
    })
  })

  describe('focusCompose', () => {
    beforeEach(() => {
      const input = document.createElement('textarea')
      document.body.appendChild(input)

      controller.inputTarget = input

      Object.defineProperty(controller, 'hasInputTarget', {
        get: () => true,
        configurable: true,
      })
    })

    it('focuses the compose input from the compose surface', () => {
      const surface = document.createElement('section')
      const event = new Event('pointerdown', { cancelable: true })

      Object.defineProperty(event, 'target', { value: surface })

      controller.focusCompose(event)

      expect(document.activeElement).toBe(controller.inputTarget)
      expect(event.defaultPrevented).toBe(true)
    })

    it('keeps focus inside the emoji picker instead of moving it to the compose input', () => {
      const picker = document.createElement('em-emoji-picker')
      const event = new Event('pointerdown', { cancelable: true })

      picker.setAttribute('tabindex', '0')
      document.body.appendChild(picker)
      picker.focus()
      Object.defineProperty(event, 'target', { value: picker })

      controller.focusCompose(event)

      expect(document.activeElement).toBe(picker)
      expect(document.activeElement).not.toBe(controller.inputTarget)
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('onScroll', () => {
    let mockMessagesAPI
    let mockMessageTemplate
    let mockAttachmentImage

    beforeEach(() => {
      mockMessageTemplate = document.createElement('div')
      const bodyElement = document.createElement('div')
      bodyElement.setAttribute('data-body', '')
      const attachmentContainer = document.createElement('div')
      attachmentContainer.setAttribute('data-attachments-container', '')
      mockMessageTemplate.appendChild(bodyElement)
      mockMessageTemplate.appendChild(attachmentContainer)

      mockAttachmentImage = document.createElement('img')
      mockAttachmentImage.style.display = 'none'

      controller.messageTemplateTarget = mockMessageTemplate
      controller.attachmentImageTarget = mockAttachmentImage
      controller.nextPageValue = 2
      controller.fetchingNextPage = false
      mockMessagesContainer.scrollTop = 0
      mockMessagesContainer.scroll = jest.fn()

      Object.defineProperty(mockMessagesContainer, 'scrollHeight', {
        value: 500,
        configurable: true,
      })

      mockMessagesAPI = {
        index: jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({
            next: null,
            messages: [
              {
                body: '<p>Older message</p>',
                attachments: ['https://example.com/older.jpg'],
                state: 'sent',
              },
            ],
          }),
        }),
      }
      controller.messagesAPI = mockMessagesAPI

      Object.assign(Hellotext, {
        session: 'test-session-123',
      })
    })

    it('renders paginated attachments into the plural attachments container', async () => {
      await controller.onScroll()

      const addedElement = mockMessagesContainer.children[0]
      const attachmentContainer = addedElement.querySelector('[data-attachments-container]')

      expect(mockMessagesAPI.index).toHaveBeenCalledWith({
        page: 2,
        session: 'test-session-123',
      })
      expect(attachmentContainer.children).toHaveLength(1)
      expect(attachmentContainer.children[0].src).toBe('https://example.com/older.jpg')
    })
  })

  describe('connect', () => {
    let mockTrigger
    let mockPopover
    let mockTeaser
    let mockToolbar
    let mockWebChatChannel
    let mockLocalStorage
    let mockSessionStorage

    beforeEach(() => {
      mockTrigger = document.createElement('button')
      mockPopover = document.createElement('div')
      mockTeaser = document.createElement('div')
      mockToolbar = document.createElement('div')

      controller.triggerTarget = mockTrigger
      controller.popoverTarget = mockPopover
      controller.teaserTarget = mockTeaser
      controller.toolbarTarget = mockToolbar
      controller.broadcastChannel = mockBroadcastChannel

      mockWebChatChannel = {
        onMessage: jest.fn(),
        onTypingStart: jest.fn(),
        onReaction: jest.fn(),
      }
      controller.webChatChannel = mockWebChatChannel

      mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })

      Object.assign(Hellotext, {
        business: {
          features: {
            white_label: true,
          },
        },
        eventEmitter: {
          dispatch: jest.fn(),
        },
      })

      usePopover.mockImplementation(controller => {
        controller.setupFloatingUI = jest.fn()
      })
    })

    afterEach(() => {
      usePopover.mockReset()
      jest.useRealTimers()
    })

    const setHasTeaserTarget = value => {
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => value,
        configurable: true,
      })
    }

    const setTeaserMessages = delays => {
      mockTeaser.innerHTML = ''

      const messages = delays.map(delay => {
        const message = document.createElement('section')
        message.setAttribute('data-teaser-message', 'true')

        if (delay !== undefined) {
          message.dataset.delaySeconds = String(delay)
        }

        mockTeaser.appendChild(message)

        return message
      })

      return messages
    }

    const allowPreConversationTeaser = () => {
      controller.conversationIdValue = ''
      controller.openValue = false

      Object.defineProperty(controller, 'messageTargets', {
        get: () => [],
        configurable: true,
      })
    }

    const teaserSeenKey = () => `hellotext:webchat:${controller.idValue}:teaser-seen`

    it('sets up floating UI for the teaser with absolute positioning', () => {
      setHasTeaserTarget(true)

      controller.connect()

      expect(controller.setupFloatingUI).toHaveBeenNthCalledWith(1, {
        trigger: mockTrigger,
        popover: mockPopover,
      })
      expect(controller.setupFloatingUI).toHaveBeenNthCalledWith(2, {
        trigger: mockTrigger,
        popover: mockTeaser,
        strategy: 'absolute',
      })
    })

    it('listens for Escape in the capture phase so focused compose controls cannot swallow it', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

      setHasTeaserTarget(false)
      controller.connect()

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', controller.closePopoverOnEscape, true)
    })

    it('isolates message scrolling from host smooth scroll handlers', () => {
      const addEventListenerSpy = jest.spyOn(mockMessagesContainer, 'addEventListener')

      setHasTeaserTarget(false)
      controller.connect()

      expect(mockMessagesContainer.style.overscrollBehavior).toBe('contain')
      expect(mockMessagesContainer.style.webkitOverflowScrolling).toBe('touch')
      expect(mockMessagesContainer.style.touchAction).toBe('pan-y')
      expect(mockMessagesContainer.hasAttribute('data-lenis-prevent')).toBe(true)
      expect(mockMessagesContainer.hasAttribute('data-lenis-prevent-wheel')).toBe(true)
      expect(mockMessagesContainer.hasAttribute('data-lenis-prevent-touch')).toBe(true)
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'wheel',
        controller.stopHostScrollPropagation,
        expect.objectContaining({ capture: true, passive: true }),
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        controller.stopHostScrollPropagation,
        expect.objectContaining({ capture: true, passive: true }),
      )
    })

    it('stops host scroll events from bubbling out of the message scroller', () => {
      const event = new WheelEvent('wheel')
      const stopPropagation = jest.spyOn(event, 'stopPropagation')

      controller.stopHostScrollPropagation(event)

      expect(stopPropagation).toHaveBeenCalled()
    })

    it('removes the capture-phase Escape listener on disconnect', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      setHasTeaserTarget(false)
      controller.floatingUICleanup = jest.fn()
      controller.connect()
      controller.disconnect()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', controller.closePopoverOnEscape, true)
    })

    it('removes message scroll isolation listeners on disconnect', () => {
      const removeEventListenerSpy = jest.spyOn(mockMessagesContainer, 'removeEventListener')

      setHasTeaserTarget(false)
      controller.floatingUICleanup = jest.fn()
      controller.connect()
      controller.disconnect()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'wheel',
        controller.stopHostScrollPropagation,
        expect.objectContaining({ capture: true, passive: true }),
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        controller.stopHostScrollPropagation,
        expect.objectContaining({ capture: true, passive: true }),
      )
    })

    it('does not set up teaser positioning without a teaser target', () => {
      setHasTeaserTarget(false)

      controller.connect()

      expect(controller.setupFloatingUI).toHaveBeenCalledTimes(1)
      expect(controller.setupFloatingUI).toHaveBeenCalledWith({
        trigger: mockTrigger,
        popover: mockPopover,
      })
    })

    it('does not start teaser cycling without a teaser target', () => {
      allowPreConversationTeaser()
      setHasTeaserTarget(false)
      const messages = setTeaserMessages([2])

      controller.connect()

      expect(messages[0].classList.contains('hidden')).toBe(false)
      expect(controller.teaserCycleTimeout).toBe(null)
    })

    it('does not start teaser presentation when the session has already seen it', () => {
      allowPreConversationTeaser()
      mockSessionStorage.getItem.mockImplementation(key =>
        key === teaserSeenKey() ? 'true' : null,
      )
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([2])

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(messages[0].classList.contains('hidden')).toBe(false)
      expect(controller.teaserCycleTimeout).toBe(null)
    })

    it('scopes the session seen flag to the rendered teaser version', () => {
      allowPreConversationTeaser()
      mockTeaser.dataset.teaserVersion = 'new-version'
      mockSessionStorage.getItem.mockImplementation(key =>
        key === `hellotext:webchat:${controller.idValue}:teaser-seen:old-version` ? 'true' : null,
      )
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([2])

      controller.connect()

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
        `hellotext:webchat:${controller.idValue}:teaser-seen:new-version`,
      )
      expect(mockTeaser.classList.contains('invisible')).toBe(false)
      expect(messages[0].classList.contains('hidden')).toBe(false)
    })

    it('hides the teaser without teaser messages', () => {
      allowPreConversationTeaser()
      setHasTeaserTarget(true)
      setTeaserMessages([])

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(controller.teaserCycleTimeout).toBe(null)
    })

    it('shows the first teaser message and hides later messages on connect', () => {
      jest.useFakeTimers()
      allowPreConversationTeaser()
      mockTeaser.classList.add('invisible')
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([2, 4, 6])

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(false)
      expect(messages[0].classList.contains('hidden')).toBe(false)
      expect(messages[1].classList.contains('hidden')).toBe(true)
      expect(messages[2].classList.contains('hidden')).toBe(true)
    })

    it('does not schedule timers for a single teaser message', () => {
      jest.useFakeTimers()
      allowPreConversationTeaser()
      setHasTeaserTarget(true)
      setTeaserMessages([2])

      controller.connect()

      expect(controller.teaserCycleTimeout).toBe(null)
    })

    it('uses a 250ms minimum before advancing zero or blank teaser delays', () => {
      jest.useFakeTimers()
      allowPreConversationTeaser()
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([0, undefined, 1])

      controller.connect()

      jest.advanceTimersByTime(249)
      expect(messages[0].classList.contains('hidden')).toBe(false)
      expect(messages[1].classList.contains('hidden')).toBe(true)
      expect(messages[2].classList.contains('hidden')).toBe(true)

      jest.advanceTimersByTime(1)
      expect(messages[0].classList.contains('hidden')).toBe(true)
      expect(messages[1].classList.contains('hidden')).toBe(false)
      expect(messages[2].classList.contains('hidden')).toBe(true)

      jest.advanceTimersByTime(249)
      expect(messages[1].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(1)
      expect(messages[1].classList.contains('hidden')).toBe(true)
      expect(messages[2].classList.contains('hidden')).toBe(false)
    })

    it('advances teaser messages using the current message delay and stops after the last', () => {
      jest.useFakeTimers()
      allowPreConversationTeaser()
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([1, 2, 3])

      controller.connect()

      expect(messages[0].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(999)
      expect(messages[0].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(1)
      expect(messages[0].classList.contains('hidden')).toBe(true)
      expect(messages[1].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(1999)
      expect(messages[1].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(1)
      expect(messages[1].classList.contains('hidden')).toBe(true)
      expect(messages[2].classList.contains('hidden')).toBe(false)

      jest.advanceTimersByTime(10000)
      expect(messages[0].classList.contains('hidden')).toBe(true)
      expect(messages[1].classList.contains('hidden')).toBe(true)
      expect(messages[2].classList.contains('hidden')).toBe(false)
      expect(controller.teaserCycleTimeout).toBe(null)
    })

    it('clears pending teaser cycling on disconnect', () => {
      jest.useFakeTimers()
      allowPreConversationTeaser()
      setHasTeaserTarget(true)
      const messages = setTeaserMessages([1, 1])
      controller.floatingUICleanup = jest.fn()

      controller.connect()
      controller.disconnect()
      jest.advanceTimersByTime(1000)

      expect(messages[0].classList.contains('hidden')).toBe(false)
      expect(messages[1].classList.contains('hidden')).toBe(true)
    })

    it('marks the teaser seen and hides it when the webchat is already open', () => {
      allowPreConversationTeaser()
      controller.openValue = true
      setHasTeaserTarget(true)
      setTeaserMessages([1])

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(teaserSeenKey(), 'true')
    })

    it('marks the teaser seen and hides it when a conversation already exists', () => {
      controller.conversationIdValue = 'existing-conversation'
      controller.openValue = false
      setHasTeaserTarget(true)
      setTeaserMessages([1])

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(teaserSeenKey(), 'true')
    })

    it('marks the teaser seen and hides it when rendered messages already exist', () => {
      const renderedMessage = document.createElement('article')
      controller.conversationIdValue = ''
      controller.openValue = false
      setHasTeaserTarget(true)
      setTeaserMessages([1])
      Object.defineProperty(controller, 'messageTargets', {
        get: () => [renderedMessage],
        configurable: true,
      })

      controller.connect()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(teaserSeenKey(), 'true')
    })

    it('does not schedule an automatic open for click-triggered behaviour', () => {
      jest.useFakeTimers()

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_click',
        delay_seconds: 0,
        first_visit_only: true,
        once_per_session: true,
      }

      controller.connect()
      jest.runOnlyPendingTimers()

      expect(controller.openValue).toBe(false)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(controller.firstVisitKey(), '1')
      expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(controller.sessionKey(), '1')
    })

    it('opens after the configured on-load delay and marks enabled gates', () => {
      jest.useFakeTimers()

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 5,
        first_visit_only: true,
        once_per_session: true,
      }

      controller.connect()

      jest.advanceTimersByTime(4999)
      expect(controller.openValue).toBe(false)

      jest.advanceTimersByTime(1)

      expect(controller.openValue).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(controller.firstVisitKey(), '1')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(controller.sessionKey(), '1')
    })

    it('opens immediately after connect when the on-load delay is zero', () => {
      jest.useFakeTimers()

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 0,
        first_visit_only: false,
        once_per_session: false,
      }

      controller.connect()
      expect(controller.openValue).toBe(false)

      jest.runOnlyPendingTimers()

      expect(controller.openValue).toBe(true)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(controller.firstVisitKey(), '1')
      expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(controller.sessionKey(), '1')
    })

    it('does not auto-open when the first visit gate has already been marked', () => {
      jest.useFakeTimers()
      mockLocalStorage.getItem.mockImplementation(key =>
        key === controller.firstVisitKey() ? '1' : null,
      )

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 0,
        first_visit_only: true,
        once_per_session: false,
      }

      controller.connect()
      jest.runOnlyPendingTimers()

      expect(controller.openValue).toBe(false)
    })

    it('does not auto-open when the session gate has already been marked', () => {
      jest.useFakeTimers()
      mockSessionStorage.getItem.mockImplementation(key =>
        key === controller.sessionKey() ? '1' : null,
      )

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 0,
        first_visit_only: false,
        once_per_session: true,
      }

      controller.connect()
      jest.runOnlyPendingTimers()

      expect(controller.openValue).toBe(false)
    })

    it('does not mark gates when the widget is already open before the timer fires', () => {
      jest.useFakeTimers()

      controller.openValue = true
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 5,
        first_visit_only: true,
        once_per_session: true,
      }

      controller.connect()
      jest.advanceTimersByTime(5000)

      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(controller.firstVisitKey(), '1')
      expect(mockSessionStorage.setItem).not.toHaveBeenCalledWith(controller.sessionKey(), '1')
    })

    it('clears pending behaviour opens on disconnect', () => {
      jest.useFakeTimers()

      controller.openValue = false
      controller.behaviourValue = {
        trigger: 'on_load',
        delay_seconds: 5,
        first_visit_only: false,
        once_per_session: false,
      }
      controller.floatingUICleanup = jest.fn()

      controller.connect()
      controller.disconnect()
      jest.advanceTimersByTime(5000)

      expect(controller.openValue).toBe(false)
    })
  })

  describe('onPopoverOpened', () => {
    let mockHellotext
    let mockLocalStorage
    let mockSessionStorage
    let mockTeaser
    let mockUnreadCounter

    beforeEach(() => {
      useTeaser(controller)
      useOpeningSequence(controller)
      controller.setupOpeningSequence()
      mockTeaser = document.createElement('div')
      mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.style.display = 'none'

      controller.popoverTarget = document.createElement('div')
      controller.fadeOutClasses = ['fade-out']
      controller.scrolled = true
      controller.teaserTarget = mockTeaser
      controller.unreadCounterTarget = mockUnreadCounter
      controller.messagesAPI = {
        markAsSeen: jest.fn(),
      }

      Object.defineProperty(controller, 'onMobile', {
        get: () => true,
        configurable: true,
      })

      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }

      mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })

      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })

      Object.assign(Hellotext, mockHellotext)
    })

    it('hides the teaser when the popover opens', () => {
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })
      controller.idValue = 'test-webchat-id'

      controller.onPopoverOpened()

      expect(mockTeaser.classList.contains('invisible')).toBe(true)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'hellotext:webchat:test-webchat-id:teaser-seen',
        'true',
      )
    })

    it('clears the transient message teaser when the popover opens', () => {
      controller.messageTeaserValue = 'Incoming message teaser'
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })

      controller.onPopoverOpened()

      expect(controller.messageTeaserValue).toBe(null)
      expect(mockTeaser.classList.contains('invisible')).toBe(true)
    })
  })

  describe('opening sequence', () => {
    let mockHellotext
    let mockLocalStorage
    let mockMessagesAPI
    let mockMessageTemplate
    let mockOpeningSequence
    let mockUnreadCounter
    let mockWebChatChannel
    let mockSessionStorage

    beforeEach(() => {
      jest.useFakeTimers()
      useTeaser(controller)
      useOpeningSequence(controller)
      controller.setupOpeningSequence()

      mockMessageTemplate = document.createElement('div')
      mockMessageTemplate.style.display = 'none'
      const bodyElement = document.createElement('div')
      bodyElement.setAttribute('data-body', '')
      const attachmentContainer = document.createElement('div')
      attachmentContainer.setAttribute('data-attachment-container', '')
      mockMessageTemplate.appendChild(bodyElement)
      mockMessageTemplate.appendChild(attachmentContainer)
      mockMessagesContainer.appendChild(mockMessageTemplate)

      mockOpeningSequence = document.createElement('section')
      mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.style.display = 'none'
      mockUnreadCounter.innerText = '0'

      mockMessagesAPI = {
        create: jest.fn(),
        markAsSeen: jest.fn(),
      }

      mockWebChatChannel = {
        updateSubscriptionWith: jest.fn(),
      }

      mockHellotext = {
        session: 'test-session-123',
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }

      mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      }

      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }

      controller.conversationIdValue = ''
      controller.messageTemplateTarget = mockMessageTemplate
      controller.messagesContainerTarget = mockMessagesContainer
      controller.openingSequenceTarget = mockOpeningSequence
      controller.popoverTarget = document.createElement('div')
      controller.fadeOutClasses = ['fade-out']
      controller.scrolled = true
      controller.unreadCounterTarget = mockUnreadCounter
      controller.messagesAPI = mockMessagesAPI
      controller.webChatChannel = mockWebChatChannel
      controller.broadcastChannel = mockBroadcastChannel
      controller.files = []
      controller.resizeInput = jest.fn()
      controller.show = jest.fn()
      controller.showOptimisticTypingIndicator = jest.fn()
      controller.resetTypingIndicatorTimer = jest.fn()
      controller.typingIndicatorVisible = true

      Object.defineProperty(controller, 'onMobile', {
        get: () => true,
        configurable: true,
      })
      Object.defineProperty(controller, 'hasOpeningSequenceTarget', {
        get: () => true,
        configurable: true,
      })
      Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
        get: () => false,
        configurable: true,
      })
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => false,
        configurable: true,
      })
      Object.defineProperty(mockMessagesContainer, 'scrollHeight', {
        value: 640,
        configurable: true,
      })

      mockMessagesContainer.scroll = jest.fn()
      Element.prototype.scrollIntoView = jest.fn()

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })

      Object.assign(Hellotext, mockHellotext)

      const { Locale } = require('../../src/core/configuration/locale')
      Object.assign(Locale, {
        toString: jest.fn().mockReturnValue('en'),
      })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    const setOpeningSequenceMessages = configs => {
      const messages = configs.map(({ id, delay }) => {
        const message = document.createElement('article')
        message.hidden = true
        message.dataset.openingSequenceMessageId = id
        message.dataset.delaySeconds = String(delay)
        mockOpeningSequence.appendChild(message)

        return message
      })

      Object.defineProperty(controller, 'openingSequenceMessageTargets', {
        get: () => messages,
        configurable: true,
      })

      return messages
    }

    const setupSuccessfulMessageResponse = (response = {}) => {
      mockMessagesAPI.create.mockResolvedValue({
        failed: false,
        json: jest.fn().mockResolvedValue({
          id: 'server-message-123',
          conversation: 'current-conversation',
          ...response,
        }),
      })
    }

    const setupFailedMessageResponse = () => {
      mockMessagesAPI.create.mockResolvedValue({ failed: true })
    }

    const setupComposeTargets = () => {
      controller.inputTarget = document.createElement('textarea')
      controller.inputTarget.value = 'hello'
      controller.attachmentInputTarget = document.createElement('input')
      controller.attachmentContainerTarget = document.createElement('section')
      controller.errorMessageContainerTarget = document.createElement('section')
    }

    it('does nothing without an opening sequence target', () => {
      const [message] = setOpeningSequenceMessages([{ id: 'shown', delay: 1 }])
      Object.defineProperty(controller, 'hasOpeningSequenceTarget', {
        get: () => false,
        configurable: true,
      })

      controller.startOpeningSequence()
      jest.advanceTimersByTime(1000)

      expect(controller.openingSequenceStarted).toBe(false)
      expect(message.hidden).toBe(true)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
    })

    it('does nothing when a conversation already exists', () => {
      const [message] = setOpeningSequenceMessages([{ id: 'shown', delay: 1 }])
      controller.conversationIdValue = 'existing-conversation'

      controller.startOpeningSequence()
      jest.advanceTimersByTime(1000)

      expect(controller.openingSequenceStarted).toBe(false)
      expect(message.hidden).toBe(true)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
    })

    it('does nothing without opening sequence messages', () => {
      setOpeningSequenceMessages([])

      controller.startOpeningSequence()

      expect(controller.openingSequenceStarted).toBe(false)
      expect(controller.openingSequenceTimeout).toBe(null)
    })

    it('starts once when the webchat opens without a conversation', () => {
      setOpeningSequenceMessages([{ id: 'shown', delay: 1 }])

      controller.onPopoverOpened()
      const firstTimeout = controller.openingSequenceTimeout
      controller.onPopoverOpened()

      expect(controller.openingSequenceStarted).toBe(true)
      expect(controller.openingSequenceTimeout).toBe(firstTimeout)
      expect(mockMessagesAPI.markAsSeen).not.toHaveBeenCalled()
    })

    it('reveals staged messages using each message delay', () => {
      const messages = setOpeningSequenceMessages([
        { id: 'first', delay: 2 },
        { id: 'second', delay: 3 },
      ])

      controller.startOpeningSequence()

      jest.advanceTimersByTime(1999)
      expect(messages[0].hidden).toBe(true)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])

      jest.advanceTimersByTime(1)
      expect(messages[0].parentNode).toBe(mockMessagesContainer)
      expect(messages[0].hidden).toBe(false)
      expect(Array.from(mockMessagesContainer.children)).toEqual([messages[0], mockMessageTemplate])
      expect(controller.revealedOpeningSequenceMessageIds).toEqual(['first'])
      expect(mockMessagesContainer.scroll).toHaveBeenCalledWith({
        top: 640,
        behavior: 'smooth',
      })

      jest.advanceTimersByTime(2999)
      expect(messages[1].hidden).toBe(true)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual(['first'])

      jest.advanceTimersByTime(1)
      expect(messages[1].parentNode).toBe(mockMessagesContainer)
      expect(messages[1].hidden).toBe(false)
      expect(Array.from(mockMessagesContainer.children)).toEqual([
        messages[0],
        messages[1],
        mockMessageTemplate,
      ])
      expect(controller.revealedOpeningSequenceMessageIds).toEqual(['first', 'second'])
    })

    it('reveals zero-delay messages through the timer path', () => {
      const [message] = setOpeningSequenceMessages([{ id: 'immediate', delay: 0 }])

      controller.startOpeningSequence()
      expect(message.hidden).toBe(true)

      jest.advanceTimersByTime(0)

      expect(message.hidden).toBe(false)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual(['immediate'])
    })

    it('clears pending opening sequence timers on teardown', () => {
      const [message] = setOpeningSequenceMessages([{ id: 'late', delay: 5 }])

      controller.startOpeningSequence()
      controller.teardownOpeningSequence()
      jest.advanceTimersByTime(5000)

      expect(message.hidden).toBe(true)
      expect(controller.openingSequenceTimeout).toBe(null)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
    })

    it('cancels pending messages and sends only revealed ids with a compose message', async () => {
      const messages = setOpeningSequenceMessages([
        { id: 'shown', delay: 0 },
        { id: 'unrevealed', delay: 5 },
      ])
      setupComposeTargets()
      setupSuccessfulMessageResponse()

      controller.startOpeningSequence()
      jest.advanceTimersByTime(0)

      await controller.sendMessage({ target: controller.inputTarget })

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.getAll('message[opening_sequence_message_ids][]')).toEqual(['shown'])
      expect(messages[1].hidden).toBe(true)
      expect(controller.openingSequenceCancelled).toBe(true)
      expect(controller.openingSequenceTimeout).toBe(null)
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'hellotext:webchat:test-webchat-id:teaser-seen',
        'true',
      )
    })

    it('keeps revealed ids when the first compose message fails', async () => {
      setOpeningSequenceMessages([{ id: 'shown', delay: 0 }])
      setupComposeTargets()
      setupFailedMessageResponse()

      controller.startOpeningSequence()
      jest.advanceTimersByTime(0)

      await controller.sendMessage({ target: controller.inputTarget })

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.getAll('message[opening_sequence_message_ids][]')).toEqual(['shown'])
      expect(controller.revealedOpeningSequenceMessageIds).toEqual(['shown'])
    })

    it('renders composed attachments into the plural attachments container', async () => {
      const attachmentContainer = mockMessageTemplate.querySelector('[data-attachment-container]')
      attachmentContainer.removeAttribute('data-attachment-container')
      attachmentContainer.setAttribute('data-attachments-container', '')
      setupComposeTargets()
      setupSuccessfulMessageResponse()

      const attachment = document.createElement('img')
      attachment.src = 'https://example.com/composed.jpg'
      controller.attachmentContainerTarget.appendChild(attachment)

      await controller.sendMessage({ target: controller.inputTarget })

      const addedElement = mockMessagesContainer.lastElementChild
      const pluralAttachmentContainer = addedElement.querySelector('[data-attachments-container]')

      expect(pluralAttachmentContainer.children).toHaveLength(1)
      expect(pluralAttachmentContainer.children[0].src).toBe('https://example.com/composed.jpg')
    })

    it('sends revealed ids with a teaser quick reply', async () => {
      setOpeningSequenceMessages([{ id: 'shown', delay: 0 }])
      setupSuccessfulMessageResponse()
      const button = document.createElement('button')
      button.dataset.text = 'I need help'

      controller.startOpeningSequence()
      jest.advanceTimersByTime(0)

      await controller.sendTeaserQuickReply({
        currentTarget: button,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      })

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.getAll('message[opening_sequence_message_ids][]')).toEqual(['shown'])
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
    })

    it('sends revealed ids with a message quick reply', async () => {
      setOpeningSequenceMessages([{ id: 'shown', delay: 0 }])
      setupSuccessfulMessageResponse()
      controller.dispatch = jest.fn()
      const cardElement = document.createElement('section')

      controller.startOpeningSequence()
      jest.advanceTimersByTime(0)

      await controller.sendQuickReplyMessage({
        detail: {
          id: 'opening-message',
          product: 'product-1',
          buttonId: 'button-1',
          body: 'Quick reply',
          cardElement,
        },
      })

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.getAll('message[opening_sequence_message_ids][]')).toEqual(['shown'])
      expect(controller.revealedOpeningSequenceMessageIds).toEqual([])
    })
  })

  describe('onPopoverClosed', () => {
    let mockHellotext
    let mockLocalStorage

    beforeEach(() => {
      useTeaser(controller)
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }

      // Mock localStorage
      mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
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

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hellotext--webchat--test-webchat-123',
        'closed',
      )
    })

    it('does not restore the pre-conversation teaser after close', () => {
      const teaser = document.createElement('div')
      teaser.classList.add('invisible')
      teaser.innerHTML = '<section data-teaser-message>Pre-conversation teaser</section>'

      controller.teaserTarget = teaser
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })
      controller.startTeaserPresentation = jest.fn()

      controller.onPopoverClosed()

      expect(teaser.classList.contains('invisible')).toBe(true)
      expect(controller.startTeaserPresentation).not.toHaveBeenCalled()
    })

    it('keeps the teaser hidden when closing after the session flag is set', () => {
      const teaser = document.createElement('div')
      teaser.classList.add('invisible')

      controller.teaserTarget = teaser
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })

      controller.onPopoverClosed()

      expect(teaser.classList.contains('invisible')).toBe(true)
    })
  })

  describe('onTeaserClick', () => {
    let mockSessionStorage

    beforeEach(() => {
      useOpeningSequence(controller)
      controller.setupOpeningSequence()
      useTeaser(controller)
      controller.teaserTarget = document.createElement('section')
      controller.show = jest.fn()
      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })
    })

    it('opens the webchat when the teaser surface is clicked', () => {
      const teaser = document.createElement('section')

      controller.onTeaserClick({ target: teaser })

      expect(controller.show).toHaveBeenCalled()
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'hellotext:webchat:test-webchat-id:teaser-seen',
        'true',
      )
    })

    it('lets anchor clicks behave normally', () => {
      const anchor = document.createElement('a')
      const label = document.createElement('span')
      anchor.appendChild(label)

      controller.onTeaserClick({ target: label })

      expect(controller.show).not.toHaveBeenCalled()
    })
  })

  describe('sendTeaserQuickReply', () => {
    let mockMessageTemplate
    let mockMessagesAPI
    let mockHellotext
    let mockLocale
    let mockBroadcastChannel
    let mockWebChatChannel
    let mockSessionStorage

    beforeEach(() => {
      useOpeningSequence(controller)
      controller.setupOpeningSequence()
      useTeaser(controller)
      mockMessageTemplate = document.createElement('div')
      mockMessageTemplate.style.display = 'none'
      const bodyElement = document.createElement('div')
      bodyElement.setAttribute('data-body', '')
      mockMessageTemplate.appendChild(bodyElement)

      controller.messageTemplateTarget = mockMessageTemplate
      controller.messagesContainerTarget = mockMessagesContainer
      controller.conversationIdValue = 'current-conversation'
      controller.teaserTarget = document.createElement('section')
      controller.show = jest.fn()
      controller.resetTypingIndicatorTimer = jest.fn()
      controller.typingIndicatorVisible = true

      Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
        get: () => false,
        configurable: true,
      })

      mockMessagesAPI = {
        create: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      mockBroadcastChannel = {
        postMessage: jest.fn(),
      }
      controller.broadcastChannel = mockBroadcastChannel

      mockWebChatChannel = {
        updateSubscriptionWith: jest.fn(),
      }
      controller.webChatChannel = mockWebChatChannel

      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })

      mockHellotext = {
        session: 'test-session-123',
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }
      Object.assign(Hellotext, mockHellotext)

      mockLocale = {
        toString: jest.fn().mockReturnValue('en'),
      }
      const { Locale } = require('../../src/core/configuration/locale')
      Object.assign(Locale, mockLocale)

      Element.prototype.scrollIntoView = jest.fn()

      mockMessagesAPI.create.mockResolvedValue({
        failed: false,
        json: jest.fn().mockResolvedValue({
          id: 'server-message-123',
          conversation: 'current-conversation',
        }),
      })
    })

    const buildTeaserButton = attributes => {
      const button = document.createElement('button')
      button.textContent = attributes.textContent || ''

      Object.entries(attributes.dataset || {}).forEach(([key, value]) => {
        button.dataset[key] = value
      })

      return button
    }

    const buildTeaserQuickReplyEvent = button => ({
      currentTarget: button,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    })

    it('prevents the teaser button click from submitting or opening twice', async () => {
      const button = buildTeaserButton({ dataset: { text: 'I need help' } })
      const event = buildTeaserQuickReplyEvent(button)

      await controller.sendTeaserQuickReply(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('uses data-value for the sent body before other button content', async () => {
      const button = buildTeaserButton({
        textContent: 'Visible fallback',
        dataset: {
          text: 'Data text',
          value: 'Data value',
        },
      })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.get('message[body]')).toBe('Data value')
    })

    it('falls back to data-text for the sent body', async () => {
      const button = buildTeaserButton({
        textContent: 'Visible fallback',
        dataset: {
          text: 'Data text',
        },
      })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.get('message[body]')).toBe('Data text')
    })

    it('ignores blank data-value and falls back to data-text', async () => {
      const button = buildTeaserButton({
        textContent: 'Visible fallback',
        dataset: {
          value: '   ',
          text: 'Data text',
        },
      })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.get('message[body]')).toBe('Data text')
    })

    it('falls back to trimmed button text for the sent body', async () => {
      const button = buildTeaserButton({ textContent: '  Visible fallback  ' })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.get('message[body]')).toBe('Visible fallback')
    })

    it('does not open or send when the teaser button text is blank', async () => {
      const button = buildTeaserButton({ textContent: '   ' })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      expect(controller.show).not.toHaveBeenCalled()
      expect(mockMessagesAPI.create).not.toHaveBeenCalled()
      expect(mockMessagesContainer.children).toHaveLength(0)
    })

    it('opens the webchat and creates form data for a customer message', async () => {
      const button = buildTeaserButton({ dataset: { text: 'I need help' } })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      expect(controller.show).toHaveBeenCalled()
      expect(mockMessagesAPI.create).toHaveBeenCalledWith(expect.any(FormData))

      const formData = mockMessagesAPI.create.mock.calls[0][0]
      expect(formData.get('message[body]')).toBe('I need help')
      expect(formData.get('session')).toBe('test-session-123')
      expect(formData.get('locale')).toBe('en')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'hellotext:webchat:test-webchat-id:teaser-seen',
        'true',
      )
      expect(controller.teaserTarget.classList.contains('invisible')).toBe(true)
    })

    it('appends an optimistic customer bubble and broadcasts the sent message', async () => {
      const button = buildTeaserButton({ dataset: { text: 'I need help' } })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      expect(mockMessagesContainer.children).toHaveLength(1)
      const addedElement = mockMessagesContainer.children[0]

      expect(addedElement.querySelector('[data-body]').innerText).toBe('I need help')
      expect(addedElement.getAttribute('data-hellotext--webchat-target')).toBe('message')
      expect(addedElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: 'message:sent',
        element: expect.any(String),
      })
    })

    it('sets the server id and dispatches a quick reply event without card reply fields', async () => {
      const button = buildTeaserButton({
        dataset: {
          text: 'I need help',
          value: 'need_help',
          type: 'quick_reply',
        },
      })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const addedElement = mockMessagesContainer.children[0]
      expect(addedElement.getAttribute('data-id')).toBe('server-message-123')

      expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:message:sent', {
        id: 'server-message-123',
        body: 'need_help',
        attachments: [],
        type: 'quick_reply',
        teaser: {
          text: 'I need help',
          value: 'need_help',
          type: 'quick_reply',
        },
      })

      const message = mockHellotext.eventEmitter.dispatch.mock.calls[0][1]
      expect(message).not.toHaveProperty('replied_to')
      expect(message).not.toHaveProperty('product')
      expect(message).not.toHaveProperty('button')
    })

    it('updates the webchat channel when the response changes conversation', async () => {
      mockMessagesAPI.create.mockResolvedValue({
        failed: false,
        json: jest.fn().mockResolvedValue({
          id: 'server-message-123',
          conversation: 'new-conversation',
        }),
      })
      const button = buildTeaserButton({ dataset: { text: 'I need help' } })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      expect(controller.conversationIdValue).toBe('new-conversation')
      expect(mockWebChatChannel.updateSubscriptionWith).toHaveBeenCalledWith('new-conversation')
    })

    it('broadcasts and marks the optimistic bubble failed when sending fails', async () => {
      mockMessagesAPI.create.mockResolvedValue({ failed: true })
      const button = buildTeaserButton({ dataset: { text: 'I need help' } })

      await controller.sendTeaserQuickReply(buildTeaserQuickReplyEvent(button))

      const addedElement = mockMessagesContainer.children[0]
      expect(mockBroadcastChannel.postMessage).toHaveBeenLastCalledWith({
        type: 'message:failed',
        id: addedElement.id,
        reason: 'Message failed',
      })
      expect(addedElement.classList.contains('failed')).toBe(true)
      expect(mockHellotext.eventEmitter.dispatch).not.toHaveBeenCalledWith(
        'webchat:message:sent',
        expect.anything(),
      )
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
    let mockSessionStorage

    beforeEach(() => {
      useOpeningSequence(controller)
      controller.setupOpeningSequence()
      useTeaser(controller)
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
      controller.teaserTarget = document.createElement('section')

      // Mock messagesAPI
      mockMessagesAPI = {
        create: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      // Mock Hellotext
      mockHellotext = {
        session: 'test-session-123',
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }

      // Mock Locale
      mockLocale = {
        toString: jest.fn().mockReturnValue('en'),
      }

      // Mock broadcast channel
      mockBroadcastChannel = {
        postMessage: jest.fn(),
      }
      controller.broadcastChannel = mockBroadcastChannel

      mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })

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
            id: 'server-message-123',
          }),
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)
      })

      it('creates FormData with all required parameters', async () => {
        const eventDetail = {
          id: 'original-msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Quick reply message',
          cardElement: mockCardElement,
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
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'hellotext:webchat:test-webchat-id:teaser-seen',
          'true',
        )
        expect(controller.teaserTarget.classList.contains('invisible')).toBe(true)
      })

      it('builds and appends message element to container', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Test message',
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
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

      it('clones attachment images into the plural attachments container', async () => {
        const attachmentContainer = mockMessageTemplate.querySelector('[data-attachment-container]')
        attachmentContainer.removeAttribute('data-attachment-container')
        attachmentContainer.setAttribute('data-attachments-container', '')

        await controller.sendQuickReplyMessage({
          detail: {
            id: 'msg-123',
            product: 'product-456',
            buttonId: 'btn-789',
            body: 'Message with image',
            cardElement: mockCardElement,
          },
        })

        const addedElement = mockMessagesContainer.children[0]
        const pluralAttachmentContainer = addedElement.querySelector('[data-attachments-container]')

        expect(pluralAttachmentContainer.children).toHaveLength(1)
        expect(pluralAttachmentContainer.children[0].src).toBe('https://example.com/product.jpg')
      })

      it('scrolls message into view smoothly', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Scroll test',
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
          type: 'message:sent',
          element: expect.any(String),
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
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(controller.dispatch).toHaveBeenCalledWith('set:id', {
          target: expect.any(Element),
          detail: 'server-message-123',
        })
      })

      it('dispatches webchat:message:sent event with message data', async () => {
        const eventDetail = {
          id: 'original-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Event dispatch test',
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:message:sent', {
          id: 'server-message-123',
          body: 'Event dispatch test',
          attachments: ['https://example.com/product.jpg'],
          replied_to: 'original-123',
          product: 'product-456',
          button: 'btn-789',
          type: 'quick_reply',
        })
      })
    })

    describe('failed message sending', () => {
      beforeEach(() => {
        const mockFailedResponse = {
          failed: true,
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
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
          type: 'message:failed',
          id: expect.any(String),
          reason: 'Message failed',
        })
      })

      it('adds failed class to message element', async () => {
        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Failed message',
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(mockHellotext.eventEmitter.dispatch).not.toHaveBeenCalledWith(
          'webchat:message:sent',
          expect.anything(),
        )
      })
    })

    describe('edge cases', () => {
      beforeEach(() => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123',
          }),
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
          cardElement: mockCardElementNoImage,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        const attachmentContainer = addedElement.querySelector('[data-attachment-container]')
        expect(attachmentContainer.children).toHaveLength(0)
      })

      it('sends plain quick replies without product data', async () => {
        const plainMessageElement = document.createElement('article')

        await controller.sendQuickReplyMessage({
          detail: {
            id: 'msg-123',
            buttonId: 'btn-789',
            body: 'Plain quick reply',
            cardElement: plainMessageElement,
          },
        })

        const formData = mockMessagesAPI.create.mock.calls[0][0]
        expect(formData.get('message[body]')).toBe('Plain quick reply')
        expect(formData.get('message[replied_to]')).toBe('msg-123')
        expect(formData.get('message[product]')).toBeNull()
        expect(formData.get('message[button]')).toBe('btn-789')

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerText).toBe('Plain quick reply')
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
          cardElement: mockCardElement,
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
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const addedElement = mockMessagesContainer.children[0]
        expect(addedElement.querySelector('[data-body]').innerText).toBe('')
      })

      it('handles missing event detail properties', async () => {
        const eventDetail = {
          body: 'Minimal message',
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        const formData = mockMessagesAPI.create.mock.calls[0][0]
        expect(formData.get('message[replied_to]')).toBeNull()
        expect(formData.get('message[product]')).toBeNull()
        expect(formData.get('message[button]')).toBeNull()
      })

      it('handles API response without id', async () => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({}),
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'No ID response',
          cardElement: mockCardElement,
        }

        await controller.sendQuickReplyMessage({ detail: eventDetail })

        expect(controller.dispatch).toHaveBeenCalledWith('set:id', {
          target: expect.any(Element),
          detail: undefined,
        })
      })

      it('handles network errors gracefully', async () => {
        mockMessagesAPI.create.mockRejectedValue(new Error('Network error'))

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Network error test',
          cardElement: mockCardElement,
        }

        await expect(controller.sendQuickReplyMessage({ detail: eventDetail })).rejects.toThrow(
          'Network error',
        )
      })

      it('inserts message before typing indicator when visible', async () => {
        const mockResponse = {
          failed: false,
          json: jest.fn().mockResolvedValue({
            id: 'server-message-123',
          }),
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        // Set up typing indicator
        const mockTypingIndicator = document.createElement('div')
        mockTypingIndicator.setAttribute('data-hellotext--webchat-target', 'typingIndicator')
        mockMessagesContainer.appendChild(mockTypingIndicator)

        controller.typingIndicatorTarget = mockTypingIndicator
        controller.typingIndicatorVisible = true
        Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
          get: () => true,
        })

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Insert before typing',
          cardElement: mockCardElement,
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
            id: 'server-message-123',
          }),
        }
        mockMessagesAPI.create.mockResolvedValue(mockResponse)

        controller.typingIndicatorVisible = false
        Object.defineProperty(controller, 'hasTypingIndicatorTarget', {
          get: () => false,
        })

        const eventDetail = {
          id: 'msg-123',
          product: 'product-456',
          buttonId: 'btn-789',
          body: 'Normal append',
          cardElement: mockCardElement,
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
        parseFromString: jest.fn(html => ({
          body: {
            firstElementChild: document.createElement('div'),
          },
        })),
      }))

      // Mock Hellotext
      mockHellotext = {
        eventEmitter: {
          dispatch: jest.fn(),
        },
      }

      const Hellotext = require('../../src/hellotext').default
      Object.assign(Hellotext, mockHellotext)
    })

    const setupInboundMessageTeaserTargets = () => {
      const teaser = document.createElement('section')
      const configuredTeaser = document.createElement('section')
      configuredTeaser.className = 'hellotext--webchat-teaser-stack'
      configuredTeaser.setAttribute('data-hellotext--webchat-target', 'teaserMessage')
      configuredTeaser.setAttribute('data-teaser-message', 'true')

      const inboundMessageTeaser = document.createElement('section')
      inboundMessageTeaser.className = 'hellotext--webchat-teaser-stack hidden'
      inboundMessageTeaser.setAttribute('data-hellotext--webchat-target', 'inboundMessageTeaser')

      const inboundMessageTeaserBody = document.createElement('article')
      inboundMessageTeaserBody.className = 'hellotext--webchat-teaser-message'
      inboundMessageTeaserBody.setAttribute('data-hellotext--webchat-target', 'inboundMessageTeaserBody')
      inboundMessageTeaser.appendChild(inboundMessageTeaserBody)
      teaser.append(configuredTeaser, inboundMessageTeaser)

      controller.teaserTarget = teaser
      Object.defineProperty(controller, 'hasTeaserTarget', {
        get: () => true,
        configurable: true,
      })
      Object.defineProperty(controller, 'teaserMessageTargets', {
        get: () => [configuredTeaser],
        configurable: true,
      })
      Object.defineProperty(controller, 'inboundMessageTeaserTarget', {
        get: () => inboundMessageTeaser,
        configurable: true,
      })
      Object.defineProperty(controller, 'hasInboundMessageTeaserTarget', {
        get: () => true,
        configurable: true,
      })
      Object.defineProperty(controller, 'inboundMessageTeaserBodyTarget', {
        get: () => inboundMessageTeaserBody,
        configurable: true,
      })
      Object.defineProperty(controller, 'hasInboundMessageTeaserBodyTarget', {
        get: () => true,
        configurable: true,
      })

      return {
        teaser,
        configuredTeaser,
        inboundMessageTeaser,
        inboundMessageTeaserBody,
      }
    }

    it('handles carousel messages correctly', () => {
      controller.openValue = true // Set to open to avoid unread counter issues
      const mockMessagesAPI = {
        markAsSeen: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      const message = {
        id: 'carousel-123',
        html: '<div class="carousel">Test Carousel</div>',
        carousel: { title: 'Test' },
      }

      controller.onMessageReceived(message)

      expect(mockMessagesContainer.children).toHaveLength(1)
      expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledWith('webchat:message:received', {
        ...message,
        body: '',
      })
    })

    it('silently drops a duplicate carousel message that was already claimed in memory', () => {
      controller.openValue = true
      const mockMessagesAPI = {
        markAsSeen: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      const message = {
        id: 'carousel-duplicate',
        html: '<div>Carousel</div>',
        carousel: {},
      }

      controller.onMessageReceived(message)
      controller.onMessageReceived(message)

      expect(mockMessagesContainer.children).toHaveLength(1)
      expect(mockHellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(1)
      expect(mockMessagesAPI.markAsSeen).toHaveBeenCalledTimes(1)
    })

    it('marks carousel as seen when chat is open', () => {
      controller.openValue = true
      const mockMessagesAPI = {
        markAsSeen: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      const message = {
        id: 'carousel-read',
        html: '<div>Carousel</div>',
        carousel: {},
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
        carousel: {},
      }

      controller.onMessageReceived(message)

      expect(mockUnreadCounter.style.display).toBe('flex')
      expect(mockUnreadCounter.innerText).toBe(3)
    })

    it('clamps the unread counter at 9 for carousel messages', () => {
      controller.openValue = false
      const mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.innerText = '9'
      controller.unreadCounterTarget = mockUnreadCounter

      controller.onMessageReceived({
        id: 'carousel-unread-cap',
        html: '<div>Carousel</div>',
        carousel: {},
      })

      expect(mockUnreadCounter.style.display).toBe('flex')
      expect(mockUnreadCounter.innerText).toBe(9)
    })

    it('shows the message teaser for carousel messages when chat is closed', () => {
      controller.openValue = false
      const mockUnreadCounter = document.createElement('div')
      mockUnreadCounter.innerText = '0'
      controller.unreadCounterTarget = mockUnreadCounter

      const { teaser, configuredTeaser, inboundMessageTeaser, inboundMessageTeaserBody } =
        setupInboundMessageTeaserTargets()
      teaser.classList.add('invisible')

      const message = {
        id: 'carousel-teaser-closed',
        html: '<div>Carousel</div>',
        carousel: {},
        teaser: '<span>Carousel teaser</span>',
      }

      controller.onMessageReceived(message)

      expect(mockUnreadCounter.style.display).toBe('flex')
      expect(configuredTeaser.classList.contains('hidden')).toBe(true)
      expect(inboundMessageTeaser.classList.contains('hidden')).toBe(false)
      expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Carousel teaser</span>')
      expect(teaser.classList.contains('invisible')).toBe(false)
    })

    it('hides the message teaser for carousel messages when chat is open', () => {
      controller.openValue = true
      const mockMessagesAPI = {
        markAsSeen: jest.fn(),
      }
      controller.messagesAPI = mockMessagesAPI

      const { teaser, inboundMessageTeaser, inboundMessageTeaserBody } = setupInboundMessageTeaserTargets()

      const message = {
        id: 'carousel-teaser-open',
        html: '<div>Carousel</div>',
        carousel: {},
        teaser: '<span>Carousel teaser</span>',
      }

      controller.onMessageReceived(message)

      expect(inboundMessageTeaser.classList.contains('hidden')).toBe(false)
      expect(inboundMessageTeaserBody.innerHTML).toBe('<span>Carousel teaser</span>')
      expect(teaser.classList.contains('invisible')).toBe(true)
      expect(mockMessagesAPI.markAsSeen).toHaveBeenCalledWith('carousel-teaser-open')
    })
  })
})
