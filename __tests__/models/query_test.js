/**
 * @jest-environment jsdom
 */

import { Query } from '../../src/models'

describe('get', () => {
  beforeEach(() => {
    const windowMock = {
      location: { search: "?hello_session=session&hello_preview=1" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
  })

  it('gets the value of a query parameter', () => {
    const query = new Query()

    expect(query.get("session")).toEqual("session")
    expect(query.get("preview")).toEqual("1")
  })
})

describe('has', () => {
  beforeEach(() => {
    const windowMock = {
      location: { search: "?hello_session=session" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
  })

  it('is true when the query parameter is present', () => {
    const query = new Query()
    expect(query.has("session")).toEqual(true)
  })

  it('is false when the query parameter is not present', () => {
    const query = new Query()
    expect(query.has("preview")).toEqual(false)
  })
})

describe('inPreviewMode', () => {
  it('is true when the preview query parameter is present', () => {
    const windowMock = {
      location: { search: "?hello_preview" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    expect(Query.inPreviewMode).toEqual(true)
  })

  it('is false when the preview query parameter is not present', () => {
    const windowMock = {
      location: { search: "" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    expect(Query.inPreviewMode).toEqual(false)
  })
})

describe('session', () => {
  it('gets the session from the query parameter when present in query', () => {
    const windowMock = {
      location: { search: "?hello_session=session" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    const query = new Query()
    expect(query.session).toEqual("session")
  })

  it('returns null when session not present in query (no longer falls back to cookie)', () => {
    const windowMock = {
      location: { search: "" },
    }

    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    document.cookie = "hello_session=session"

    const query = new Query()
    expect(query.session).toBeNull() // Query should only check query params, not cookies
  })
})

describe("#toHellotextParameter", () => {
  it("prefixes the argument with hello_", () => {
    const query = new Query()
    expect(query.toHellotextParam("preview")).toEqual("hello_preview")
  });
})
