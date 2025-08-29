import ActivityChannel from '../channels/activity_channel'

class Activity {
  constructor() {
    this.channel = new ActivityChannel()
    this.setup()
  }

  setup() {
    this.throttledEvents.forEach(event => {
      document.addEventListener(
        event,
        this.throttle(() => this.recordActivity(event), 5000),
      )
    })

    this.immediateEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.recordActivity(event)
      })
    })
  }

  /**
   * Throttle function to limit how often a function can be called
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle(func, delay) {
    let timeoutId
    let lastExecTime = 0

    return (...args) => {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  /**
   * Records user activity by sending it to the server via ActionCable
   * @param {string} eventType - Type of event that occurred
   */
  recordActivity(eventType) {
    if (!this.channel || !this.channel.connected()) {
      return
    }

    this.channel.sendHeartbeat()
  }

  /**
   * Cleanup method to remove event listeners and close connections
   */
  destroy() {
    this.throttledEvents.forEach(event => document.removeEventListener(event, this.throttle))
    this.immediateEvents.forEach(event => document.removeEventListener(event, this.recordActivity))

    if (this.channel) {
      this.channel.unsubscribe()
    }
  }

  get immediateEvents() {
    return ['click', 'keydown', 'submit', 'input', 'change']
  }

  get throttledEvents() {
    return ['scroll', 'mousemove', 'touchmove']
  }
}

export { Activity }
