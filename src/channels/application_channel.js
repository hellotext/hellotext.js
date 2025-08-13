class ApplicationChannel {
  static webSocket

  send({ command, identifier, data: {} }) {
    const data = {
      command,
      identifier: JSON.stringify(identifier),
      data: JSON.stringify(data),
    }

    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(data))
    } else {
      this.webSocket.addEventListener('open', () => {
        this.webSocket.send(JSON.stringify(data))
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
      return (ApplicationChannel.webSocket = new WebSocket('ws://localhost:3000/cable'))
    }

    return ApplicationChannel.webSocket
  }

  get ignoredEvents() {
    return ['ping', 'confirm_subscription', 'welcome']
  }
}

export default ApplicationChannel
