import Hellotext from './hellotext.js'

class Forms {
  constructor() {
    this.forms = []
  }

  async collect() {
    Array.from(document.querySelectorAll('[data-hello-form]'))
      .map(form => form.dataset.helloForm)
      .forEach(id => {
        fetch(Hellotext.__apiURL + 'public/forms/' + id, { headers: Hellotext.headers })
          .then(response => response.json())
          .then(data => this.add(data))
      })
  }

  add(form) {
    this.forms.push(form)
  }
}

export { Forms }
