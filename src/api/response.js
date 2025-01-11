/**
 * Response class
 * @class
 * @classdesc Represents a response from the API
 * @property {Boolean} succeeded
 * @property {Object} data
 */

class Response {
  #success

  constructor(success, response) {
    this.response = response
    this.#success = success
  }

  /**
   * Get the response data
   * @returns {*}
   */
  get data() {
    return this.response
  }

  /**
   * Parse the response as JSON
   * @returns {Promise<*>}
   */
  async json() {
    return await this.response.json()
  }

  /**
   * Has the request failed?
   * @returns {boolean}
   */
  get failed() {
    return this.#success === false
  }

  /**
   * Has the request succeeded?
   * @returns {boolean}
   */
  get succeeded() {
    return this.#success === true
  }
}

export { Response }
