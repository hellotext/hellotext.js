export default class Response {
  #success

  constructor(success, response) {
    this.response = response
    this.#success = success
  }

  get data() {
    return this.response
  }

  get failed() {
    return this.#success === false
  }

  get succeeded() {
    return this.#success === true
  }
}
