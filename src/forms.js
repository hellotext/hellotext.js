import Hellotext from './hellotext.js'

class Forms {
  static collect() {
    const forms = new Forms()

    window.addEventListener('load', () => {
      Array.from(document.querySelectorAll('data-hello-form'))
        .map(form => form.dataset.helloForm)
        .forEach(id => {
          fetch(Hellotext.__apiURL + '/public/forms/' + id, { headers: Hellotext.headers })
            .then(response => response.json())
            .then(data => forms.add(data))
        })
    })
  }

  constructor() {
    this.forms = []
  }

  add(form) {
    this.forms.push(form)
  }
}

export { Forms }
