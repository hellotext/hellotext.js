class Step {
  constructor(data) {
    this.data = data
  }

  get header() {
    return this.data.header
  }

  get inputs() {
    return this.data.inputs
  }

  get button() {
    return this.data.button
  }

  get footer() {
    return this.data.footer
  }

  get hasRequiredInputs() {
    return this.inputs.some(input => input.required)
  }
}

export { Step }
