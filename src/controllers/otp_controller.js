import { Controller } from '@hotwired/stimulus'

import SubmissionsAPI from '../api/submissions'

export default class extends Controller {
  static values = {
    submissionId: String
  }

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

  async resend() {
    this.resendButtonTarget.disabled = true
    const response = await SubmissionsAPI.resendOTP(this.submissionIdValue)

    if(response.succeeded) {
      this.resendButtonTarget.disabled = false
    }

    alert('OTP Sent Successfully')
  }

  onInputChange() {
    console.log('input change')
  }

  onInputKeydown() {
    console.log('input keydown')
  }
}
