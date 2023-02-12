/**
 * @jest-environment jsdom
 */

import Hellotext from "../lib/hellotext";

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

const expireSession = () => {
  document.cookie = "hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("when trying to call methods before initializing the class", () => {
  it("raises an error when Hellotext.session is called",  () => {
    expect(() => Hellotext.session).toThrowError()
  });

  it("raises an error when Hellotext.track is called",  () => {
    expect(Hellotext.track("page.viewed")).rejects.toThrowError()
  });
})

describe("when the class is initialized successfully", () => {
  const business_id = "xy76ks"

  describe("when hello_session is present in the query params", () => {
    beforeAll(() => {
      const windowMock = {
        location: { search: "?hello_session=session" },
      }

      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
      Hellotext.initialize(business_id)
    })

    it("sets the cookie as value of the query parameter", () => {
      expect(getCookieValue("hello_session")).toEqual("session")
    });

    it("returns the value when Hellotext.session is called", () => {
      expect(Hellotext.session).toEqual("session")
    });

    describe("when tracking events", () => {
      it("success attribute is true when response from the server is received successfully", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({received: "success"}),
          status: 200
        })

        const response = await Hellotext.track("page.viewed")

        expect(response.succeeded).toEqual(true)
      });

      it("success attribute is false when response from the server is rejected", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({}),
          status: 422
        })

        const response = await Hellotext.track("page.viewed")

        expect(response.failed).toEqual(true)
      });
    });
  });

  describe("when hello_session is not present in the query params", () => {
    const business_id = "xy76ks"

    beforeAll(() => {
      const windowMock = {location: { search: "" },}
      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
    })

    it("mints a new session token and sets the cookie as well", () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({id: "generated_token"}),
        status: 200
      })

      Hellotext.initialize(business_id)

      setTimeout(() => {
        expect(getCookieValue("hello_session")).toEqual("generated_token")
        expect(Hellotext.session).toEqual("generated_token")
      }, 1000)
    });
  });
});

describe(".isInitialized", () => {
  describe("when session is set", () => {
    beforeAll(() => {
      const windowMock = {location: { search: "?hello_session=session" }}
      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
      Hellotext.initialize("123")
    })

    it("is true", () => {
      expect(Hellotext.isInitialized).toEqual(true)
    });
  });
});

describe(".on", () => {
  const business_id = "xy76ks"

  beforeAll(() => {
    const windowMock = {location: { search: "" },}
    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
  })

  it("registers a callback that is called when the session is set", function () {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({id: "generated_token"}),
      status: 200
    })

    const callback = jest.fn()

    Hellotext.on("session-set", callback)
    Hellotext.initialize(business_id)

    expect(callback).toHaveBeenCalledTimes(1)
  });

  it("throws an error when event is invalid", () => {
    expect(
      () => Hellotext.on("undefined-event", () => {})
    ).toThrowError()
  });
});

describe("when session is stored in the cookie", function () {
  beforeAll(() => {
    document.cookie = `hello_session=12345`
    Hellotext.initialize(123)
  })

  it("Assigns session from cookie", function () {
    expect(Hellotext.session).toEqual("12345")
  });
});


describe(".removeEventListener", () => {
  beforeAll(() => {
    const windowMock = {location: { search: "?hello_session=123" },}
    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    Hellotext.initialize(123)
  })

  it("throws an error when event is invalid", () => {
    expect(
      () => Hellotext.removeEventListener("undefined-event", () => {})
    ).toThrowError()
  });

  it("removes the callback from the subscribers and will not be notified again", () => {
    const callback = jest.fn()

    Hellotext.on("session-set", callback)
    Hellotext.removeEventListener("session-set", callback)

    expect(callback).toHaveBeenCalledTimes(0)
  });
})

describe("when hello_preview query parameter is present", () => {
  beforeAll(() => {
    const windowMock = {location: { search: "?hello_preview" },}
    jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

    expireSession()
    Hellotext.initialize(123)
  })

  describe(".initialize", () => {
    it("does not attempt to set the session", () => {
      expect(getCookieValue("hello_session")).toEqual(undefined)
    });
  })

  describe(".track", () => {
    it("returns a success response without interacting with the API", async () => {
      const response = await Hellotext.track("page.viewed")
      expect(response.succeeded).toEqual(true)
    });
  })
})
