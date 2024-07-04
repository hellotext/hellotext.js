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
})

addEventListener('readystatechange', () => {

})

document.onreadystatechange = () => {
  console.log(document.readyState)

  if(document.readyState === 'complete') {
    console.log('loadedd 2')
    Hellotext.forms.collect()
  }
}

addEventListener('load', () => {
  console.log('loadedd 3')
  Hellotext.forms.collect()
})
export default Hellotext
