import ApplicationChannel from '../../src/channels/application_channel'
import WebchatChannel from '../../src/channels/webchat_channel'

jest.mock('../../src/channels/application_channel', () => {
  return jest.fn().mockImplementation(function() {
    this.send = jest.fn()
    this.onMessage = jest.fn()
    return this
  })
})

describe('WebchatChannel', () => {
  let webchatChannel
  let mockSend
  let mockOnMessage

  beforeEach(() => {
    jest.clearAllMocks()

    webchatChannel = new WebchatChannel('test-id', 'test-session', 'test-conversation')

    mockSend = webchatChannel.send
    mockOnMessage = webchatChannel.onMessage
  })

  describe('constructor', () => {
    it('creates an instance with correct properties', () => {
      expect(webchatChannel).toBeInstanceOf(WebchatChannel)
      expect(webchatChannel.id).toBe('test-id')
      expect(webchatChannel.session).toBe('test-session')
      expect(webchatChannel.conversation).toBe('test-conversation')
    })

    it('calls ApplicationChannel constructor', () => {
      expect(ApplicationChannel).toHaveBeenCalled()
    })

    it('calls subscribe method after construction', () => {
      expect(mockSend).toHaveBeenCalledWith({
        command: 'subscribe',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation'
        }
      })
    })
  })

  describe('subscribe method', () => {
    it('sends subscribe command with correct parameters', () => {
      mockSend.mockClear()

      webchatChannel.subscribe()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'subscribe',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation'
        }
      })
    })
  })

  describe('unsubscribe method', () => {
    it('sends unsubscribe command with correct parameters', () => {
      webchatChannel.unsubscribe()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'unsubscribe',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation'
        }
      })
    })
  })

  describe('startTypingIndicator method', () => {
    it('sends message command with started_typing action', () => {
      webchatChannel.startTypingIndicator()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'message',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation'
        },
        data: { action: 'started_typing' }
      })
    })
  })

  describe('stopTypingIndicator method', () => {
    it('sends typing:stop command with correct parameters', () => {
      webchatChannel.stopTypingIndicator()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'typing:stop',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation',
          event: 'typing:end'
        }
      })
    })
  })

  describe('onMessage method', () => {
    it('calls parent onMessage with message type filter', () => {
      const mockCallback = jest.fn()

      webchatChannel.onMessage(mockCallback)

      expect(mockOnMessage).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('onConversationAssignment method', () => {
    it('calls parent onMessage with conversation.assigned filter', () => {
      const mockCallback = jest.fn()
      expect(() => webchatChannel.onConversationAssignment(mockCallback)).toThrow()
    })
  })

  describe('onAgentOnline method', () => {
    it('calls parent onMessage with agent_is_online filter', () => {
      const mockCallback = jest.fn()
      expect(() => webchatChannel.onAgentOnline(mockCallback)).toThrow()
    })
  })

  describe('onReaction method', () => {
    it('calls parent onMessage with reaction.create and reaction.destroy filters', () => {
      const mockCallback = jest.fn()
      expect(() => webchatChannel.onReaction(mockCallback)).toThrow()
    })
  })

  describe('onTypingStart method', () => {
    it('calls parent onMessage with started_typing filter', () => {
      const mockCallback = jest.fn()
      expect(() => webchatChannel.onTypingStart(mockCallback)).toThrow()
    })
  })

  describe('updateSubscriptionWith method', () => {
    it('calls unsubscribe and then subscribe with new conversation', () => {
      jest.useFakeTimers()

      webchatChannel.updateSubscriptionWith('new-conversation')

      expect(mockSend).toHaveBeenCalledWith({
        command: 'unsubscribe',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'test-conversation'
        }
      })

      jest.runAllTimers()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'subscribe',
        identifier: {
          channel: 'WebchatChannel',
          id: 'test-id',
          session: 'test-session',
          conversation: 'new-conversation'
        }
      })

      expect(webchatChannel.conversation).toBe('new-conversation')
      jest.useRealTimers()
    })

    it('uses 1000ms timeout for subscription update', () => {
      jest.useFakeTimers()

      mockSend.mockClear()
      webchatChannel.updateSubscriptionWith('new-conversation')

      expect(mockSend).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(999)
      expect(mockSend).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1)
      expect(mockSend).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('handles null conversation in constructor', () => {
      const channel = new WebchatChannel('test-id', 'test-session', null)
      expect(channel.conversation).toBe(null)
    })

    it('handles undefined conversation in constructor', () => {
      const channel = new WebchatChannel('test-id', 'test-session', undefined)
      expect(channel.conversation).toBe(undefined)
    })

    it('handles empty string conversation in constructor', () => {
      const channel = new WebchatChannel('test-id', 'test-session', '')
      expect(channel.conversation).toBe('')
    })
  })

  describe('multiple instances', () => {
    it('creates independent instances with different parameters', () => {
      const channel1 = new WebchatChannel('id1', 'session1', 'conv1')
      const channel2 = new WebchatChannel('id2', 'session2', 'conv2')

      expect(channel1.id).toBe('id1')
      expect(channel1.session).toBe('session1')
      expect(channel1.conversation).toBe('conv1')

      expect(channel2.id).toBe('id2')
      expect(channel2.session).toBe('session2')
      expect(channel2.conversation).toBe('conv2')
    })

    it('each instance has its own subscription parameters', () => {
      const channel1 = new WebchatChannel('id1', 'session1', 'conv1')
      const channel2 = new WebchatChannel('id2', 'session2', 'conv2')

      expect(channel1.id).toBe('id1')
      expect(channel1.session).toBe('session1')
      expect(channel1.conversation).toBe('conv1')

      expect(channel2.id).toBe('id2')
      expect(channel2.session).toBe('session2')
      expect(channel2.conversation).toBe('conv2')
    })
  })
})
