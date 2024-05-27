import SessionsAPI from './api/sessions'
import BusinessesAPI from './api/businesses'

export default class API {
  static root = 'https://api.hellotext.com'

  static sessions(businessId) {
    return new SessionsAPI(businessId)
  }

  static get businesses() {
    return new BusinessesAPI()
  }
}
