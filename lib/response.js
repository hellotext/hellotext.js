export default class Response {
  #success
  #response

  constructor(success, response) {
    this.#success = success
    this.#response = response
  }

  data() {
    return this.#response
  }

  get failed() {
    return this.#success === false
  }

  get succeeded() {
    return this.#success === true
  }
}
