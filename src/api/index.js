import BusinessesAPI from './businesses'
import EventsAPI from './events'
import FormsAPI from './forms'
import IdentificationsAPI from './identifications'
import WebchatsAPI from './webchats'
import AcksAPI from './acks'

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

  static get acks() {
    return AcksAPI
  }
}

export { Response } from './response'
