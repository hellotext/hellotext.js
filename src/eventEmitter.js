import Event from "./event";
import { InvalidEvent } from "./errors/invalidEvent";

export default class EventEmitter {
  constructor() {
    this.subscribers = {}
  }

  addSubscriber(eventName, callback) {
    if(Event.invalid(eventName)) { throw new InvalidEvent(eventName) }

    this.subscribers = {
      ...this.subscribers,
      [eventName]: this.subscribers[eventName] ? [...this.subscribers[eventName], callback] : [callback]
    }
  }

  removeSubscriber(eventName, callback) {
    if(Event.invalid(eventName)) { throw new InvalidEvent(eventName) }

    if(this.subscribers[eventName]) {
      this.subscribers[eventName] = this.subscribers[eventName].filter((cb) => cb !== callback)
    }
  }

  emit(eventName, data) {
    this.subscribers[eventName]?.forEach((subscriber) => {
      subscriber(data)
    })
  }

  get listeners() {
    return Object.keys(this.subscribers).length !== 0
  }
}
