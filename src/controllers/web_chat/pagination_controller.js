import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    page: { type: Number, default: undefined }
  }

  static targets = ['scrollable']

  initialize() {
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

  onScroll() {
    console.log(this.scrollableTarget.scrollTop)
  }
}
