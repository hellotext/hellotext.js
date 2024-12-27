import Hellotext from '../hellotext'
import { Configuration } from '../core'

class SubmissionsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/webchats')
  }
}
