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
      input.kind = 'text'
      input.id = input.name = data.kind
      label.setAttribute('for', data.kind)
    } else {
      input.kind = data.kind
      input.name = input.id = `property_by_id[${data.property}]`
      label.setAttribute('for', `property_by_id[${data.property}]`)
    }

    article.appendChild(label)
    article.appendChild(input)

    return article
  }
}

export { InputBuilder }
