import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'

const application = Application.start()
application.register('hellotext--form', FormController)

import '../styles/index.css'

window.Hellotext = Hellotext

export default Hellotext
