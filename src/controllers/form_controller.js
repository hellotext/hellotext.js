import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
import { Form, Step, Cookies } from '../models'

import API from '../api'
import FormsAPI from '../api/forms'

export default class extends Controller {
  static values = {
    data: Object,
    step: { type: Number, default: 1 }
  }

  static targets = [
    'inputContainer',
    'input',
    'button',
    'otpContainer',
  ]

  initialize() {
    this.form = new Form(this.dataValue, this.element)
  }

  connect() {
    super.connect()
    this.element.addEventListener('submit', this.submit.bind(this))
  }

  async submit(e) {
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
    this.buttonTarget.disabled = true

    const response = await FormsAPI.submit(this.form.id, Object.fromEntries(formData))
    this.buttonTarget.disabled = false

    if(response.succeeded) {
      this.buttonTarget.style.display = 'none'
      this.element.querySelectorAll('input').forEach(input => input.disabled = true)

      const data = await response.json()
      this.revealOTPContainer(data.id)
    }
  }

  revealOTPContainer(submissionId) {
    const paragraph = this.requiredInputs.find(input => input.name === 'email')
      ? Hellotext.business.locale.otp.sent_to_email
      : Hellotext.business.locale.otp.sent_to_phone

    const otpContainer = this.form.buildOTPContainer(submissionId, paragraph)
    this.element.appendChild(otpContainer)
  }

  completed({ detail }) {
    this.form.markAsCompleted()
    Hellotext.setSession(detail.sessionId)

    this.element.remove()
  }

  // private

  inputTargetConnected(target) {
    if(target.getAttribute('data-default-value')) {
      target.value = target.getAttribute('data-default-value')
    }
  }

  get currentStep() {
    return new Step(this.dataValue.steps.find(step => step.position === this.stepValue))
  }

  get requiredInputs() {
    return this.inputTargets.filter(input => input.required)
  }
}
