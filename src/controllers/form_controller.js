import { Controller } from '@hotwired/stimulus'

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

    if(this.element.checkValidity()) {
      console.log('should submit to backend')
    }
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
