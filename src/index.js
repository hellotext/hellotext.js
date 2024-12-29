import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import WebChatController from './controllers/webchat_controller'

const application = Application.start()

application.register('hellotext--form', FormController)
application.register('hellotext--webchat', WebChatController)

import '../styles/index.css'

window.Hellotext = Hellotext

export default Hellotext
