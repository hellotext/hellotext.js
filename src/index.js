import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import OTPController from './controllers/otp_controller'

const application = Application.start()
application.register('hellotext--form', FormController)
application.register('hellotext--otp', OTPController)

// import '../styles/index.css'

addEventListener('DOMContentLoaded', () => {
  console.log('loadedd')
  Hellotext.forms.collect()

  setTimeout(() => {
    console.log('collecting')
    Hellotext.forms.collect()
  }, 2000)
})

export default Hellotext
