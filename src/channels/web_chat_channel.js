import ApplicationChannel from './application_channel'

class WebChatChannel extends ApplicationChannel {
  constructor(id, session) {
    super()

    this.id = id
    this.session = session

    this.subscribe()
  }

  subscribe() {
    const params = {
      channel: "WebChatChannel",
      id: this.id,
      session: this.session
    }

    this.send( { command: 'subscribe',  identifier: params })
  }

  onMessage(callback) {
    super.onMessage((message) => {
      if(message.type !== 'message') return
      callback(message)
    })
  }

  onConversationAssignment(callback) {
    super.onMessage((message) => {
      if(message.type === 'conversation.assigned') {
        callback(message)
      }
    })
  }

  updateSubscription() {
    const params = {
      channel: "WebChatChannel",
      id: this.id,
      session: this.session
    }

    this.send({ command: 'unsubscribe', identifier: params })
    this.subscribe()
  }
}

export default WebChatChannel
