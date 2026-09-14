import { autoPlacement, offset, shift } from '@floating-ui/dom';
import { Controller } from '@hotwired/stimulus';
import { usePopover } from '../mixins/usePopover';
export default class extends Controller {
  static targets = ['button', 'popover'];
  static values = {
    placement: {
      type: String,
      default: 'bottom-end'
    },
    open: {
      type: Boolean,
      default: false
    },
    autoPlacement: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 24
    },
    perLine: {
      type: Number,
      default: 9
    }
  };
  initialize() {
    this.onEmojiSelect = this.onEmojiSelect.bind(this);
    this.pickerLoaded = false;
    this.pickerLoadPromise = null;
    this.connected = false;
    super.initialize();
  }
  connect() {
    this.connected = true;
    usePopover(this);
    this.setupFloatingUI({
      trigger: this.buttonTarget,
      popover: this.popoverTarget,
      strategy: 'absolute'
    });
    super.connect();
  }
  disconnect() {
    this.connected = false;
    this.pickerLoadPromise = null;
    this.floatingUICleanup();
    super.disconnect();
  }
  onEmojiSelect(emoji) {
    this.dispatch('selected', {
      detail: emoji.native
    });
    this.hide();
  }
  onClickOutside(event) {
    if (this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
      this.openValue = false;
    }
  }
  async onPopoverOpened() {
    await this.loadPicker();
  }
  async loadPicker() {
    if (this.pickerLoaded) return;
    this.pickerLoadPromise ||= this.loadPickerDependencies();
    const {
      Picker,
      i18n
    } = await this.pickerLoadPromise;
    if (!this.connected || this.pickerLoaded) return;
    this.popoverTarget.appendChild(this.buildPicker(Picker, i18n));
    this.pickerLoaded = true;
  }
  async loadPickerDependencies() {
    const [pickerModule, i18nModule] = await Promise.all([import( /* webpackChunkName: "webchat-emoji" */'emoji-mart'), this.loadI18n()]);
    return {
      Picker: pickerModule.Picker,
      i18n: i18nModule.default || i18nModule
    };
  }
  loadI18n() {
    if (Hellotext.business.locale === 'es') {
      return import( /* webpackChunkName: "webchat-emoji-es" */'@emoji-mart/data/i18n/es.json');
    }
    return import( /* webpackChunkName: "webchat-emoji-en" */'@emoji-mart/data/i18n/en.json');
  }
  buildPicker(Picker, i18n) {
    return new Picker({
      onEmojiSelect: this.onEmojiSelect,
      theme: 'light',
      dynamicWidth: true,
      previewPosition: 'none',
      skinTonePosition: 'none',
      emojiSize: this.sizeValue,
      perLine: this.perLineValue,
      i18n
    });
  }
  get middlewares() {
    return [offset(5), shift({
      padding: 24
    }), autoPlacement({
      allowedPlacements: ['top', 'bottom']
    })];
  }
}