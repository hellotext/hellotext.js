/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the webchat.
 */

/**
 * @enum {Placement}
 */
const placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

/**
 * @typedef {'absolute' | 'fixed'} Strategy
 * @description Valid strategies for the webchat.
 */

/**
 * @enum {Strategy}
 */

const strategies = {
  ABSOLUTE: 'absolute',
  FIXED: 'fixed'
};

/**
 * @typedef {'modal' | 'popover'} Mode
 */

/**
 * @enum {Mode}
 */
const modes = {
  MODAL: 'modal',
  POPOVER: 'popover'
};

/**
 * @typedef {Object} Style
 * @property {string} primaryColor - The primary webchat color (e.g., a hex code or color name).
 * @property {string} secondaryColor - The secondary webchat color or style (e.g., a hex code or color name).
 * @property {string} typography - The typography style (e.g., font family).
 */

/**
 * @typedef {Object} Appearance
 * @property {Object} [header] - Header appearance overrides.
 * @property {string} [header.name] - Business name shown in the webchat header.
 * @property {Object} [launcher] - Launcher appearance overrides.
 * @property {string} [launcher.iconUrl] - Image URL used for the launcher icon.
 */

/**
 * @typedef {Object} WhatsApp
 * @property {string} [number] - WhatsApp number used by the handoff configuration.
 * @property {boolean} [restrictToChannel] - Whether handoff should be restricted to the configured channel.
 */

/**
 * @class Webchat
 * @classdesc
 * Configuration for webchat
 * @property {String} id - the id of the webchat.
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to "bottom-right".
 * @property {Mode} mode - how the webchat behaves while open, defaults to 'popover'.
 * @property {Object} behaviour - runtime opening behaviour for the webchat.
 * @property {Style} style - the style of the webchat.
 * @property {Appearance} appearance - appearance overrides.
 * @property {WhatsApp} whatsapp - WhatsApp handoff overrides.
 * @property {Strategy} strategy - the strategy used to position the webchat. Defaults to 'absolute'
 */

class Webchat {
  static _id;
  static _container = 'body';
  static _placement = 'bottom-right';
  static _style = {};
  static _appearance = {};
  static _whatsapp = {};
  static _mode = modes.POPOVER;
  static _behaviour = null;
  static _hasBehaviourOverride = false;
  static _strategy = null;
  static set container(value) {
    this._container = value;
  }
  static get container() {
    return this._container;
  }
  static set placement(value) {
    if (!Object.values(placements).includes(value)) {
      throw new Error(`Invalid placement value: ${value}`);
    }
    this._placement = value;
  }
  static get placement() {
    return this._placement;
  }
  static set id(value) {
    this._id = value;
  }
  static get id() {
    return this._id;
  }
  static get isSet() {
    return !!this._id;
  }
  static get style() {
    return this._style;
  }
  static set style(value) {
    if (typeof value !== 'object') {
      throw new Error('Style must be an object');
    }
    Object.entries(value).forEach(([key, value]) => {
      if (!['primaryColor', 'secondaryColor', 'typography'].includes(key)) {
        throw new Error(`Invalid style property: ${key}`);
      }
      if (key === 'typography') {
        return;
      }
      if (!this.isHexOrRgba(value)) {
        throw new Error(`Invalid color value: ${value} for ${key}. Colors must be hex or rgb/a.`);
      }
    });
    this._style = value;
  }
  static get appearance() {
    return this._appearance;
  }
  static set appearance(value) {
    if (!this.isPlainObject(value)) {
      throw new Error('Appearance must be an object');
    }
    Object.entries(value).forEach(([key, nestedValue]) => {
      if (!['header', 'launcher'].includes(key)) {
        throw new Error(`Invalid appearance property: ${key}`);
      }
      if (!this.isPlainObject(nestedValue)) {
        throw new Error(`Appearance ${key} must be an object`);
      }
      Object.entries(nestedValue).forEach(([nestedKey, propertyValue]) => {
        if (key === 'header' && nestedKey !== 'name') {
          throw new Error(`Invalid appearance header property: ${nestedKey}`);
        }
        if (key === 'launcher' && nestedKey !== 'iconUrl') {
          throw new Error(`Invalid appearance launcher property: ${nestedKey}`);
        }
        if (propertyValue == null) {
          return;
        }
        if (typeof propertyValue !== 'string') {
          throw new Error(`Invalid appearance ${key}.${nestedKey} value: ${propertyValue}`);
        }
      });
    });
    this._appearance = value;
  }
  static get whatsapp() {
    return this._whatsapp;
  }
  static set whatsapp(value) {
    if (!this.isPlainObject(value)) {
      throw new Error('WhatsApp must be an object');
    }
    Object.entries(value).forEach(([key, nestedValue]) => {
      if (!['number', 'restrictToChannel'].includes(key)) {
        throw new Error(`Invalid WhatsApp property: ${key}`);
      }
      if (nestedValue == null) {
        return;
      }
      if (key === 'number' && typeof nestedValue !== 'string') {
        throw new Error(`Invalid WhatsApp number value: ${nestedValue}`);
      }
      if (key === 'restrictToChannel' && typeof nestedValue !== 'boolean') {
        throw new Error(`Invalid WhatsApp restrictToChannel value: ${nestedValue}`);
      }
    });
    this._whatsapp = value;
  }
  static get mode() {
    return this._mode;
  }
  static set mode(value) {
    if (!Object.values(modes).includes(value)) {
      throw new Error(`Invalid mode value: ${value}`);
    }
    this._mode = value;
  }
  static get behaviour() {
    return this._behaviour;
  }
  static set behaviour(value) {
    if (value == null) {
      this._behaviour = value;
      return;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`Invalid behaviour value: ${value}`);
    }
    this._behaviour = value;
  }
  static get hasBehaviourOverride() {
    return this._hasBehaviourOverride;
  }
  static set behaviourOverride(value) {
    this._hasBehaviourOverride = !!value;
  }
  static get strategy() {
    if (this._strategy) {
      return this._strategy;
    }
    return this.container == 'body' ? strategies.FIXED : strategies.ABSOLUTE;
  }
  static set strategy(value) {
    if (value && !Object.values(strategies).includes(value)) {
      throw new Error(`Invalid strategy value: ${value}`);
    }
    this._strategy = value;
  }
  static assign(props) {
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value;
      });
    }
    return this;
  }
  static isHexOrRgba(value) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || /^rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},?\s*(0|1|0?\.\d+)?\s*\)$/.test(value);
  }
  static isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
export { modes, Webchat };