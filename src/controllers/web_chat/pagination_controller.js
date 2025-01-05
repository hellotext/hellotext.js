import { Controller } from '@hotwired/stimulus'

import { Configuration } from '../../core'
import WebChatMessagesAPI from '../../api/web_chat/messages'

export default class extends Controller {
  static values = {
    nextPage: { type: Number, default: undefined }
  }

  static targets = ['scrollable']

  initialize() {
    this.messagesAPI = new WebChatMessagesAPI(Configuration.webChat.id)
    this.onScroll = this.onScroll.bind(this)

    super.initialize()
  }

  connect() {
    this.scrollableTarget.addEventListener('scroll', this.onScroll)
    super.connect()
  }

  disconnect() {
    this.scrollableTarget.removeEventListener('scroll', this.onScroll)
    super.disconnect()
  }

  async onScroll() {
    if(this.scrollableTarget.scrollTop > 300 || !this.nextPageValue) return

    console.log('fetching....')
    const response = await this.messagesAPI.index({ page: this.nextPageValue })

    console.log(response)
  }
}
