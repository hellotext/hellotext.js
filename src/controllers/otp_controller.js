import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
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
  }

  connect() {
    super.connect()
    this.inputTarget.addEventListener('input', this.onInputChange)
  }

  disconnect() {
    this.inputTarget.removeEventListener('input', this.onInputChange)
    super.disconnect()
  }

  async resend() {
    this.resendButtonTarget.disabled = true
    const response = await SubmissionsAPI.resendOTP(this.submissionIdValue)

    if(response.succeeded) {
      this.resendButtonTarget.disabled = false
    }

    alert(Hellotext.business.locale.otp.resend_successful)
  }

  async onInputChange() {
    if(this.inputTarget.value.length !== 6) return

    this.inputTarget.disabled = true
    this.resendButtonTarget.disabled = true

    const response = await SubmissionsAPI.verifyOTP(this.submissionIdValue, this.inputTarget.value)

    if(response.succeeded) {
      this.dispatch('verified', {
        detail: {
          submissionId: this.submissionIdValue,
          sessionId: (await response.json()).id
        }
      })
    } else {
      alert(Hellotext.business.locale.otp.invalid)
    }

    this.inputTarget.disabled = false
    this.resendButtonTarget.disabled = false
  }
}
