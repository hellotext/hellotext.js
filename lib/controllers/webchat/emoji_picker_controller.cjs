"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dom = require("@floating-ui/dom");
var _stimulus = require("@hotwired/stimulus");
var _usePopover = require("../mixins/usePopover");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class _default extends _stimulus.Controller {
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
    (0, _usePopover.usePopover)(this);
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
    const [pickerModule, i18nModule] = await Promise.all([Promise.resolve().then(() => _interopRequireWildcard(require( /* webpackChunkName: "webchat-emoji" */'emoji-mart'))), this.loadI18n()]);
    return {
      Picker: pickerModule.Picker,
      i18n: i18nModule.default || i18nModule
    };
  }
  loadI18n() {
    if (Hellotext.business.locale === 'es') {
      return Promise.resolve().then(() => _interopRequireWildcard(require( /* webpackChunkName: "webchat-emoji-es" */'@emoji-mart/data/i18n/es.json')));
    }
    return Promise.resolve().then(() => _interopRequireWildcard(require( /* webpackChunkName: "webchat-emoji-en" */'@emoji-mart/data/i18n/en.json')));
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
    return [(0, _dom.offset)(5), (0, _dom.shift)({
      padding: 24
    }), (0, _dom.autoPlacement)({
      allowedPlacements: ['top', 'bottom']
    })];
  }
}
exports.default = _default;