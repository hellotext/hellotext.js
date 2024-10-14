import Hellotext from '../hellotext'
import API from '../api/forms'

import { Configuration } from '../core'
import { Form } from './form'

import { NotInitializedError } from '../errors'

class FormCollection {
  constructor() {
    this.forms = []

    this.includes = this.includes.bind(this)
    this.excludes = this.excludes.bind(this)

    this.add = this.add.bind(this)

    if(typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(this.formMutationObserver.bind(this))
      this.mutationObserver.observe(document.body, { childList: true, subtree: true })
    }
  }

  formMutationObserver(mutations) {
    const mutation = mutations.find(
      mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0,
    )

    if (!mutation) return

    const forms = Array.from(document.querySelectorAll('[data-hello-form]'))

    if (forms && Configuration.forms.autoMount) {
      this.collect()
    }
  }

  async collect() {
    if (Hellotext.notInitialized) {
      throw new NotInitializedError()
    }

    if(this.fetching) return

    const formsIdsToFetch = this.#formIdsToFetch
    if (formsIdsToFetch.length === 0) return

    const promises = formsIdsToFetch.map(id => {
      return API.get(id).then(response => response.json())
    })

    if (!Hellotext.business.enabledWhitelist) {
      console.warn(
        'No whitelist has been configured. It is advised to whitelist the domain to avoid bots from submitting forms.',
      )
    }

    this.fetching = true

    await Promise.all(promises)
      .then(forms => forms.forEach(this.add))
      .then(() => Hellotext.eventEmitter.dispatch('forms:collected', this))
      .then(() => this.fetching = false)

    if (Configuration.autoMountForms) {
      this.forms.forEach(form => form.mount())
    }
  }

  forEach(callback) {
    this.forms.forEach(callback)
  }

  map(callback) {
    return this.forms.map(callback)
  }

  add(data) {
    if (this.includes(data.id)) return
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
    return Array.from(document.querySelectorAll('[data-hello-form]'))
      .map(form => form.dataset.helloForm)
      .filter(this.excludes)
  }
}

export { FormCollection }
