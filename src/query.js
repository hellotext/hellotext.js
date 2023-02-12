export default class Query {
  constructor(urlQueries) {
    this.urlSearchParams = new URLSearchParams(urlQueries)
  }

  get(param) {
    return this.urlSearchParams.get(
      this.toHellotextParam(param)
    )
  }

  has(param) {
    return this.urlSearchParams.has(
      this.toHellotextParam(param)
    )
  }

  toHellotextParam(param) {
    return `hello_${param}`
  }
}
