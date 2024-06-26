import Hellotext from '../hellotext.js'
import { Form } from './form'
import API from "../api/forms";

class FormCollection {
  constructor() {
    this.forms = []

    this.includes = this.includes.bind(this)
    this.excludes = this.excludes.bind(this)
  }

  collect() {
    const formsIdsToFetch = this.#formIdsToFetch
    if (formsIdsToFetch.length === 0) return

    const promises = formsIdsToFetch.map(id => {
      return API.get(id).then(response => response.json())
    })

    if(!Hellotext.business.enabledWhitelist) {
      console.warn('No whitelist has been configured. It is advised to whitelist the domain to avoid bots from submitting forms.')
    }

    Promise
      .all(promises)
      .then(forms => forms.forEach(form => this.add(form)))
      .then(() => Hellotext.eventEmitter.dispatch('forms:collected', this))
  }

  add(data) {
    if(this.includes(data.id)) return
    this.forms.push(new Form(data))
  }

  getById(id) {
    return this.forms.find(form => form.id === id)
  }

  getByIndex(index) {
    return this.forms[index]
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

export { FormCollection }
