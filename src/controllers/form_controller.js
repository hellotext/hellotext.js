import { Controller } from '@hotwired/stimulus'

import Hellotext from '../hellotext'
import { Form } from '../models'

import FormsAPI from '../api/forms'

import { Configuration } from '../core'

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

    const data = await response.json()

    if (response.failed) {
      data.errors.forEach(error => {
        const { type, parameter } = error

        const input = this.inputTargets.find(input => input.name === parameter)

        input.setCustomValidity(Hellotext.business.locale.errors[type])
        input.reportValidity()

        input.addEventListener('input', () => {
          input.setCustomValidity('')
          input.reportValidity()
        })
      })

      return this.showErrorMessages()
    }

    this.buttonTarget.style.display = 'none'
    this.element.querySelectorAll('input').forEach(input => (input.disabled = true))

    this.completed()
  }

  completed() {
    this.form.markAsCompleted(this.formData)

    if (!Configuration.forms.shouldShowSuccessMessage) {
      return this.element.remove()
    }

    if (typeof Configuration.forms.successMessage === 'string') {
      this.element.innerHTML = Configuration.forms.successMessage
    } else {
      this.element.innerHTML = Hellotext.business.locale.forms[this.form.localeAuthKey]
    }
  }

  // private

  showErrorMessages() {
    this.inputTargets.forEach(input => {
      const errorsContainer = input.closest('article').querySelector('[data-error-container]')

      if (input.validity.valid) {
        errorsContainer.innerText = ''
      } else {
        errorsContainer.innerText = input.validationMessage
      }
    })
  }

  clearErrorMessages() {
    this.inputTargets.forEach(input => {
      input.setCustomValidity('')
      input.closest('article').querySelector('[data-error-container]').innerText = ''
    })
  }

  inputTargetConnected(target) {
    if (target.getAttribute('data-default-value')) {
      target.value = target.getAttribute('data-default-value')
    }
  }

  get requiredInputs() {
    return this.inputTargets.filter(input => input.required)
  }

  get invalid() {
    return !this.element.checkValidity()
  }
}
