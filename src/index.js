import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import OTPController from './controllers/otp_controller'

const application = Application.start()
application.register('hellotext--form', FormController)
application.register('hellotext--otp', OTPController)

import '../styles/index.css'

addEventListener('load', () => {
  console.log('document has loaded')
})

export default Hellotext
