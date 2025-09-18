import { InvalidEvent } from '../errors'

export default class Event {
  static events = [
    'session-set',
    'utm-set',
    'forms:collected',
    'form:completed',
    'webchat:mounted',
    'webchat:opened',
    'webchat:closed',
    'webchat:message:sent',
    'webchat:message:received',
  ]

  static valid(name) {
    return Event.exists(name)
  }

  static invalid(name) {
    return !this.valid(name)
  }

  static exists(name) {
    return this.events.find(eventName => eventName === name) !== undefined
  }

  constructor() {
    this.subscribers = {}
  }

  addSubscriber(eventName, callback) {
    if (Event.invalid(eventName)) {
      throw new InvalidEvent(eventName)
    }

    this.subscribers = {
      ...this.subscribers,
      [eventName]: this.subscribers[eventName]
        ? [...this.subscribers[eventName], callback]
        : [callback],
    }
  }

  removeSubscriber(eventName, callback) {
    if (Event.invalid(eventName)) {
      throw new InvalidEvent(eventName)
    }

    if (this.subscribers[eventName]) {
      this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback)
    }
  }

  dispatch(eventName, data) {
    this.subscribers[eventName]?.forEach(subscriber => {
      subscriber(data)
    })
  }

  get listeners() {
    return Object.keys(this.subscribers).length !== 0
  }
}
