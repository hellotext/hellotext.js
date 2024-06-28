class InvalidEvent extends Error {
  constructor(event) {
    super(`${event} is not valid. Please provide a valid event name`)
    this.name = 'InvalidEvent'
  }
}

export { InvalidEvent }
