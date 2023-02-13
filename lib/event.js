"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Event {
  static valid(name) {
    return Event.exists(name);
  }
  static invalid(name) {
    return !this.valid(name);
  }
  static exists(name) {
    return this.events.find(eventName => eventName === name) !== undefined;
  }
}
exports.default = Event;
Event.events = ["session-set"];