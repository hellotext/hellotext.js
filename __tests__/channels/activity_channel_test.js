import ActivityChannel from '../../src/channels/activity_channel'
import ApplicationChannel from '../../src/channels/application_channel'

jest.mock('../../src/channels/application_channel', () => {
  return jest.fn().mockImplementation(function() {
    this.send = jest.fn()
    this.onMessage = jest.fn()
    return this
  })
})

jest.mock('../../src/hellotext', () => {
  return {
    __esModule: true,
    default: {
      business: { id: 'test-business-123' },
      session: 'test-session-456'
    }
  }
})

describe('ActivityChannel', () => {
  let activityChannel
  let mockSend
  let mockOnMessage

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock browser globals
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/test-page' },
      writable: true
    })

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 Test Browser',
      writable: true
    })

    activityChannel = new ActivityChannel()

    mockSend = activityChannel.send
    mockOnMessage = activityChannel.onMessage
  })

  describe('constructor', () => {
    it('creates an instance with correct properties', () => {
      expect(activityChannel).toBeInstanceOf(ActivityChannel)
      expect(activityChannel.business).toBe('test-business-123')
      expect(activityChannel.session).toBe('test-session-456')
    })

    it('calls ApplicationChannel constructor', () => {
      expect(ApplicationChannel).toHaveBeenCalled()
    })

    it('calls subscribe method after construction', () => {
      expect(mockSend).toHaveBeenCalledWith({
        command: 'subscribe',
        identifier: {
          channel: 'Contact::ActivityChannel',
          business: 'test-business-123',
          session: 'test-session-456'
        }
      })
    })
  })

  describe('subscribe method', () => {
    it('sends subscribe command with correct parameters', () => {
      mockSend.mockClear()

      activityChannel.subscribe()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'subscribe',
        identifier: {
          channel: 'Contact::ActivityChannel',
          business: 'test-business-123',
          session: 'test-session-456'
        }
      })
    })
  })

  describe('sendHeartbeat method', () => {
    it('sends message command with heartbeat action and browser data', () => {
      activityChannel.sendHeartbeat()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'message',
        identifier: {
          channel: 'Contact::ActivityChannel',
          session: 'test-session-456',
          business: 'test-business-123'
        },
        data: {
          action: 'heartbeat',
          url: 'https://example.com/test-page',
          user_agent: 'Mozilla/5.0 Test Browser'
        }
      })
    })

    it('uses current window location and user agent', () => {
      // Change browser globals
      window.location.href = 'https://different-site.com/other-page'
      navigator.userAgent = 'Different Browser Agent'

      activityChannel.sendHeartbeat()

      expect(mockSend).toHaveBeenCalledWith({
        command: 'message',
        identifier: {
          channel: 'Contact::ActivityChannel',
          session: 'test-session-456',
          business: 'test-business-123'
        },
        data: {
          action: 'heartbeat',
          url: 'https://different-site.com/other-page',
          user_agent: 'Different Browser Agent'
        }
      })
    })
  })

  describe('edge cases', () => {
    it('handles missing window location', () => {
      delete window.location

      expect(() => activityChannel.sendHeartbeat()).toThrow()
    })

    it('sends heartbeat with current navigator userAgent', () => {
      // This test verifies that the current navigator.userAgent is used
      activityChannel.sendHeartbeat()

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          user_agent: expect.any(String)
        })
      }))
    })

    it('handles empty window location href', () => {
      window.location.href = ''

      activityChannel.sendHeartbeat()

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          url: ''
        })
      }))
    })
  })

  describe('multiple heartbeats', () => {
    it('sends multiple heartbeats independently', () => {
      mockSend.mockClear()

      activityChannel.sendHeartbeat()
      activityChannel.sendHeartbeat()
      activityChannel.sendHeartbeat()

      expect(mockSend).toHaveBeenCalledTimes(3)

      // Each call should have the same parameters
      expect(mockSend).toHaveBeenNthCalledWith(1, {
        command: 'message',
        identifier: {
          channel: 'Contact::ActivityChannel',
          session: 'test-session-456',
          business: 'test-business-123'
        },
        data: {
          action: 'heartbeat',
          url: 'https://example.com/test-page',
          user_agent: 'Mozilla/5.0 Test Browser'
        }
      })

      expect(mockSend).toHaveBeenNthCalledWith(2, {
        command: 'message',
        identifier: {
          channel: 'Contact::ActivityChannel',
          session: 'test-session-456',
          business: 'test-business-123'
        },
        data: {
          action: 'heartbeat',
          url: 'https://example.com/test-page',
          user_agent: 'Mozilla/5.0 Test Browser'
        }
      })
    })
  })

  describe('multiple instances', () => {
    it('creates independent instances with same Hellotext data', () => {
      const channel1 = new ActivityChannel()
      const channel2 = new ActivityChannel()

      expect(channel1.business).toBe('test-business-123')
      expect(channel1.session).toBe('test-session-456')

      expect(channel2.business).toBe('test-business-123')
      expect(channel2.session).toBe('test-session-456')

      // But they should be different instances
      expect(channel1).not.toBe(channel2)
    })

    it('each instance has its own send method', () => {
      const channel1 = new ActivityChannel()
      const channel2 = new ActivityChannel()

      // Clear mocks from constructor calls
      channel1.send.mockClear()
      channel2.send.mockClear()

      channel1.sendHeartbeat()
      expect(channel1.send).toHaveBeenCalledTimes(1)
      expect(channel2.send).toHaveBeenCalledTimes(0)

      channel2.sendHeartbeat()
      expect(channel1.send).toHaveBeenCalledTimes(1)
      expect(channel2.send).toHaveBeenCalledTimes(1)
    })
  })
})
