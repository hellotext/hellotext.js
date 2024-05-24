import Hellotext from './hellotext.js'

class Forms {
  constructor() {
    this.forms = []

    this.includes = this.includes.bind(this)
    this.excludes = this.excludes.bind(this)
  }

  collect() {
    const formsIdsToFetch = this.#formIdsToFetch
    if (formsIdsToFetch.length === 0) return

    const promises = formsIdsToFetch.map(id => {
      return fetch(Hellotext.__apiURL + 'public/forms/' + id, { headers: Hellotext.headers })
        .then(response => response.json())
    })

    Promise
      .all(promises)
      .then(forms => forms.forEach(form => this.add(form)))
      .then(() => Hellotext.eventEmitter.emit('forms:collected', this))
  }

  add(form) {
    if(this.includes(form.id)) return
    this.forms.push(form)
  }

  includes(formId) {
    return this.forms.some(form => form.id === formId)
  }

  excludes(id) {
    return !this.includes(id)
  }

  get length() {
    return this.forms.length
  }

  get #formIdsToFetch() {
    return Array
      .from(document.querySelectorAll('[data-hello-form]'))
      .map(form => form.dataset.helloForm)
      .filter(this.excludes)
  }
}

export { Forms }
