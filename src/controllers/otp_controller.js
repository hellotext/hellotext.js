import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = [
    'input',
    'resendButton'
  ]

  initialize() {
    super.initialize()

    this.onInputChange = this.onInputChange.bind(this)
    this.onInputKeydown = this.onInputKeydown.bind(this)
  }

  connect() {
    super.connect()

    this.inputTarget.addEventListener('input', this.onInputChange)
    this.inputTarget.addEventListener('keydown', this.onInputKeydown)
  }

  disconnect() {
    this.inputTarget.removeEventListener('input', this.onInputChange)
    this.inputTarget.removeEventListener('keydown', this.onInputKeydown)

    super.disconnect()
  }

  resend() {
    console.log('resending')
  }

  onInputChange() {
    console.log('input change')
  }

  onInputKeydown() {
    console.log('input keydown')
  }
}
