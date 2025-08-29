import { Configuration } from '../core'

class ApplicationChannel {
  static webSocket

  send({ command, identifier, data }) {
    const payload = {
      command,
      identifier: JSON.stringify(identifier),
      data: JSON.stringify(data || {}),
    }

    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(payload))
    } else {
      this.webSocket.addEventListener('open', () => {
        this.webSocket.send(JSON.stringify(payload))
      })
    }
  }

  onMessage(callback) {
    this.webSocket.addEventListener('message', event => {
      const data = JSON.parse(event.data)
      const { type, message } = data

      if (this.ignoredEvents.includes(type)) {
        return
      }

      callback(message)
    })
  }

  get webSocket() {
    if (!ApplicationChannel.webSocket) {
      return (ApplicationChannel.webSocket = new WebSocket(Configuration.actionCableUrl))
    }

    return ApplicationChannel.webSocket
  }

  get ignoredEvents() {
    return ['ping', 'confirm_subscription', 'welcome']
  }

  /**
   * Check if the WebSocket connection is open and ready
   * @returns {boolean} - Whether the connection is open
   */
  connected() {
    return this.webSocket && this.webSocket.readyState === WebSocket.OPEN
  }
}

export default ApplicationChannel
