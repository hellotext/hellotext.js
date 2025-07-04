import { Application } from '@hotwired/stimulus';
import Hellotext from './hellotext';
import FormController from './controllers/form_controller';
import WebChatEmojiController from './controllers/webchat/emoji_picker_controller';
import WebchatController from './controllers/webchat_controller';
var application = Application.start();
application.register('hellotext--form', FormController);
application.register('hellotext--webchat', WebchatController);
application.register('hellotext--webchat--emoji', WebChatEmojiController);
window.Hellotext = Hellotext;
export default Hellotext;