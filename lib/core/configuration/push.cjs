"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Push = void 0;
class Push {
  static serviceWorkerUrl = null;
  static channelId = null;
  static assign(props) {
    this.serviceWorkerUrl = props?.serviceWorkerUrl || null;
    this.channelId = props?.channelId || null;
    return this;
  }
}
exports.Push = Push;