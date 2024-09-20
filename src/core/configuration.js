import { Application } from '@hotwired/stimulus'
import FormController from '../controllers/form_controller'

class Configuration {
  static apiRoot = 'https://api.hellotext.com/v1'
  static autoGenerateSession = true
  static autoMountForms = true
  static useStimulus = true

  static assign(props) {
    if(props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    if(this.useStimulus) {
      const application = Application.start()
      application.register('hellotext--form', FormController)
    }

    return this
  }

  static endpoint(path) {
    return `${this.apiRoot}/${path}`
  }
}

export { Configuration }
