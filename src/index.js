import { Application } from '@hotwired/stimulus'
import Hellotext from './hellotext'

import FormController from './controllers/form_controller'

const application = Application.start()
application.register('hellotext--form', FormController)

export default Hellotext
