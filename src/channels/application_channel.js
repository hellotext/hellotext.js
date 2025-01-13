class ApplicationChannel {
  static webSocket;

  send({ command, identifier }) {
    const data = {
      command,
      identifier: JSON.stringify(identifier)
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
    this.webSocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      const { type, message } = data

      if (this.ignoredEvents.includes(type)) {
        return;
      }

      console.log(event)

      callback(message)
    })
  }

  get webSocket() {
    if (!ApplicationChannel.webSocket) {
      return ApplicationChannel.webSocket = new WebSocket("ws://localhost:3000/cable")
    }

    return ApplicationChannel.webSocket
  }

  get ignoredEvents() {
    return ['ping', 'welcome']
  }
}

export default ApplicationChannel
