import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'
import WebChatController from './controllers/webchat_controller'
import WebChatEmojiController from './controllers/webchat/emoji_picker_controller'

const application = Application.start()

application.register('hellotext--form', FormController)
application.register('hellotext--webchat', WebChatController)
application.register('hellotext--webchat--emoji', WebChatEmojiController)

import '../styles/index.css'

window.Hellotext = Hellotext

export default Hellotext
