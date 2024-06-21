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

  async onInputChange() {
    if(this.inputTarget.value.length !== 6) return

    this.inputTarget.disabled = true
    this.resendButtonTarget.disabled = true

    const response = await SubmissionsAPI.verifyOTP(this.submissionIdValue, this.inputTarget.value)

    if(response.succeeded) {
      alert('OTP Verified Successfully')
    } else {
      alert('OTP Verification Failed')
    }
  }

  onInputKeydown() {
    console.log('input keydown')
  }
}
