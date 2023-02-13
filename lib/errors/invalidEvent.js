"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidEvent = void 0;
class InvalidEvent extends Error {
  constructor(event) {
    super("".concat(event, " is not valid. Please provide a valid event name"));
    this.name = 'InvalidEvent';
  }
}
exports.InvalidEvent = InvalidEvent;