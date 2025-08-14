import ApplicationChannel from '../../src/channels/application_channel'

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

  beforeEach(() => {
    ApplicationChannel.webSocket = null

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

    global.WebSocket = jest.fn(() => mockWebSocket)
    applicationChannel = new ApplicationChannel()
  })

  afterEach(() => {
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

      global.WebSocket = jest.fn(() => connectingWebSocket)

      const channel = new ApplicationChannel()

      const payload = {
        command: 'subscribe',
        identifier: { channel: 'TestChannel' },
        data: { test: 'data' }
      }

      channel.send(payload)

      expect(connectingWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))

      const openCallback = connectingWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'open'
      )[1]

      openCallback()

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

      global.WebSocket = jest.fn(() => closedWebSocket)

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

      global.WebSocket = jest.fn(() => closingWebSocket)

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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

      const mockEvent = {
        data: 'invalid json {'
      }

      expect(() => messageCallback(mockEvent)).toThrow()
    })

    it('handles missing message property', () => {
      applicationChannel.onMessage(mockCallback)

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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

      global.WebSocket = jest.fn(() => connectingWebSocket)

      const channel2 = new ApplicationChannel()
      channel2.send(payload)
      expect(connectingWebSocket.send).not.toHaveBeenCalled()
      expect(connectingWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
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

      const messageCallback = mockAddEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]

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
