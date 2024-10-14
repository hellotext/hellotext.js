import Hellotext from '../hellotext'

import { InputBuilder } from '../builders/input_builder'
import { LogoBuilder } from '../builders/logo_builder'

class Form {
  constructor(data, element = null) {
    this.data = data
    this.element =
      element ||
      document.querySelector(`[data-hello-form="${this.id}"]`) ||
      document.createElement('form')
  }

  async mount({ ifCompleted = true } = {}) {
    if(ifCompleted && this.hasBeenCompleted) {
      return
    }

    const firstStep = this.data.steps[0]

    this.buildHeader(firstStep.header)
    this.buildInputs(firstStep.inputs)
    this.buildButton(firstStep.button)
    this.buildFooter(firstStep.footer)

    this.elementAttributes.forEach(attribute => {
      this.element.setAttribute(attribute.name, attribute.value)
    })

    if (!document.contains(this.element)) {
      document.body.appendChild(this.element)
    }

    if (!Hellotext.business.features.white_label) {
      this.element.prepend(LogoBuilder.build())
    }
  }

  buildHeader(header) {
    const headerElement = this.#findOrCreateComponent('[data-form-header]', 'header')
    headerElement.innerHTML = header.content

    if (this.element.querySelector('[data-form-header]')) {
      this.element.querySelector('[data-form-header]').replaceWith(headerElement)
    } else {
      this.element.prepend(headerElement)
    }
  }

  buildInputs(inputs) {
    const inputsContainerElement = this.#findOrCreateComponent('[data-form-inputs]', 'main')
    const inputElements = inputs.map(input => InputBuilder.build(input))

    inputElements.forEach(inputElement => inputsContainerElement.appendChild(inputElement))

    if (this.element.querySelector('[data-form-inputs]')) {
      this.element.querySelector('[data-form-inputs]').replaceWith(inputsContainerElement)
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

    if (this.element.querySelector('[data-form-button]')) {
      this.element.querySelector('[data-form-button]').replaceWith(buttonElement)
    } else {
      this.element
        .querySelector('[data-form-inputs]')
        .insertAdjacentHTML('afterend', buttonElement.outerHTML)
    }
  }

  buildFooter(footer) {
    const element = this.#findOrCreateComponent('[data-form-footer]', 'footer')
    element.innerHTML = footer.content

    if (this.element.querySelector('[data-form-footer]')) {
      this.element.querySelector('[data-form-footer]').replaceWith(element)
    } else {
      this.element.appendChild(element)
    }
  }

  markAsCompleted(data) {
    localStorage.setItem(`hello-form-${this.id}`, JSON.stringify({ state: 'completed', data }))

    Hellotext.eventEmitter.dispatch('form:completed', { id: this.id, ...data })
  }

  get hasBeenCompleted() {
    return localStorage.getItem(`hello-form-${this.id}`) !== null
  }

  get id() {
    return this.data.id
  }

  get requiresAuthentication() {
    const firstStep = this.data.steps[0]
    return firstStep.inputs.some(input => input.kind === 'email') || firstStep.inputs.some(input => input.kind === 'phone')
  }

  get localeAuthKey() {
    const firstStep = this.data.steps[0]

    if(firstStep.inputs.some(input => input.kind === 'email') && firstStep.inputs.some(input => input.kind === 'phone')) {
      return 'phone_and_email'
    } else if(firstStep.inputs.some(input => input.kind === 'email')) {
      return 'email'
    } else if(firstStep.inputs.some(input => input.kind === 'phone')) {
      return 'phone'
    } else {
      return null
    }
  }

  get elementAttributes() {
    return [
      {
        name: 'data-controller',
        value: 'hellotext--form',
      },
      {
        name: 'data-hello-form',
        value: this.id,
      },
      {
        name: 'data-hellotext--form-data-value',
        value: JSON.stringify(this.data),
      },
    ]
  }

  #findOrCreateComponent(selector, tag) {
    const existingElement = this.element.querySelector(selector)

    if (existingElement) {
      return existingElement.cloneNode(true)
    }

    const createdElement = document.createElement(tag)
    createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '')

    return createdElement
  }
}

export { Form }
