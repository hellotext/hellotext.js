import Hellotext from '../hellotext'

class InputBuilder {
  static build(data) {
    const article = document.createElement('article')
    const label = document.createElement('label')
    const input = document.createElement('input')

    label.innerText = data.label

    input.type = data.type
    input.required = data.required
    input.placeholder = data.placeholder

    if(['first_name', 'last_name'].includes(data.kind)) {
      input.type = 'text'
      input.id = input.name = data.kind
      label.setAttribute('for', data.kind)
    } else {
      input.type = data.type

      if(data.type === 'email') {
        input.id = input.name = 'email'
        label.setAttribute('for', 'email')
      } else if(input.type === 'tel') {
        input.id = input.name = 'phone'
        label.setAttribute('for', 'phone')
        input.value = `+${Hellotext.business.country.prefix}`
      } else {
        input.name = input.id = `property_by_id[${data.property}]`
        label.setAttribute('for', `property_by_id[${data.property}]`)
      }
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
