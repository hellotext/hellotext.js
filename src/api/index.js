import SessionsAPI from './sessions'
import BusinessesAPI from './businesses'
import EventsAPI from './events'
import FormsAPI from './forms'

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
}

export { Response } from './response'
