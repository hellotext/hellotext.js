import ApplicationChannel from '../../src/channels/application_channel'

const WEB_SOCKET_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

const mockGlobalWebSocket = implementation => {
  global.WebSocket = jest.fn(implementation)
  Object.assign(global.WebSocket, WEB_SOCKET_STATES)

  return global.WebSocket
}

jest.mock('../../src/core', () => ({
  Configuration: {
    actionCableUrl: 'wss://test.hellotext.com/cable'
  }
}))

describe('ApplicationChannel', () => {
  let applicationChannel
  let mockWebSocket
  let mockSend
  let mockAddEventListener
  let mockRemoveEventListener

  const eventCallbacksFor = (socket, eventName) => (
    socket.addEventListener.mock.calls
      .filter(call => call[0] === eventName)
      .map(call => call[1])
  )
  const lastEventCallbackFor = (socket, eventName) => eventCallbacksFor(socket, eventName).at(-1)

  beforeEach(() => {
    mockGlobalWebSocket(() => mockWebSocket)

    ApplicationChannel.webSocket = null
    ApplicationChannel.channels = new Set()
    ApplicationChannel.messageHandlers = new Set()
    ApplicationChannel.disconnectHandlers = new Set()
    ApplicationChannel.subscriptionConfirmHandlers = new Set()
    ApplicationChannel.reconnectTimeout = null
    ApplicationChannel.reconnectAttempts = 0
    ApplicationChannel.reconnectJitter = 0
    ApplicationChannel.needsResubscribe = false

    mockSend = jest.fn()
    mockAddEventListener = jest.fn()
    mockRemoveEventListener = jest.fn()

    mockWebSocket = {
      readyState: WebSocket.OPEN,
      send: mockSend,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      close: jest.fn()
    }

    applicationChannel = new ApplicationChannel()
  })

  afterEach(() => {
    ApplicationChannel.clearReconnectTimeout()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('webSocket getter', () => {
    it('creates a new WebSocket with correct URL when none exists', () => {
      ApplicationChannel.webSocket = null

      const channel = new ApplicationChannel()
      const ws = channel.webSocket

      expect(WebSocket).toHaveBeenCalledWith('wss://test.hellotext.com/cable')
      expect(ws).toBe(mockWebSocket)
    })

    it('returns existing WebSocket when one already exists', () => {
      const existingWebSocket = { readyState: WebSocket.OPEN }
      ApplicationChannel.webSocket = existingWebSocket

      const channel = new ApplicationChannel()
      const ws = channel.webSocket

      expect(WebSocket).not.toHaveBeenCalled()
      expect(ws).toBe(existingWebSocket)
    })

    it('creates WebSocket only once and reuses it', () => {
      const channel1 = new ApplicationChannel()
      const channel2 = new ApplicationChannel()

      const ws1 = channel1.webSocket
      const ws2 = channel2.webSocket

      expect(WebSocket).toHaveBeenCalledTimes(1)
      expect(ws1).toBe(ws2)
    })
  })

  describe('send method', () => {
    it('sends message immediately when WebSocket is OPEN', () => {
      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' },
        data: { test: 'data' }
      }

      applicationChannel.send(payload)

      expect(mockSend).toHaveBeenCalledWith(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'TestChannel' }),
        data: JSON.stringify({ test: 'data' })
      }))
    })

    it('sends message immediately when WebSocket is OPEN with empty data', () => {
      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' }
      }

      applicationChannel.send(payload)

      expect(mockSend).toHaveBeenCalledWith(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'TestChannel' }),
        data: JSON.stringify({})
      }))
    })

    it('waits for WebSocket to open when not ready', () => {
      ApplicationChannel.webSocket = null

      const connectingWebSocket = {
        readyState: 0, // WebSocket.CONNECTING
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket(() => connectingWebSocket)

      const channel = new ApplicationChannel()

      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' },
        data: { test: 'data' }
      }

      channel.send(payload)

      expect(connectingWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))

      eventCallbacksFor(connectingWebSocket, 'open').forEach(callback => callback())

      expect(connectingWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'TestChannel' }),
        data: JSON.stringify({ test: 'data' })
      }))
    })

    it('handles WebSocket in CLOSED state', () => {
      ApplicationChannel.webSocket = null

      const closedWebSocket = {
        readyState: 3, // WebSocket.CLOSED
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket(() => closedWebSocket)

      const channel = new ApplicationChannel()

      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' }
      }

      channel.send(payload)

      expect(closedWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
    })

    it('handles WebSocket in CLOSING state', () => {
      ApplicationChannel.webSocket = null

      const closingWebSocket = {
        readyState: 2, // WebSocket.CLOSING
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket(() => closingWebSocket)

      const channel = new ApplicationChannel()

      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' }
      }

      channel.send(payload)

      expect(closingWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
    })

    it('handles complex nested data structures', () => {
      const complexData = {
        user: {
          id: 123,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        metadata: {
          timestamp: '2023-01-01T00:00:00Z',
          tags: ['important', 'urgent']
        }
      }

      const payload = {
        command: 'message',
        identifier: { channel: 'TestChannel', id: 'test-123' },
        data: complexData
      }

      applicationChannel.send(payload)

      expect(mockSend).toHaveBeenCalledWith(JSON.stringify({
        command: 'message',
        identifier: JSON.stringify({ channel: 'TestChannel', id: 'test-123' }),
        data: JSON.stringify(complexData)
      }))
    })
  })

  describe('onMessage method', () => {
    let mockCallback

    beforeEach(() => {
      mockCallback = jest.fn()
    })

    it('adds message event listener', () => {
      applicationChannel.onMessage(mockCallback)

      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('calls callback with parsed message data', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const mockEvent = {
        data: JSON.stringify({
          type: 'message',
          message: { id: '123', content: 'Hello world' }
        })
      }

      messageCallback(mockEvent)

      expect(mockCallback).toHaveBeenCalledWith({ id: '123', content: 'Hello world' })
    })

    it('filters out ignored events', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const ignoredEvents = ['ping', 'confirm_subscription', 'welcome']

      ignoredEvents.forEach(eventType => {
        const mockEvent = {
          data: JSON.stringify({
            type: eventType,
            message: { some: 'data' }
          })
        }

        messageCallback(mockEvent)
      })

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('handles non-ignored events correctly', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const validEvents = ['message', 'conversation.assigned', 'agent_is_online']

      validEvents.forEach((eventType, index) => {
        const mockEvent = {
          data: JSON.stringify({
            type: eventType,
            message: { id: index, content: `Event ${index}` }
          })
        }

        messageCallback(mockEvent)
      })

      expect(mockCallback).toHaveBeenCalledTimes(3)
      expect(mockCallback).toHaveBeenNthCalledWith(1, { id: 0, content: 'Event 0' })
      expect(mockCallback).toHaveBeenNthCalledWith(2, { id: 1, content: 'Event 1' })
      expect(mockCallback).toHaveBeenNthCalledWith(3, { id: 2, content: 'Event 2' })
    })

    it('handles malformed JSON gracefully', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const mockEvent = {
        data: 'invalid json {'
      }

      expect(() => messageCallback(mockEvent)).toThrow()
    })

    it('handles missing message property', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const mockEvent = {
        data: JSON.stringify({
          type: 'message'
          // missing message property
        })
      }

      messageCallback(mockEvent)

      expect(mockCallback).toHaveBeenCalledWith(undefined)
    })

    it('handles null message data', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const mockEvent = {
        data: JSON.stringify({
          type: 'message',
          message: null
        })
      }

      messageCallback(mockEvent)

      expect(mockCallback).toHaveBeenCalledWith(null)
    })
  })

  describe('ignoredEvents getter', () => {
    it('returns the correct list of ignored events', () => {
      const ignoredEvents = applicationChannel.ignoredEvents

      expect(ignoredEvents).toEqual(['ping', 'confirm_subscription', 'welcome'])
    })

    it('returns a new array each time', () => {
      const events1 = applicationChannel.ignoredEvents
      const events2 = applicationChannel.ignoredEvents

      expect(events1).not.toBe(events2)
      expect(events1).toEqual(events2)
    })
  })

  describe('WebSocket state handling', () => {
    it('replaces a closed shared WebSocket before sending', () => {
      const closedWebSocket = {
        readyState: WebSocket.CLOSED,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }
      const replacementWebSocket = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      ApplicationChannel.webSocket = closedWebSocket
      mockGlobalWebSocket(() => replacementWebSocket)

      const channel = new ApplicationChannel()
      const payload = { command: 'test', identifier: {} }

      channel.send(payload)

      expect(WebSocket).toHaveBeenCalledWith('wss://test.hellotext.com/cable')
      expect(replacementWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        command: 'test',
        identifier: JSON.stringify({}),
        data: JSON.stringify({})
      }))
    })

    it('handles WebSocket readyState changes', () => {
      const payload = { command: 'test', identifier: {} }

      mockWebSocket.readyState = WebSocket.OPEN
      applicationChannel.send(payload)
      expect(mockSend).toHaveBeenCalledTimes(1)

      mockSend.mockClear()
      ApplicationChannel.webSocket = null

      const connectingWebSocket = {
        readyState: 0, // WebSocket.CONNECTING
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket(() => connectingWebSocket)

      const channel2 = new ApplicationChannel()
      channel2.send(payload)
      expect(connectingWebSocket.send).not.toHaveBeenCalled()
      expect(connectingWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
    })
  })

  describe('reconnect handling', () => {
    it('debounces reconnect attempts after a socket disconnects', () => {
      jest.useFakeTimers()

      const firstWebSocket = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }
      const secondWebSocket = {
        readyState: WebSocket.CONNECTING,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket()
        .mockReturnValueOnce(firstWebSocket)
        .mockReturnValueOnce(secondWebSocket)

      const channel = new ApplicationChannel()
      expect(channel.webSocket).toBe(firstWebSocket)

      eventCallbacksFor(firstWebSocket, 'close').forEach(callback => callback())
      eventCallbacksFor(firstWebSocket, 'error').forEach(callback => callback())

      expect(WebSocket).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(ApplicationChannel.reconnectBaseDelay)

      expect(WebSocket).toHaveBeenCalledTimes(2)
      expect(ApplicationChannel.webSocket).toBe(secondWebSocket)
    })

    it('replays message handlers and active subscriptions on reconnect', () => {
      jest.useFakeTimers()

      const firstWebSocket = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }
      const secondWebSocket = {
        readyState: WebSocket.CONNECTING,
        send: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      }

      mockGlobalWebSocket()
        .mockReturnValueOnce(firstWebSocket)
        .mockReturnValueOnce(secondWebSocket)

      class TestChannel extends ApplicationChannel {
        constructor() {
          super()
          this.subscribe = jest.fn(() => {
            this.send({ command: 'subscribe', identifier: { channel: 'TestChannel' } })
          })
        }
      }

      const channel = new TestChannel()
      const callback = jest.fn()

      channel.onMessage(callback)
      eventCallbacksFor(firstWebSocket, 'close').forEach(closeCallback => closeCallback())
      jest.advanceTimersByTime(ApplicationChannel.reconnectBaseDelay)

      const secondMessageCallback = lastEventCallbackFor(secondWebSocket, 'message')
      secondMessageCallback({
        data: JSON.stringify({
          type: 'message',
          message: { id: 'reconnected-message' }
        })
      })

      secondWebSocket.readyState = WebSocket.OPEN
      eventCallbacksFor(secondWebSocket, 'open').forEach(openCallback => openCallback())

      expect(callback).toHaveBeenCalledWith({ id: 'reconnected-message' })
      expect(channel.subscribe).toHaveBeenCalledTimes(1)
      expect(secondWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({ channel: 'TestChannel' }),
        data: JSON.stringify({})
      }))
    })

    it('notifies disconnect handlers before scheduling reconnect', () => {
      jest.useFakeTimers()

      const disconnectCallback = jest.fn()
      applicationChannel.onDisconnect(disconnectCallback)

      expect(applicationChannel.webSocket).toBe(mockWebSocket)

      eventCallbacksFor(mockWebSocket, 'close').forEach(callback => callback())

      expect(disconnectCallback).toHaveBeenCalledTimes(1)
    })

    it('notifies subscription confirmation handlers for ActionCable confirmations', () => {
      const confirmationCallback = jest.fn()
      applicationChannel.onSubscriptionConfirmed(confirmationCallback)

      expect(applicationChannel.webSocket).toBe(mockWebSocket)

      eventCallbacksFor(mockWebSocket, 'message')[0]({
        data: JSON.stringify({
          type: 'confirm_subscription',
          identifier: JSON.stringify({ channel: 'TestChannel' })
        })
      })

      expect(confirmationCallback).toHaveBeenCalledWith(JSON.stringify({ channel: 'TestChannel' }))
    })

    it('ignores malformed control messages', () => {
      const confirmationCallback = jest.fn()
      applicationChannel.onSubscriptionConfirmed(confirmationCallback)

      expect(applicationChannel.webSocket).toBe(mockWebSocket)

      expect(() => eventCallbacksFor(mockWebSocket, 'message')[0]({
        data: '{"invalid": json}'
      })).not.toThrow()

      expect(confirmationCallback).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles WebSocket send errors gracefully', () => {
      mockSend.mockImplementation(() => {
        throw new Error('WebSocket send failed')
      })

      const payload = { command: 'test', identifier: {} }

      expect(() => applicationChannel.send(payload)).toThrow('WebSocket send failed')
    })

    it('handles JSON parsing errors in message handling', () => {
      const mockCallback = jest.fn()
      applicationChannel.onMessage(mockCallback)

      const messageCallback = lastEventCallbackFor(mockWebSocket, 'message')

      const mockEvent = {
        data: '{"invalid": json}'
      }

      expect(() => messageCallback(mockEvent)).toThrow()
    })
  })

  describe('multiple instances', () => {
    it('shares the same WebSocket across instances', () => {
      const channel1 = new ApplicationChannel()
      const channel2 = new ApplicationChannel()

      expect(channel1.webSocket).toBe(channel2.webSocket)
      expect(WebSocket).toHaveBeenCalledTimes(1)
    })

    it('handles concurrent sends from multiple instances', () => {
      const channel1 = new ApplicationChannel()
      const channel2 = new ApplicationChannel()

      const payload1 = { command: 'test1', identifier: {} }
      const payload2 = { command: 'test2', identifier: {} }

      channel1.send(payload1)
      channel2.send(payload2)

      expect(mockSend).toHaveBeenCalledTimes(2)
    })
  })
})
