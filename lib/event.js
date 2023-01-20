export default class Event {
  static events = ["session-set"]

  static valid(name) {
    const eventName = name.split("hello:")[1]
    return name.startsWith("hello:") && Event.exists(eventName)
  }

  static invalid(name) {
    return !this.valid(name)
  }

  static exists(name) {
    return this.events.find((eventName) => eventName === name) !== undefined
  }
}
