import { InputBuilder } from '../builders/inputBuilder'

class Form {
  constructor(data) {
    this.data = data
    this.element = document.querySelector(`[data-hello-form="${this.id}"]`) || document.createElement('form')
  }

  build() {
    this.data.steps.forEach((step) => {
      this.buildHeader(step.header)
      this.buildInputs(step.inputs)
      this.buildButton(step.button)
      this.buildFooter(step.footer)
    })
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
        .insertAdjacentHTML('afterend', this.element.querySelector('[data-form-header]'))
    }
  }

  buildButton(button) {
    const buttonElement = this.#findOrCreateComponent('[data-form-button]', 'section')
    buttonElement.innerText = button.text

    if(this.element.querySelector('[data-form-button]')) {
      this.element.querySelector('[data-form-button]').replaceWith(buttonElement)
    } else {
      this.element
        .querySelector('[data-form-inputs]')
        .insertAdjacentHTML('afterend', buttonElement)
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

  get id() {
    return this.data.id
  }

  #findOrCreateComponent(selector, tag) {
    return this.element.querySelector(selector).cloneNode(true) || document.createElement(tag)
  }
}

export { Form }
