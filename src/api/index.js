import BusinessesAPI from './businesses'
import EventsAPI from './events'
import FormsAPI from './forms'
import IdentificationsAPI from './identifications'
import WebchatsAPI from './webchats'

export default class API {
  static get businesses() {
    return BusinessesAPI
  }

  static get events() {
    return EventsAPI
  }

  static get forms() {
    return FormsAPI
  }

  static get webchats() {
    return WebchatsAPI
  }

  static get identifications() {
    return IdentificationsAPI
  }
}

export { Response } from './response'
