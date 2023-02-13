"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotInitializedError = void 0;
class NotInitializedError extends Error {
  constructor() {
    super('You need to initialize before tracking events. Call Hellotext.initialize and pass your public business id');
    this.name = 'NotInitializedError';
  }
}
exports.NotInitializedError = NotInitializedError;