export default class Event {
  static events = [
    'session-set',
    'forms:collected',
    'form:completed',
  ]

  static valid(name) {
    return Event.exists(name)
  }

  static invalid(name) {
    return !this.valid(name)
  }

  static exists(name) {
    return this.events.find((eventName) => eventName === name) !== undefined
  }
}
