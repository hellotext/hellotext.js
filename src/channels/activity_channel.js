import ApplicationChannel from './application_channel'

import Hellotext from '../hellotext'

class ActivityChannel extends ApplicationChannel {
  constructor() {
    super()

    this.business = Hellotext.business.id
    this.session = Hellotext.session

    this.subscribe()
  }

  subscribe() {
    const params = {
      channel: 'Contact::ActivityChannel',
      business: this.business,
      session: this.session,
    }

    this.send({ command: 'subscribe', identifier: params })
  }

  sendHeartbeat() {
    const params = {
      channel: 'Contact::ActivityChannel',
      session: this.session,
      business: this.business,
    }

    const data = {
      action: 'heartbeat',
      url: window.location.href,
      user_agent: navigator.userAgent,
    }

    this.send({ command: 'message', identifier: params, data })
  }
}

export default ActivityChannel
