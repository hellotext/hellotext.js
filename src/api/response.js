export default class Response {
  #success
  #response

  constructor(success, response) {
    this.#success = success
    this.#response = response
  }

  get data() {
    return this.#response
  }

  get failed() {
    return this.#success === false
  }

  get succeeded() {
    return this.#success === true
  }
}
