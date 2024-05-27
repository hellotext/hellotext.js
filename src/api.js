import SessionsAPI from './api/sessions'
import BusinessesAPI from './api/businesses'

export default class API {

  static sessions(businessId) {
    return new SessionsAPI(businessId)
  }

  static get businesses() {
    return BusinessesAPI
  }
}
