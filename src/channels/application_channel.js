class ApplicationChannel {
  static webSocket;

  send({ command, identifier }) {
    const data = {
      command,
      identifier: JSON.stringify(identifier)
    }

    if (ApplicationChannel.webSocket.readyState === WebSocket.OPEN) {
      ApplicationChannel.webSocket.send(JSON.stringify(data))
    } else {
      ApplicationChannel.webSocket.addEventListener('open', () => {
        ApplicationChannel.webSocket.send(JSON.stringify(data))
      })
    }
  }

  onMessage(callback) {
    this.webSocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'ping') {
        return;
      }

      callback(data)
    })
  }

  get webSocket() {
    if (!ApplicationChannel.webSocket) {
      return ApplicationChannel.webSocket = new WebSocket("ws://localhost:3000/cable")
    }

    return ApplicationChannel.webSocket
  }
}

export default ApplicationChannel
