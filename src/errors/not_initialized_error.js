class NotInitializedError extends Error {
  constructor() {
    super(
      'You need to initialize before tracking events. Call Hellotext.initialize and pass your public business id',
    )
    this.name = 'NotInitializedError'
  }
}

export { NotInitializedError }
