class InputBuilder {
  static build(data) {
    const article = document.createElement('article')
    const label = document.createElement('label')
    const input = document.createElement('input')

    label.innerText = data.label

    input.type = data.type
    input.required = data.required
    input.placeholder = data.placeholder

    if(['first_name', 'last_name'].includes(data.type)) {
      input.type = 'text'
      input.id = input.name = data.type
      label.setAttribute('for', data.type)
    } else {
      input.type = data.type
      input.name = input.id = `property_by_id[${data.property}]`
      label.setAttribute('for', `property_by_id[${data.property}]`)
    }

    const main = document.createElement('main')

    main.appendChild(label)
    main.appendChild(input)

    article.appendChild(main)

    article.setAttribute('data-hellotext--form-target', 'inputContainer')
    input.setAttribute('data-hellotext--form-target', 'input')

    const errorContainer = document.createElement('div')
    errorContainer.setAttribute('data-error-container', '')

    article.appendChild(errorContainer)

    return article
  }
}

export { InputBuilder }
