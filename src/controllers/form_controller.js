import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
import { Form, Step } from '../models'

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

      this.revealOTPContainer()
    }
  }

  revealOTPContainer() {
    const paragraph = this.requiredInputs.find(input => input.name === 'email') ? 'An OTP has been sent to your email address' : 'An OTP has been sent to your phone number'
    const otpContainer = this.form.buildOTPContainer(paragraph)

    this.element.appendChild(otpContainer)
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
