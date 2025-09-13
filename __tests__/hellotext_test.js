import Hellotext from "../src/hellotext";
import { Business } from "../src/models";

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

const expireSession = () => {
  document.cookie = "hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

beforeEach(() => {
  Business.prototype.fetchPublicData = jest.fn().mockResolvedValue({ whitelist: 'disabled' })
})

afterEach(() => {
  jest.clearAllMocks();
});

describe("when trying to call methods before initializing the class", () => {
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

      it("includes UTM parameters in the request body", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({received: "success"}),
          status: 200
        })

        await Hellotext.track("page.viewed", { test_param: "test_value" })

        // Check that fetch was called
        expect(global.fetch).toHaveBeenCalled()

        // Get the fetch call arguments
        const fetchCall = global.fetch.mock.calls[0]
        const requestOptions = fetchCall[1]
        const requestBody = JSON.parse(requestOptions.body)

        // Verify that utm_params is included in the request body
        expect(requestBody).toHaveProperty('utm_params')

        // Since we're using mock window.location.search = "?hello_session=session",
        // there are no UTM params, so it should be an empty object
        expect(requestBody.utm_params).toEqual({})

        // Verify other expected fields are present
        expect(requestBody).toHaveProperty('action', 'page.viewed')
        expect(requestBody).toHaveProperty('session', 'session')
        expect(requestBody).toHaveProperty('test_param', 'test_value')
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

    it("does not mint a new session token when autogenerateSession is set to false", () => {
      Hellotext.initialize(business_id, { autogenerateSession: false })

      setTimeout(() => {
        expect(getCookieValue("hello_session")).toEqual(undefined)
        expect(Hellotext.session).toEqual(undefined)
      }, 1000)
    })
  });

  describe("when UTM parameters are present in the URL", () => {
    const business_id = "xy76ks"

    beforeAll(() => {
      const windowMock = {
        location: {
          search: "?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_term=shoes&utm_content=ad1",
          href: "https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_term=shoes&utm_content=ad1",
          pathname: "/"
        },
      }

      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)

      // Mock document.title
      Object.defineProperty(document, 'title', {
        value: 'Test Page Title',
        writable: true
      })

      Hellotext.initialize(business_id)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it("includes UTM parameters from URL in track request body", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200
      })

      await Hellotext.track("page.viewed", { custom_param: "custom_value" })

      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled()

      // Get the fetch call arguments
      const fetchCall = global.fetch.mock.calls[0]
      const requestOptions = fetchCall[1]
      const requestBody = JSON.parse(requestOptions.body)

      // Verify that utm_params contains the expected UTM data
      expect(requestBody).toHaveProperty('utm_params')
      expect(requestBody.utm_params).toEqual({
        source: 'google',
        medium: 'cpc',
        campaign: 'summer_sale',
        term: 'shoes',
        content: 'ad1'
      })

      // Verify other expected fields are present
      expect(requestBody).toHaveProperty('action', 'page.viewed')
      expect(requestBody).toHaveProperty('custom_param', 'custom_value')

      // Verify page object contains all expected properties
      expect(requestBody).toHaveProperty('page.url', 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_term=shoes&utm_content=ad1')
      expect(requestBody).toHaveProperty('page.title', 'Test Page Title')
      expect(requestBody).toHaveProperty('page.path', '/')
    });

    it("includes partial UTM parameters when only some are present", async () => {
      const windowMockPartial = {
        location: {
          search: "?utm_source=facebook&utm_medium=social",
          href: "https://example.com/?utm_source=facebook&utm_medium=social",
          pathname: "/social-page"
        },
      }

      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMockPartial)

      // Update document title for this test
      document.title = 'Social Media Page'

      // Reinitialize with partial UTM params
      await Hellotext.initialize(business_id)

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200
      })

      await Hellotext.track("button.clicked")

      // Get the fetch call arguments
      const fetchCall = global.fetch.mock.calls[0]
      const requestOptions = fetchCall[1]
      const requestBody = JSON.parse(requestOptions.body)

      // Verify that utm_params contains only the present UTM parameters
      expect(requestBody.utm_params).toEqual({
        source: 'facebook',
        medium: 'social'
      })

      // Verify page object contains all expected properties with updated values
      expect(requestBody).toHaveProperty('page.url', 'https://example.com/?utm_source=facebook&utm_medium=social')
      expect(requestBody).toHaveProperty('page.title', 'Social Media Page')
      expect(requestBody).toHaveProperty('page.path', '/social-page')
    });
  });
});
