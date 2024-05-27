import SessionsAPI from './api/sessions'
import BusinessesAPI from './api/businesses'

export default class API {
  static root = 'http://api.lvh.me:3000'

  constructor() {}

  static sessions(businessId) {
    return new SessionsAPI(businessId)
  }

  static get businesses() {
    return BusinessesAPI
  }
}
