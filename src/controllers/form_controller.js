import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
import { Form, Step } from '../models'

import FormsAPI from '../api/forms'

import { OTPBuilder } from '../builders/otp_builder'

export default class extends Controller {
  static values = {
    data: Object,
    step: { type: Number, default: 1 },
  }

  static targets = ['inputContainer', 'input', 'button', 'otpContainer']

  initialize() {
    this.form = new Form(this.dataValue, this.element)
  }

  connect() {
    super.connect()
    this.element.addEventListener('submit', this.submit.bind(this))

    if (document.activeElement.tagName !== 'INPUT') {
      this.inputTargets[0].focus()
    }
  }

  async submit(e) {
    e.preventDefault()

    if (this.invalid) {
      return this.showErrorMessages()
    }

    this.clearErrorMessages()

    this.formData = Object.fromEntries(new FormData(this.element))
    this.buttonTarget.disabled = true

    const response = await FormsAPI.submit(this.form.id, this.formData)
    this.buttonTarget.disabled = false

    if(response.failed) {
      return
    }

    this.buttonTarget.style.display = 'none'
    this.element.querySelectorAll('input').forEach(input => (input.disabled = true))

    const submission = await response.json()

    if(submission.identified) {
      this.completed()
    } else {
      Hellotext.setSession(submission.session)
      this.revealOTPContainer(submission.id)
    }
  }

  revealOTPContainer(submissionId) {
    const paragraph = this.requiredInputs.find(input => input.name === 'email')
      ? Hellotext.business.locale.otp.sent_to_email
      : Hellotext.business.locale.otp.sent_to_phone

    this.element.appendChild(OTPBuilder.build(submissionId, paragraph))
  }

  completed() {
    this.form.markAsCompleted(this.formData)
    this.element.remove()
  }

  // private

  showErrorMessages() {
    this.element.querySelectorAll('input:invalid').forEach(input => {
      const parent = input.closest('article')
      parent.querySelector('[data-error-container]').innerText = input.validationMessage
    })
  }

  clearErrorMessages() {
    this.element.querySelectorAll('input').forEach(input => {
      const parent = input.closest('article')
      parent.querySelector('[data-error-container]').innerText = ''
    })
  }

  inputTargetConnected(target) {
    if (target.getAttribute('data-default-value')) {
      target.value = target.getAttribute('data-default-value')
    }
  }

  get currentStep() {
    return new Step(this.dataValue.steps.find(step => step.position === this.stepValue))
  }

  get requiredInputs() {
    return this.inputTargets.filter(input => input.required)
  }

  get invalid() {
    return !this.element.checkValidity()
  }
}
