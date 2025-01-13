import ApplicationChannel from './application_channel'

class WebchatChannel extends ApplicationChannel {
  constructor(id, session, conversation) {
    super()

    this.id = id
    this.session = session
    this.conversation = conversation

    this.subscribe()
  }

  subscribe() {
    const params = {
      channel: "WebchatChannel",
      id: this.id,
      session: this.session,
      conversation: this.conversation,
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

  onAgentOnline(callback) {
    super.onMessage((message) => {
      if(message.type === 'agent_is_online') {
        callback(message)
      }
    })
  }

  onReaction(callback) {
    super.onMessage((message) => {
      if(message.type === 'reaction.create' || message.type === 'reaction.destroy') {
        callback(message)
      }
    })
  }

  updateSubscriptionWith(conversation) {
    this.conversation = conversation
    this.subscribe()
  }
}

export default WebchatChannel
