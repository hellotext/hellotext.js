import API from '../../src/api/sessions'

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue({ id: 1 }) })
})

describe('create', () => {
  it('creates a session object', async () => {
    const response = await new API('M01az53K').create()
    expect(response.id).toEqual(1)
  })
})
