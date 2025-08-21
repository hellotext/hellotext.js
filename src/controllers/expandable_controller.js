import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  initialize() {
    this.autoExpandHeight = this.autoExpandHeight.bind(this)
    this.observer = new MutationObserver(this.onMutation.bind(this), { attributes: true })
  }

  connect() {
    this.element.addEventListener('input', this.autoExpandHeight)
    this.observer.observe(this.element, { attributes: true })
  }

  disconnect() {
    this.element.removeEventListener('input', this.autoExpandHeight)
    this.observer.disconnect()
  }

  onMutation(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && this.element.hasAttribute('data-auto-expand')) {
        this.autoExpandHeight()
        this.element.removeAttribute('data-auto-expand')
      }
    })
  }

  autoExpandHeight() {
    this.element.style.height = '2rem'
    this.element.style.height = `${this.element.scrollHeight}px`
  }
}
