export default class EventEmitter {
  constructor() {
    this.subscribers = {}
  }

  addSubscriber(eventName, callback) {
    this.subscribers = {
      ...this.subscribers,
      [eventName]: this.subscribers[eventName] ? [...this.subscribers[eventName], callback] : [callback]
    }
  }

  removeSubscriber(eventName, callback) {
    if(this.subscribers[eventName]) {
      this.subscribers[eventName] = this.subscribers[eventName].filter((cb) => cb !== callback)
    }
  }

  emit(eventName, data) {
    this.subscribers[`hello:${eventName}`].forEach((subscriber) => {
      subscriber(data)
    })
  }

  get listeners() {
    return Object.keys(this.subscribers).length !== 0
  }
}
