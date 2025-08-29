/**
 * @jest-environment jsdom
 */

// Mock ActivityChannel
const mockSendHeartbeat = jest.fn()
const mockUnsubscribe = jest.fn()
const mockConnected = jest.fn(() => true)

jest.mock('../../src/channels/activity_channel', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      sendHeartbeat: mockSendHeartbeat,
      unsubscribe: mockUnsubscribe,
      connected: mockConnected
    }))
  }
})

import { Activity } from '../../src/models/activity'

describe('Activity', () => {
  let activity
  let mockAddEventListener
  let mockRemoveEventListener

  beforeEach(() => {
    // Reset mocks
    mockSendHeartbeat.mockClear()
    mockUnsubscribe.mockClear()
    mockConnected.mockClear()
    mockConnected.mockReturnValue(true)

    // Mock document.addEventListener and removeEventListener
    mockAddEventListener = jest.fn()
    mockRemoveEventListener = jest.fn()

    Object.defineProperty(document, 'addEventListener', {
      value: mockAddEventListener,
      writable: true
    })

    Object.defineProperty(document, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true
    })

    // Mock window.location and navigator
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com' },
      writable: true
    })

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 Test Browser',
      writable: true
    })
  })

  describe('constructor and setup', () => {
    it('creates activity channel and sets up event listeners', () => {
      activity = new Activity()

      // Should register throttled events
      expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function))

      // Should register immediate events
      expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('submit', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('input', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

      // Total calls: 3 throttled + 5 immediate = 8
      expect(mockAddEventListener).toHaveBeenCalledTimes(8)
    })
  })

  describe('recordActivity', () => {
    beforeEach(() => {
      activity = new Activity()
    })

    it('sends heartbeat when channel is connected', () => {
      activity.recordActivity('click')

      expect(mockSendHeartbeat).toHaveBeenCalledTimes(1)
    })

    it('does not send heartbeat when channel is not connected', () => {
      mockConnected.mockReturnValue(false)

      activity.recordActivity('click')

      expect(mockSendHeartbeat).not.toHaveBeenCalled()
    })

    it('does not send heartbeat when channel is null', () => {
      activity.channel = null

      activity.recordActivity('click')

      expect(mockSendHeartbeat).not.toHaveBeenCalled()
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      activity = new Activity()
    })

    it('executes function immediately on first call', () => {
      const mockFunc = jest.fn()
      const throttledFunc = activity.throttle(mockFunc, 1000)

      throttledFunc('test')

      expect(mockFunc).toHaveBeenCalledWith('test')
      expect(mockFunc).toHaveBeenCalledTimes(1)
    })

    it('throttles rapid successive calls', (done) => {
      const mockFunc = jest.fn()
      const throttledFunc = activity.throttle(mockFunc, 100)

      // First call - immediate
      throttledFunc('call1')
      expect(mockFunc).toHaveBeenCalledTimes(1)

      // Second call - should be throttled
      throttledFunc('call2')
      expect(mockFunc).toHaveBeenCalledTimes(1)

      // Wait for throttle delay and check final call
      setTimeout(() => {
        expect(mockFunc).toHaveBeenCalledTimes(2)
        expect(mockFunc).toHaveBeenLastCalledWith('call2')
        done()
      }, 150)
    })
  })

  describe('event properties', () => {
    beforeEach(() => {
      activity = new Activity()
    })

    it('returns correct immediate events', () => {
      expect(activity.immediateEvents).toEqual([
        'click', 'keydown', 'submit', 'input', 'change'
      ])
    })

    it('returns correct throttled events', () => {
      expect(activity.throttledEvents).toEqual([
        'scroll', 'mousemove', 'touchmove'
      ])
    })
  })

  describe('destroy', () => {
    beforeEach(() => {
      activity = new Activity()
    })

    it('removes all event listeners', () => {
      activity.destroy()

      // Should remove throttled events
      expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function))

      // Should remove immediate events
      expect(mockRemoveEventListener).toHaveBeenCalledWith('click', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('submit', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('input', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))

      // Total: 3 throttled + 5 immediate = 8
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(8)
    })

    it('unsubscribes from channel', () => {
      activity.destroy()

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('handles null channel gracefully', () => {
      activity.channel = null

      expect(() => activity.destroy()).not.toThrow()
    })
  })

  describe('event simulation', () => {
    beforeEach(() => {
      activity = new Activity()
    })

    it('records activity when immediate event is triggered', () => {
      // Get the click event listener
      const clickListener = mockAddEventListener.mock.calls
        .find(call => call[0] === 'click')[1]

      // Trigger the click event
      clickListener()

      expect(mockSendHeartbeat).toHaveBeenCalledTimes(1)
    })

    it('records activity when throttled event is triggered', () => {
      // Get the scroll event listener
      const scrollListener = mockAddEventListener.mock.calls
        .find(call => call[0] === 'scroll')[1]

      // Trigger the scroll event
      scrollListener()

      expect(mockSendHeartbeat).toHaveBeenCalledTimes(1)
    })
  })
})
