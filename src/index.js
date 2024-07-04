import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import OTPController from './controllers/otp_controller'

const application = Application.start()
application.register('hellotext--form', FormController)
application.register('hellotext--otp', OTPController)

// import '../styles/index.css'

const observer = new MutationObserver((mutationsList) => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      console.log(document.querySelectorAll('[data-hello-form]'))
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

export default Hellotext
