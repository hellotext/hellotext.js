import SessionsAPI from './sessions'
import BusinessesAPI from './businesses'
import EventsAPI from './events'

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
}

export { default as Response } from './response'
