import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
import { Form, Step } from '../models'

export default class extends Controller {
  static values = {
    data: Object,
    step: { type: Number, default: 1 }
  }

  static targets = [
    'inputContainer',
    'input',
    'button',
  ]

  initialize() {
    this.form = new Form(this.dataValue, this.element)
  }

  connect() {
    super.connect()

    this.element.addEventListener('submit', this.submit.bind(this))
  }

  submit(e) {
    e.preventDefault()

    if(!this.element.checkValidity()) {

      this.element.querySelectorAll('input:invalid').forEach(input => {
        const parent = input.closest('article')
        parent.querySelector('[data-error-container]').innerText = input.validationMessage
      })

      return
    }

    this.element.querySelectorAll('input').forEach(input => {
      const parent = input.closest('article')
      parent.querySelector('[data-error-container]').innerText = ''
    })

    const formData = new FormData(this.element)

    fetch(this.form.submissionUrl, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify(Object.fromEntries(formData))
    })
  }

  revealOTPContainer() {
    const paragraph = document.createElement('p')

    if(this.requiredInputs.find(input => input.name === 'email')) {
      paragraph.innerText = 'An OTP has been sent to your email address'
    } else {
      paragraph.innerText = 'An OTP has been sent to your phone number'
    }

    const otpInput = document.createElement('input')
    otpInput.type = 'text'
    otpInput.name = 'otp'
  }

  // private

  inputTargetConnected(target) {
  }

  get currentStep() {
    return new Step(this.dataValue.steps.find(step => step.position === this.stepValue))
  }

  get requiredInputs() {
    return this.inputTargets.filter(input => input.required)
  }
}
