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
}

export default WebChatChannel
