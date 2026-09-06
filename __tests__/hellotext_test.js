import Hellotext from "../src/hellotext";
import API from "../src/api";
import { Configuration } from "../src/core";
import { Push, Session, Webchat, WhatsAppWidget } from "../src/models";

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

const expireSession = () => {
  document.cookie = "hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

const defaultBusiness = (overrides = {}) => ({
  id: "xy76ks",
  country: { code: "US", prefix: "1" },
  features: {},
  locale: "en",
  style_url: "https://example.com/hellotext.css",
  webchat: null,
  whitelist: "disabled",
  ...overrides,
})

const businessResponse = business => ({
  ok: true,
  json: jest.fn().mockResolvedValue(business),
})

const mockBusinessFetch = (business = defaultBusiness()) => {
  API.businesses.get = jest.fn().mockResolvedValue(businessResponse(business))
}

mockBusinessFetch()

beforeEach(() => {
  mockBusinessFetch()
})

afterEach(() => {
  jest.clearAllMocks();
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove())
});

describe("when trying to call methods before initializing the class", () => {
  it("raises an error when Hellotext.track is called",  () => {
    expect(Hellotext.track("page.viewed")).rejects.toThrowError()
  });
})

describe("when initializing business metadata", () => {
  let loadWebchat
  let loadWhatsAppWidget

  beforeEach(() => {
    loadWebchat = jest.spyOn(Webchat, 'load').mockResolvedValue({})
    loadWhatsAppWidget = jest.spyOn(WhatsAppWidget, 'load').mockResolvedValue({})
  })

  afterEach(() => {
    loadWebchat.mockRestore()
    loadWhatsAppWidget.mockRestore()
    Configuration.webchat.behaviour = null
    Configuration.webchat.behaviourOverride = false
    Configuration.webchat.appearance = {}
    Configuration.webchat.whatsapp = {}
    Configuration.whatsapp.id = undefined
    Configuration.whatsapp.container = 'body'
    Configuration.whatsapp.placement = 'bottom-right'
    Configuration.whatsapp.appearance = {}
    Configuration.whatsapp.number = null
    Configuration.whatsapp.body = null
  })

  it("fetches public business data by default and stores it", async () => {
    const business = defaultBusiness({ id: "business-id", locale: "es" })
    mockBusinessFetch(business)

    await Hellotext.initialize("business-id")

    expect(API.businesses.get).toHaveBeenCalledWith("business-id")
    expect(Hellotext.business.data).toEqual(business)
  })

  it("loads the dashboard webchat when no explicit webchat config is passed", async () => {
    mockBusinessFetch(defaultBusiness({ webchat: { id: "dashboard-webchat" } }))

    await Hellotext.initialize("xy76ks")

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
  })

  it("uses the dashboard webchat id with explicit local options", async () => {
    mockBusinessFetch(defaultBusiness({ webchat: { id: "dashboard-webchat" } }))

    await Hellotext.initialize("xy76ks", {
      webchat: {
        container: "#webchat-container",
        placement: "top-left",
      },
    })

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
    expect(Configuration.webchat.container).toEqual("#webchat-container")
    expect(Configuration.webchat.placement).toEqual("top-left")
  })

  it("tracks explicit local webchat behaviour overrides", async () => {
    mockBusinessFetch(defaultBusiness({ webchat: { id: "dashboard-webchat" } }))

    await Hellotext.initialize("xy76ks", {
      webchat: {
        behaviour: {
          trigger: "onLoad",
          delaySeconds: 5,
          firstVisitOnly: true,
          oncePerSession: true,
        },
      },
    })

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
    expect(Configuration.webchat.hasBehaviourOverride).toBe(true)
    expect(Configuration.webchat.behaviour).toEqual({
      trigger: "onLoad",
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: true,
    })
  })

  it("does not treat dashboard webchat behaviour as an explicit local override", async () => {
    mockBusinessFetch(defaultBusiness({
      webchat: {
        id: "dashboard-webchat",
        behaviour: {
          trigger: "onLoad",
          delaySeconds: 10,
          firstVisitOnly: false,
          oncePerSession: true,
        },
      },
    }))

    await Hellotext.initialize("xy76ks")

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
    expect(Configuration.webchat.hasBehaviourOverride).toBe(false)
  })

  it("lets an explicit webchat id override the dashboard webchat id", async () => {
    mockBusinessFetch(defaultBusiness({ webchat: { id: "dashboard-webchat" } }))

    await Hellotext.initialize("xy76ks", {
      webchat: {
        id: "explicit-webchat",
      },
    })

    expect(loadWebchat).toHaveBeenCalledWith("explicit-webchat")
  })

  it("deep merges explicit local webchat appearance and WhatsApp overrides with dashboard defaults", async () => {
    mockBusinessFetch(defaultBusiness({
      webchat: {
        id: "dashboard-webchat",
        appearance: {
          header: {
            name: "Dashboard Support",
          },
          launcher: {
            iconUrl: "https://example.com/dashboard-icon.png",
          },
        },
        whatsapp: {
          number: "+15550000000",
          restrictToChannel: true,
        },
      },
    }))

    await Hellotext.initialize("xy76ks", {
      webchat: {
        appearance: {
          header: {
            name: "Local Support",
          },
        },
        whatsapp: {
          restrictToChannel: false,
        },
      },
    })

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
    expect(Configuration.webchat.appearance).toEqual({
      header: {
        name: "Local Support",
      },
      launcher: {
        iconUrl: "https://example.com/dashboard-icon.png",
      },
    })
    expect(Configuration.webchat.whatsapp).toEqual({
      number: "+15550000000",
      restrictToChannel: false,
    })
  })

  it("skips webchat loading when webchat is false", async () => {
    mockBusinessFetch(defaultBusiness({ webchat: { id: "dashboard-webchat" } }))

    await Hellotext.initialize("xy76ks", { webchat: false })

    expect(loadWebchat).not.toHaveBeenCalled()
  })

  it("loads the dashboard WhatsApp widget when no explicit WhatsApp config is passed", async () => {
    mockBusinessFetch(defaultBusiness({ whatsapp: { id: "dashboard-whatsapp-widget" } }))

    await Hellotext.initialize("xy76ks")

    expect(loadWhatsAppWidget).toHaveBeenCalledWith("dashboard-whatsapp-widget")
  })

  it("loads dashboard webchat and WhatsApp widget together", async () => {
    mockBusinessFetch(defaultBusiness({
      webchat: { id: "dashboard-webchat" },
      whatsapp: { id: "dashboard-whatsapp-widget" },
    }))

    await Hellotext.initialize("xy76ks")

    expect(loadWebchat).toHaveBeenCalledWith("dashboard-webchat")
    expect(loadWhatsAppWidget).toHaveBeenCalledWith("dashboard-whatsapp-widget")
  })

  it("deep merges explicit local WhatsApp widget options with dashboard defaults", async () => {
    mockBusinessFetch(defaultBusiness({
      whatsapp: {
        id: "dashboard-whatsapp-widget",
        placement: "bottom-left",
        appearance: {
          launcher: {
            iconUrl: "https://example.com/dashboard-whatsapp.png",
          },
        },
      },
    }))

    await Hellotext.initialize("xy76ks", {
      whatsappWidget: {
        container: "#whatsapp-container",
        appearance: {
          launcher: {
            iconUrl: "https://example.com/local-whatsapp.png",
          },
        },
      },
    })

    expect(loadWhatsAppWidget).toHaveBeenCalledWith("dashboard-whatsapp-widget")
    expect(Configuration.whatsapp.container).toEqual("#whatsapp-container")
    expect(Configuration.whatsapp.placement).toEqual("bottom-left")
    expect(Configuration.whatsapp.appearance).toEqual({
      launcher: {
        iconUrl: "https://example.com/local-whatsapp.png",
      },
    })
  })

  it("accepts whatsappWidget as the public WhatsApp widget config name", async () => {
    mockBusinessFetch(defaultBusiness({ whatsapp: { id: "dashboard-whatsapp-widget" } }))

    await Hellotext.initialize("xy76ks", {
      whatsappWidget: {
        number: "+15551234567",
        body: "Hello from install",
      },
    })

    expect(loadWhatsAppWidget).toHaveBeenCalledWith("dashboard-whatsapp-widget")
    expect(Configuration.whatsapp.number).toEqual("+15551234567")
    expect(Configuration.whatsapp.body).toEqual("Hello from install")
  })

  it("skips WhatsApp widget loading when whatsappWidget is false", async () => {
    mockBusinessFetch(defaultBusiness({ whatsapp: { id: "dashboard-whatsapp-widget" } }))

    await Hellotext.initialize("xy76ks", { whatsappWidget: false })

    expect(loadWhatsAppWidget).not.toHaveBeenCalled()
  })

  it("does not break initialization when business fetch rejects", async () => {
    API.businesses.get = jest.fn().mockRejectedValue(new Error("network error"))

    await expect(Hellotext.initialize("xy76ks")).resolves.toBeUndefined()

    expect(Hellotext.business.id).toEqual("xy76ks")
    expect(loadWebchat).not.toHaveBeenCalled()
  })

  it("loads an explicit webchat when business fetch rejects", async () => {
    API.businesses.get = jest.fn().mockRejectedValue(new Error("network error"))

    await Hellotext.initialize("xy76ks", {
      webchat: {
        id: "explicit-webchat",
      },
    })

    expect(loadWebchat).toHaveBeenCalledWith("explicit-webchat")
  })
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

      it("includes user params in the request body", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({received: "success"}),
          status: 200
        })

        await Hellotext.track("page.viewed", { user: { custom_field: "value" } })

        const fetchCall = global.fetch.mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)

        expect(requestBody.user).toHaveProperty('custom_field', 'value')
      });

      it("sends small track requests with keepalive", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({received: "success"}),
          status: 200
        })

        await Hellotext.track("page.viewed")

        expect(global.fetch.mock.calls[0][1]).toHaveProperty('keepalive', true)
      });

      it("does not set keepalive for oversized track requests", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({received: "success"}),
          status: 200
        })

        await Hellotext.track("page.viewed", { payload: "x".repeat(60000) })

        expect(global.fetch.mock.calls[0][1]).not.toHaveProperty('keepalive')
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
        content: 'ad1',
        observed_at: expect.any(String)
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
        medium: 'social',
        observed_at: expect.any(String)
      })

      // Verify page object contains all expected properties with updated values
      expect(requestBody).toHaveProperty('page.url', 'https://example.com/?utm_source=facebook&utm_medium=social')
      expect(requestBody).toHaveProperty('page.title', 'Social Media Page')
      expect(requestBody).toHaveProperty('page.path', '/social-page')
    });
  });

  describe("when identifying users", () => {
    const business_id = "xy76ks"

    beforeAll(() => {
      const windowMock = {
        location: { search: "?hello_session=test_session" },
      }

      jest.spyOn(global, 'window', 'get').mockImplementation(() => windowMock)
      Hellotext.initialize(business_id)
    })

    afterEach(() => {
      jest.clearAllMocks()
      // Clear identification cookies
      document.cookie = "hello_user_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "hello_user_source=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "hello_user_identification_hash=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
    })

    it("sends correct request body with user and options", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_123", {
        email: "user@example.com",
        phone: "+1234567890",
        name: "John Doe",
        source: "shopify"
      })

      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled()

      // Get the fetch call arguments
      const fetchCall = global.fetch.mock.calls[0]
      const requestOptions = fetchCall[1]
      const requestBody = JSON.parse(requestOptions.body)

      // Verify the request body includes all expected fields
      expect(requestBody).toHaveProperty('user_id', 'user_123')
      expect(requestBody).toHaveProperty('email', 'user@example.com')
      expect(requestBody).toHaveProperty('phone', '+1234567890')
      expect(requestBody).toHaveProperty('name', 'John Doe')
      expect(requestBody).toHaveProperty('source', 'shopify')
      expect(requestBody).toHaveProperty('session', 'test_session')
    })

    it("sets cookies when identification succeeds", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      const response = await Hellotext.identify("user_456", {
        email: "user@example.com",
        source: "woocommerce"
      })

      expect(response.succeeded).toEqual(true)
      expect(getCookieValue("hello_user_id")).toEqual("user_456")
      expect(getCookieValue("hello_user_source")).toEqual("woocommerce")
      expect(getCookieValue("hello_user_identification_hash")).toMatch(/^v1:/)
    })

    it("does not set cookies when identification fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({error: "invalid data"}),
        status: 422,
        ok: false
      })

      const response = await Hellotext.identify("user_789", {
        email: "invalid-email",
        source: "magento"
      })

      expect(response.failed).toEqual(true)
      expect(getCookieValue("hello_user_id")).toBeUndefined()
      expect(getCookieValue("hello_user_source")).toBeUndefined()
      expect(getCookieValue("hello_user_identification_hash")).toBeUndefined()
    })

    it("works with minimal options (only user id)", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_minimal")

      // Get the fetch call arguments
      const fetchCall = global.fetch.mock.calls[0]
      const requestOptions = fetchCall[1]
      const requestBody = JSON.parse(requestOptions.body)

      // Verify the request body includes only user and session
      expect(requestBody).toHaveProperty('user_id', 'user_minimal')
      expect(requestBody).toHaveProperty('session', 'test_session')
      expect(requestBody).not.toHaveProperty('email')
      expect(requestBody).not.toHaveProperty('phone')
      expect(requestBody).not.toHaveProperty('name')
    })

    it("handles undefined source in options", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_no_source", {
        email: "user@example.com"
      })

      expect(getCookieValue("hello_user_id")).toEqual("user_no_source")
      expect(getCookieValue("hello_user_source")).toBeUndefined()
    })

    it("sends session from Hellotext context in request", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_session_test", {
        email: "test@example.com"
      })

      // Get the fetch call arguments
      const fetchCall = global.fetch.mock.calls[0]
      const requestOptions = fetchCall[1]
      const requestBody = JSON.parse(requestOptions.body)

      // Verify the session is included from Hellotext.session
      expect(requestBody).toHaveProperty('session', 'test_session')
    })

    it("skips API call when identify payload is unchanged", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_existing", {
        shopify: {
          customer: {
            email: "existing@example.com",
            phone: "+1234567890",
          },
          domain: "example.myshopify.com",
        },
        tags: ["vip", "repeat"],
        source: "shopify",
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      const response = await Hellotext.identify("user_existing", {
        tags: ["vip", "repeat"],
        shopify: {
          domain: "example.myshopify.com",
          customer: {
            phone: "+1234567890",
            email: "existing@example.com",
          },
        },
        source: "shopify",
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(response.succeeded).toEqual(true)
    })

    it("does not skip API call when identify options change for the same user", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_existing", {
        email: "existing@example.com",
        source: "shopify"
      })

      await Hellotext.identify("user_existing", {
        email: "existing@example.com",
        phone: "+1234567890",
        source: "shopify"
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it("does not skip API call when array order changes", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_existing", {
        tags: ["vip", "repeat"],
        source: "shopify"
      })

      await Hellotext.identify("user_existing", {
        tags: ["repeat", "vip"],
        source: "shopify"
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it("does not skip API call when the session changes", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      await Hellotext.identify("user_existing", {
        email: "existing@example.com",
        source: "shopify"
      })

      Session.session = "new_session"
      global.fetch.mockClear()

      await Hellotext.identify("user_existing", {
        email: "existing@example.com",
        source: "shopify"
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toHaveProperty('session', 'new_session')
    })

    it("sends once for legacy cookies without a fingerprint and seeds it afterward", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({received: "success"}),
        status: 200,
        ok: true
      })

      document.cookie = "hello_user_id=user_existing"
      document.cookie = "hello_user_source=shopify"

      await Hellotext.identify("user_existing", {
        email: "existing@example.com",
        source: "shopify"
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(getCookieValue("hello_user_identification_hash")).toMatch(/^v1:/)
    })
  })
});

describe('when initializing Push', () => {
  let supported
  let initializePush
  let loadWebchat

  beforeEach(() => {
    supported = jest.spyOn(Push, 'supported', 'get').mockReturnValue(true)
    initializePush = jest.spyOn(Push.prototype, 'initialize').mockResolvedValue()
    loadWebchat = jest.spyOn(Webchat, 'load').mockResolvedValue({})
    mockBusinessFetch(defaultBusiness({ push: { public_key: 'business-public-key' } }))
  })

  afterEach(() => {
    Hellotext.push?.dispose()
    Hellotext.push = null
    Configuration.push.assign({})
    supported.mockRestore()
    initializePush.mockRestore()
    loadWebchat.mockRestore()
  })

  it('reads the business public key and configured worker URL', async () => {
    await Hellotext.initialize('xy76ks', { push: { serviceWorkerUrl: '/hellotext-sw.js' } })

    expect(Hellotext.push.publicKey).toBe('business-public-key')
    expect(Hellotext.push.serviceWorkerUrl).toBe('/hellotext-sw.js')
    expect(initializePush).toHaveBeenCalledTimes(1)
  })

  it('skips Push when the business has no public key', async () => {
    mockBusinessFetch(defaultBusiness())

    await Hellotext.initialize('xy76ks')

    expect(Hellotext.push).toBeNull()
    expect(initializePush).not.toHaveBeenCalled()
  })

  it('skips Push when the browser does not support it', async () => {
    supported.mockReturnValue(false)

    await Hellotext.initialize('xy76ks')

    expect(Hellotext.push).toBeNull()
    expect(initializePush).not.toHaveBeenCalled()
  })

  it('allows Push to be disabled explicitly', async () => {
    await Hellotext.initialize('xy76ks', { push: false })

    expect(Hellotext.push).toBeNull()
    expect(initializePush).not.toHaveBeenCalled()
  })

  it('finishes initialization and loads widgets while Push is still waiting for a worker', async () => {
    initializePush.mockReturnValue(new Promise(() => {}))
    mockBusinessFetch(defaultBusiness({
      push: { public_key: 'business-public-key' },
      webchat: { id: 'dashboard-webchat' },
    }))

    await Hellotext.initialize('xy76ks')

    expect(loadWebchat).toHaveBeenCalledWith('dashboard-webchat')
    expect(Hellotext.isInitialized).toBe(true)
  })

  it('cleans up the previous Push instance when initialized again', async () => {
    await Hellotext.initialize('xy76ks')
    const dispose = jest.spyOn(Hellotext.push, 'dispose')
    mockBusinessFetch(defaultBusiness())

    await Hellotext.initialize('xy76ks')

    expect(dispose).toHaveBeenCalledTimes(1)
    expect(Hellotext.push).toBeNull()
  })
})
