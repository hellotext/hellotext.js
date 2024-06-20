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


    console.log(this.form.id, Object.fromEntries(formData))
    const response = await FormsAPI.submit(this.form.id, Object.fromEntries(formData))

    this.buttonTarget.disabled = false

    if(response.succeeded) {
      this.revealOTPContainer()
    }
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

    const article = document.createElement('article')

    article.setAttribute('data-hello-form-otp', '')

    article.appendChild(paragraph)
    article.appendChild(otpInput)

    this.element.appendChild(article)
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
