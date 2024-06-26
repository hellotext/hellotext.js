import Hellotext from '../hellotext'

import { InputBuilder } from '../builders/inputBuilder'

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
    this.element.setAttribute('data-action', 'hellotext--otp:verified->hellotext--form#completed')
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
    const template = this.otpTemplate(submissionId, label)
    const container = document.createElement('div')
    container.innerHTML = template

    return container.firstElementChild
  }

  markAsCompleted() {
    localStorage.setItem(`hello-form-${this.id}`, 'completed')
    Hellotext.eventEmitter.dispatch('form:completed', { id: this.id })
  }

  otpTemplate(submissionId, paragraph) {
    return `
      <article 
        data-controller="hellotext--otp" 
        data-hellotext--otp-submission-id-value="${submissionId}"
        data-hellotext--form-target="otpContainer"
        data-form-otp
        >
        <header data-otp-header>
          <p>${paragraph}</p>
          <input 
            type="text"
            name="otp"
            data-hellotext--otp-target="input"
            placeholder="Enter your OTP"
            maxlength="6"
            />
        </header>
        
        <footer data-otp-footer>
          <button type="button" data-hellotext--otp-target="resendButton" data-action="hellotext--otp#resend">
            ${Hellotext.business.locale.otp.resend}
          </button>
        </footer>
      </article>
    `
  }

  get id() {
    return this.data.id
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
