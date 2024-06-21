import { InputBuilder } from '../builders/inputBuilder'
import { SubmissionsAPI } from '../api/forms'

class Form {
  constructor(data, element = null) {
    this.data = data
    this.element = element || document.querySelector(`[data-hello-form="${this.id}"]`) || document.createElement('form')
  }

  build() {
    const firstStep = this.data.steps[0]

    this.buildHeader(firstStep.header)
    this.buildInputs(firstStep.inputs)
    this.buildButton(firstStep.button)
    this.buildFooter(firstStep.footer)

    this.element.setAttribute('data-controller', 'hellotext--form')
    this.element.setAttribute('data-hello-form', this.id)
    this.element.setAttribute('data-hellotext--form-data-value', JSON.stringify(this.data))
  }

  buildHeader(header) {
    const headerElement = this.#findOrCreateComponent('[data-form-header]', 'header')
    headerElement.innerHTML = header.content

    if(this.element.querySelector('[data-form-header]')) {
      this.element.querySelector('[data-form-header]').replaceWith(headerElement)
    } else {
      this.element.prepend(headerElement)
    }
  }

  buildInputs(inputs) {
    const inputsContainerElement = this.#findOrCreateComponent('[data-form-inputs]', 'main')
    const inputElements = inputs.map(input => InputBuilder.build(input))

    inputElements.forEach(inputElement => inputsContainerElement.appendChild(inputElement))

    if(this.element.querySelector('[data-form-inputs]')) {
      this.element
        .querySelector('[data-form-inputs]')
        .replaceWith(inputsContainerElement)
    } else {
      this.element
        .querySelector('[data-form-header]')
        .insertAdjacentHTML('afterend', inputsContainerElement.outerHTML)
    }
  }

  buildButton(button) {
    const buttonElement = this.#findOrCreateComponent('[data-form-button]', 'button')
    buttonElement.innerText = button.text

    buttonElement.setAttribute('data-action', 'click->hellotext--form#submit')
    buttonElement.setAttribute('data-hellotext--form-target', 'button')

    if(this.element.querySelector('[data-form-button]')) {
      this.element.querySelector('[data-form-button]').replaceWith(buttonElement)
    } else {
      this.element
        .querySelector('[data-form-inputs]')
        .insertAdjacentHTML('afterend', buttonElement.outerHTML)
    }
  }

  buildFooter(footer) {
    const element = this.#findOrCreateComponent('header', 'header')
    element.innerHTML = footer.content

    if(this.element.querySelector('[data-form-footer]')) {
      this.element.querySelector('[data-form-footer]').replaceWith(element)
    } else {
      this.element.appendChild(element)
    }
  }

  buildOTPContainer(submissionId, label) {
    const paragraph = document.createElement('p')
    paragraph.innerText = label

    const otpInput = document.createElement('input')
    otpInput.type = 'text'
    otpInput.name = 'otp'

    otpInput.setAttribute('data-hellotext--otp-target', 'input')
    otpInput.placeholder = 'Enter your OTP'

    const article = document.createElement('article')

    article.setAttribute('data-form-otp', '')
    article.setAttribute('data-controller', 'hellotext--otp')
    article.setAttribute('data-hellotext--otp-submission-id-value', submissionId)
    article.setAttribute('data-hellotext--form-target', 'otpContainer')

    const header = document.createElement('header')

    header.setAttribute('data-otp-header', '')
    header.appendChild(paragraph)
    header.appendChild(otpInput)

    article.appendChild(header)

    const footer = document.createElement('footer')
    footer.setAttribute('data-otp-footer', '')

    const resendOTPButton = document.createElement('button')
    resendOTPButton.innerText = 'Resend OTP'

    resendOTPButton.setAttribute('data-action', 'click->hellotext--otp#resend')
    resendOTPButton.setAttribute('data-hellotext--otp-target', 'resendButton')

    footer.appendChild(resendOTPButton)

    article.appendChild(footer)

    return article
  }

  get id() {
    return this.data.id
  }

  get submissionUrl() {
    return SubmissionsAPI.endpoint.replace(':form_id', this.id)
  }

  #findOrCreateComponent(selector, tag) {
    const existingElement = this.element.querySelector(selector)

    if(existingElement) {
      return existingElement.cloneNode(true)
    }

    const createdElement = document.createElement(tag)
    createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '')

    return createdElement
  }
}

export { Form }
