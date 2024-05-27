import SessionsAPI from './api/sessions'
import BusinessesAPI from './api/businesses'
import EventsAPI from './api/events'

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
