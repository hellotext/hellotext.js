import SessionsAPI from './sessions'
import BusinessesAPI from './businesses'
import EventsAPI from './events'
import FormsAPI from './forms'
import WebchatsAPI from './webchats'

export default class API {
  static sessions(businessId) {
    return new SessionsAPI(businessId)
  }

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
}

export { Response } from './response'
