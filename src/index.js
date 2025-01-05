import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import WebChatController from './controllers/webchat_controller'
import WebChatPaginationController from './controllers/web_chat/pagination_controller'

const application = Application.start()

application.register('hellotext--form', FormController)
application.register('hellotext--webchat', WebChatController)
application.register('hellotext--webchat--pagination', WebChatPaginationController)

import '../styles/index.css'

window.Hellotext = Hellotext

export default Hellotext
