export default class Event {
  static events = ["session-set"]

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
