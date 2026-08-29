import Hellotext from "../src/hellotext";
import API from "../src/api";
import { Configuration } from "../src/core";
import { Business, Popup, Session, Webchat, WhatsAppWidget } from "../src/models";

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
  popup: null,
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

const deferred = () => {
  let resolve
  const promise = new Promise(result => {
    resolve = result
  })

  return { promise, resolve }
}

const waitFor = async predicate => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (predicate()) return
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  throw new Error('Timed out waiting for condition')
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
  let loadPopup
  let loadWebchat
  let loadWhatsAppWidget

  beforeEach(() => {
    loadPopup = jest.spyOn(Popup, 'load').mockResolvedValue({})
    loadWebchat = jest.spyOn(Webchat, 'load').mockResolvedValue({})
    loadWhatsAppWidget = jest.spyOn(WhatsAppWidget, 'load').mockResolvedValue({})
  })

  afterEach(() => {
    loadPopup.mockRestore()
    loadWebchat.mockRestore()
    loadWhatsAppWidget.mockRestore()
    Configuration.popup.id = undefined
    Configuration.popup.container = 'body'
    Configuration.popup.device = 'auto'
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
    Configuration.apiRoot = 'https://api.hellotext.com/v1'
    Configuration.actionCableUrl = 'wss://www.hellotext.com/cable'
    Hellotext.popup = undefined
    Hellotext.popups = []
    Hellotext.webchat = undefined
    Hellotext.whatsapp = undefined
    Hellotext.business = undefined
    Hellotext.page = undefined
    Hellotext.forms = undefined
    Hellotext.query = undefined
    Hellotext.initializationGeneration = 0
    Hellotext.initializationBaseline = undefined
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

  it("loads the dashboard popup when no explicit popup config is passed", async () => {
    mockBusinessFetch(defaultBusiness({ popup: { id: "dashboard-popup" } }))

    await Hellotext.initialize("xy76ks")

    expect(loadPopup).toHaveBeenCalledWith("dashboard-popup")
    expect(Hellotext.popups).toHaveLength(1)
    expect(Hellotext.popup).toEqual(Hellotext.popups[0])
  })

  it("loads every unique dashboard popup when automatic popups are configured", async () => {
    const firstPopup = { id: "first-popup" }
    const secondPopup = { id: "second-popup" }
    loadPopup.mockImplementation(async id => ({ id }))
    mockBusinessFetch(defaultBusiness({
      popup: { id: "legacy-popup" },
      popups: [firstPopup, secondPopup, firstPopup],
    }))

    await Hellotext.initialize("xy76ks")

    expect(loadPopup).toHaveBeenCalledTimes(2)
    expect(loadPopup).toHaveBeenNthCalledWith(1, "first-popup")
    expect(loadPopup).toHaveBeenNthCalledWith(2, "second-popup")
    expect(Hellotext.popups).toEqual([firstPopup, secondPopup])
    expect(Hellotext.popup).toEqual(firstPopup)
  })

  it('falls back to the legacy dashboard popup when the popup list has no valid ids', async () => {
    mockBusinessFetch(defaultBusiness({
      popup: { id: 'legacy-popup' },
      popups: [null, {}, { id: '' }],
    }))

    await Hellotext.initialize('xy76ks')

    expect(loadPopup).toHaveBeenCalledTimes(1)
    expect(loadPopup).toHaveBeenCalledWith('legacy-popup')
  })

  it("uses the dashboard popup id with explicit local options", async () => {
    mockBusinessFetch(defaultBusiness({ popup: { id: "dashboard-popup" } }))

    await Hellotext.initialize("xy76ks", {
      popup: {
        container: "#popup-container",
        device: "desktop",
      },
    })

    expect(loadPopup).toHaveBeenCalledWith("dashboard-popup")
    expect(Configuration.popup.container).toEqual("#popup-container")
    expect(Configuration.popup.device).toEqual("desktop")
  })

  it("applies local popup options to every dashboard popup", async () => {
    mockBusinessFetch(defaultBusiness({
      popups: [{ id: "first-popup" }, { id: "second-popup" }],
    }))

    await Hellotext.initialize("xy76ks", {
      popup: {
        container: "#popup-container",
        device: "desktop",
      },
    })

    expect(loadPopup).toHaveBeenCalledWith("first-popup")
    expect(loadPopup).toHaveBeenCalledWith("second-popup")
    expect(Configuration.popup.container).toEqual("#popup-container")
    expect(Configuration.popup.device).toEqual("desktop")
  })

  it("lets an explicit popup id override the dashboard popup id", async () => {
    mockBusinessFetch(defaultBusiness({
      popup: { id: "dashboard-popup" },
      popups: [{ id: "first-dashboard-popup" }, { id: "second-dashboard-popup" }],
    }))

    await Hellotext.initialize("xy76ks", {
      popup: {
        id: "explicit-popup",
      },
    })

    expect(loadPopup).toHaveBeenCalledWith("explicit-popup")
    expect(loadPopup).toHaveBeenCalledTimes(1)
  })

  it("skips popup loading when popup is false", async () => {
    mockBusinessFetch(defaultBusiness({ popup: { id: "dashboard-popup" } }))

    await Hellotext.initialize("xy76ks", { popup: false })

    expect(loadPopup).not.toHaveBeenCalled()
    expect(Hellotext.popups).toEqual([])
    expect(Hellotext.popup).toBeUndefined()
  })

  it("clears previously loaded popups before reinitializing", async () => {
    mockBusinessFetch(defaultBusiness({ popups: [{ id: "dashboard-popup" }] }))
    await Hellotext.initialize("xy76ks")

    mockBusinessFetch(defaultBusiness())
    await Hellotext.initialize("xy76ks")

    expect(Hellotext.popups).toEqual([])
    expect(Hellotext.popup).toBeUndefined()
  })

  it('unmounts previously loaded popups before reinitializing', async () => {
    const previousPopup = { unmount: jest.fn() }
    Hellotext.popups = [previousPopup]

    await Hellotext.initialize('xy76ks', { popup: false })

    expect(previousPopup.unmount).toHaveBeenCalledTimes(1)
    expect(Hellotext.popups).toEqual([])
  })

  it('keeps the existing popup mounted when reinitialization cannot hydrate the business', async () => {
    const existingPopup = { unmount: jest.fn() }
    Hellotext.popup = existingPopup
    Hellotext.popups = [existingPopup]
    API.businesses.get = jest.fn().mockRejectedValue(new Error('network error'))

    await Hellotext.initialize('xy76ks')

    expect(existingPopup.unmount).not.toHaveBeenCalled()
    expect(Hellotext.popup).toBe(existingPopup)
    expect(Hellotext.popups).toEqual([existingPopup])
  })

  it('keeps the existing surfaces and configuration after a failed reinitialization', async () => {
    const existingPopup = { unmount: jest.fn() }
    const existingWebchat = { unmount: jest.fn() }
    const existingWhatsApp = { unmount: jest.fn() }
    Hellotext.popup = existingPopup
    Hellotext.popups = [existingPopup]
    Hellotext.webchat = existingWebchat
    Hellotext.whatsapp = existingWhatsApp
    Configuration.apiRoot = 'https://current.example/v1'
    Configuration.actionCableUrl = 'wss://current.example/cable'
    API.businesses.get = jest.fn().mockRejectedValue(new Error('network error'))

    await Hellotext.initialize('xy76ks', { apiRoot: 'https://next.example/v1' })

    expect(existingPopup.unmount).not.toHaveBeenCalled()
    expect(existingWebchat.unmount).not.toHaveBeenCalled()
    expect(existingWhatsApp.unmount).not.toHaveBeenCalled()
    expect(Hellotext.popups).toEqual([existingPopup])
    expect(Hellotext.webchat).toBe(existingWebchat)
    expect(Hellotext.whatsapp).toBe(existingWhatsApp)
    expect(Configuration.apiRoot).toBe('https://current.example/v1')
    expect(Configuration.actionCableUrl).toBe('wss://current.example/cable')
  })

  it('restores the existing surfaces when loading a replacement surface fails', async () => {
    const existingPopup = { unmount: jest.fn() }
    const existingWebchat = { unmount: jest.fn() }
    const existingWhatsApp = { unmount: jest.fn() }
    Hellotext.popup = existingPopup
    Hellotext.popups = [existingPopup]
    Hellotext.webchat = existingWebchat
    Hellotext.whatsapp = existingWhatsApp
    mockBusinessFetch(defaultBusiness({ webchat: { id: 'replacement-webchat' } }))
    loadWebchat.mockRejectedValueOnce(new Error('network error'))

    await expect(Hellotext.initialize('xy76ks')).rejects.toThrow('network error')

    expect(existingPopup.unmount).not.toHaveBeenCalled()
    expect(existingWebchat.unmount).not.toHaveBeenCalled()
    expect(existingWhatsApp.unmount).not.toHaveBeenCalled()
    expect(Hellotext.popups).toEqual([existingPopup])
    expect(Hellotext.webchat).toBe(existingWebchat)
    expect(Hellotext.whatsapp).toBe(existingWhatsApp)
  })

  it.each([
    ['popup', { popup: false }, 'popup'],
    ['webchat', { webchat: false }, 'webchat'],
    ['WhatsApp widget', { whatsappWidget: false }, 'whatsapp'],
  ])('keeps unrelated surfaces mounted when a failed refresh explicitly disables %s', async (_, config, disabledSurface) => {
    const existingPopup = { unmount: jest.fn() }
    const existingWebchat = { unmount: jest.fn() }
    const existingWhatsApp = { unmount: jest.fn() }
    Hellotext.popup = existingPopup
    Hellotext.popups = [existingPopup]
    Hellotext.webchat = existingWebchat
    Hellotext.whatsapp = existingWhatsApp
    API.businesses.get = jest.fn().mockRejectedValue(new Error('network error'))

    await Hellotext.initialize('xy76ks', config)

    expect(existingPopup.unmount).toHaveBeenCalledTimes(disabledSurface === 'popup' ? 1 : 0)
    expect(existingWebchat.unmount).toHaveBeenCalledTimes(disabledSurface === 'webchat' ? 1 : 0)
    expect(existingWhatsApp.unmount).toHaveBeenCalledTimes(disabledSurface === 'whatsapp' ? 1 : 0)
    expect(Hellotext.popup).toBe(disabledSurface === 'popup' ? undefined : existingPopup)
    expect(Hellotext.webchat).toBe(disabledSurface === 'webchat' ? undefined : existingWebchat)
    expect(Hellotext.whatsapp).toBe(disabledSurface === 'whatsapp' ? undefined : existingWhatsApp)
  })

  it('restores a disabled stable surface when an explicit replacement fails after hydration', async () => {
    const existingPopup = { unmount: jest.fn() }
    const existingWebchat = { unmount: jest.fn() }
    Hellotext.popup = existingPopup
    Hellotext.popups = [existingPopup]
    Hellotext.webchat = existingWebchat
    API.businesses.get = jest.fn().mockResolvedValue({ ok: false })
    loadWebchat.mockRejectedValueOnce(new Error('network error'))

    await expect(
      Hellotext.initialize('xy76ks', {
        popup: false,
        webchat: { id: 'replacement-webchat' },
      }),
    ).rejects.toThrow('network error')

    expect(existingPopup.unmount).not.toHaveBeenCalled()
    expect(existingWebchat.unmount).not.toHaveBeenCalled()
    expect(Hellotext.popup).toBe(existingPopup)
    expect(Hellotext.webchat).toBe(existingWebchat)
  })

  it('keeps the latest initialization when an earlier popup load resolves late', async () => {
    const firstPopupLoad = deferred()
    const firstPopup = { id: 'first-popup', unmount: jest.fn() }
    const secondPopup = { id: 'second-popup', unmount: jest.fn() }
    loadPopup
      .mockImplementationOnce(() => firstPopupLoad.promise)
      .mockResolvedValueOnce(secondPopup)
    API.businesses.get = jest
      .fn()
      .mockResolvedValueOnce(businessResponse(defaultBusiness({ popups: [{ id: 'first-popup' }] })))
      .mockResolvedValueOnce(businessResponse(defaultBusiness({ popups: [{ id: 'second-popup' }] })))

    const firstInitialization = Hellotext.initialize('first-business')
    await waitFor(() => loadPopup.mock.calls.length === 1)
    const secondInitialization = Hellotext.initialize('second-business')
    await secondInitialization
    firstPopupLoad.resolve(firstPopup)
    await firstInitialization

    expect(firstPopup.unmount).toHaveBeenCalledTimes(1)
    expect(Hellotext.popups).toEqual([secondPopup])
    expect(Hellotext.popup).toBe(secondPopup)
  })

  it('unmounts a stale webchat after a newer initialization completes', async () => {
    const firstWebchatLoad = deferred()
    const firstWebchat = { unmount: jest.fn() }
    const secondWebchat = { unmount: jest.fn() }
    loadWebchat
      .mockImplementationOnce(() => firstWebchatLoad.promise)
      .mockResolvedValueOnce(secondWebchat)
    API.businesses.get = jest
      .fn()
      .mockResolvedValueOnce(
        businessResponse(defaultBusiness({ webchat: { id: 'first-webchat' } })),
      )
      .mockResolvedValueOnce(
        businessResponse(defaultBusiness({ webchat: { id: 'second-webchat' } })),
      )

    const firstInitialization = Hellotext.initialize('first-business')
    await waitFor(() => loadWebchat.mock.calls.length === 1)
    await Hellotext.initialize('second-business')
    firstWebchatLoad.resolve(firstWebchat)
    await firstInitialization

    expect(firstWebchat.unmount).toHaveBeenCalledTimes(1)
    expect(Hellotext.webchat).toBe(secondWebchat)
  })

  it('unmounts a stale WhatsApp widget after a newer initialization completes', async () => {
    const firstWhatsAppLoad = deferred()
    const firstWhatsApp = { unmount: jest.fn() }
    const secondWhatsApp = { unmount: jest.fn() }
    loadWhatsAppWidget
      .mockImplementationOnce(() => firstWhatsAppLoad.promise)
      .mockResolvedValueOnce(secondWhatsApp)
    API.businesses.get = jest
      .fn()
      .mockResolvedValueOnce(
        businessResponse(defaultBusiness({ whatsapp: { id: 'first-whatsapp' } })),
      )
      .mockResolvedValueOnce(
        businessResponse(defaultBusiness({ whatsapp: { id: 'second-whatsapp' } })),
      )

    const firstInitialization = Hellotext.initialize('first-business')
    await waitFor(() => loadWhatsAppWidget.mock.calls.length === 1)
    await Hellotext.initialize('second-business')
    firstWhatsAppLoad.resolve(firstWhatsApp)
    await firstInitialization

    expect(firstWhatsApp.unmount).toHaveBeenCalledTimes(1)
    expect(Hellotext.whatsapp).toBe(secondWhatsApp)
  })

  it('recomputes widget coexistence after replacing webchat and WhatsApp together', async () => {
    const nextWebchatElement = document.createElement('div')
    const nextWhatsAppElement = document.createElement('div')
    nextWebchatElement.className = 'hellotext--webchat'
    nextWhatsAppElement.className = 'hellotext--whatsapp-widget'
    document.body.append(nextWebchatElement, nextWhatsAppElement)

    const markCoexistingWidgets = () => {
      nextWebchatElement.classList.add('hellotext--with-whatsapp-widget')
      nextWhatsAppElement.classList.add('hellotext--with-webchat')
    }
    const existingWebchat = {
      unmount: jest.fn(() => nextWhatsAppElement.classList.remove('hellotext--with-webchat')),
    }
    const existingWhatsApp = {
      unmount: jest.fn(() =>
        nextWebchatElement.classList.remove('hellotext--with-whatsapp-widget'),
      ),
    }
    const nextWebchat = { unmount: jest.fn(), markCoexistingWidgets: jest.fn(markCoexistingWidgets) }
    const nextWhatsApp = { unmount: jest.fn(), markCoexistingWidgets: jest.fn(markCoexistingWidgets) }
    Hellotext.webchat = existingWebchat
    Hellotext.whatsapp = existingWhatsApp
    loadWebchat.mockResolvedValueOnce(nextWebchat)
    loadWhatsAppWidget.mockResolvedValueOnce(nextWhatsApp)
    mockBusinessFetch(
      defaultBusiness({
        webchat: { id: 'replacement-webchat' },
        whatsapp: { id: 'replacement-whatsapp' },
      }),
    )

    await Hellotext.initialize('xy76ks')

    expect(existingWebchat.unmount).toHaveBeenCalledTimes(1)
    expect(existingWhatsApp.unmount).toHaveBeenCalledTimes(1)
    expect(nextWebchat.markCoexistingWidgets).toHaveBeenCalledTimes(1)
    expect(nextWhatsApp.markCoexistingWidgets).toHaveBeenCalledTimes(1)
    expect(nextWebchatElement.classList.contains('hellotext--with-whatsapp-widget')).toBe(true)
    expect(nextWhatsAppElement.classList.contains('hellotext--with-webchat')).toBe(true)

    nextWebchatElement.remove()
    nextWhatsAppElement.remove()
  })

  it('restores the stable runtime when a newer initialization fails during an older refresh', async () => {
    const firstBusinessFetch = deferred()
    const stableBusiness = { id: 'stable-business' }
    const stablePopup = { unmount: jest.fn() }
    Hellotext.business = stableBusiness
    Hellotext.popup = stablePopup
    Hellotext.popups = [stablePopup]
    Configuration.apiRoot = 'https://stable.example/v1'
    Configuration.actionCableUrl = 'wss://stable.example/cable'
    API.businesses.get = jest
      .fn()
      .mockImplementationOnce(() => firstBusinessFetch.promise)
      .mockResolvedValueOnce({ ok: false })

    const firstInitialization = Hellotext.initialize('first-business', {
      apiRoot: 'https://first.example/v1',
    })
    await waitFor(() => API.businesses.get.mock.calls.length === 1)
    expect(Configuration.apiRoot).toBe('https://stable.example/v1')

    await Hellotext.initialize('second-business', { apiRoot: 'https://second.example/v1' })
    firstBusinessFetch.resolve(businessResponse(defaultBusiness({ id: 'first-business' })))
    await firstInitialization

    expect(stablePopup.unmount).not.toHaveBeenCalled()
    expect(Hellotext.business).toBe(stableBusiness)
    expect(Hellotext.popups).toEqual([stablePopup])
    expect(Configuration.apiRoot).toBe('https://stable.example/v1')
    expect(Configuration.actionCableUrl).toBe('wss://stable.example/cable')
  })

  it('does not leave a stylesheet from a stale business hydration', async () => {
    const firstBusinessFetch = deferred()
    API.businesses.get = jest
      .fn()
      .mockImplementationOnce(() => firstBusinessFetch.promise)
      .mockResolvedValueOnce(
        businessResponse(
          defaultBusiness({
            id: 'second-business',
            style_url: 'https://example.com/second.css',
          }),
        ),
      )

    const firstInitialization = Hellotext.initialize('first-business', {
      apiRoot: 'https://first.example/v1',
    })
    await waitFor(() => API.businesses.get.mock.calls.length === 1)
    await Hellotext.initialize('second-business', { apiRoot: 'https://second.example/v1' })
    firstBusinessFetch.resolve(
      businessResponse(
        defaultBusiness({
          id: 'first-business',
          style_url: 'https://example.com/first.css',
        }),
      ),
    )
    await firstInitialization

    expect(Array.from(document.querySelectorAll('link[data-hellotext-stylesheet]'))).toHaveLength(1)
    expect(Business.latestStylesheet.href).toContain('/second.css')
    expect(document.head.innerHTML).not.toContain('/first.css')
  })

  it('removes a staged stylesheet when loading a replacement surface fails', async () => {
    const stableBusiness = new Business('stable-business')
    stableBusiness.setData(defaultBusiness({ style_url: 'https://example.com/stable.css' }))
    const stablePopup = { unmount: jest.fn() }
    Hellotext.business = stableBusiness
    Hellotext.popup = stablePopup
    Hellotext.popups = [stablePopup]
    mockBusinessFetch(
      defaultBusiness({
        style_url: 'https://example.com/staged.css',
        webchat: { id: 'replacement-webchat' },
      }),
    )
    loadWebchat.mockRejectedValueOnce(new Error('network error'))

    await expect(Hellotext.initialize('xy76ks')).rejects.toThrow('network error')

    expect(Business.latestStylesheet.href).toContain('/stable.css')
    expect(document.head.innerHTML).not.toContain('/staged.css')
    expect(Hellotext.business).toBe(stableBusiness)
    expect(Hellotext.popup).toBe(stablePopup)
  })

  it('removes a stale stylesheet injected before a newer initialization commits', async () => {
    const firstWebchatLoad = deferred()
    const firstWebchat = { unmount: jest.fn() }
    const secondWebchat = { unmount: jest.fn() }
    loadWebchat
      .mockImplementationOnce(() => firstWebchatLoad.promise)
      .mockResolvedValueOnce(secondWebchat)
    API.businesses.get = jest
      .fn()
      .mockResolvedValueOnce(
        businessResponse(
          defaultBusiness({
            style_url: 'https://example.com/first.css',
            webchat: { id: 'first-webchat' },
          }),
        ),
      )
      .mockResolvedValueOnce(
        businessResponse(
          defaultBusiness({
            style_url: 'https://example.com/second.css',
            webchat: { id: 'second-webchat' },
          }),
        ),
      )

    const firstInitialization = Hellotext.initialize('first-business')
    await waitFor(() => loadWebchat.mock.calls.length === 1)
    expect(Business.latestStylesheet.href).toContain('/first.css')

    await Hellotext.initialize('second-business')
    expect(Business.latestStylesheet.href).toContain('/second.css')

    firstWebchatLoad.resolve(firstWebchat)
    await firstInitialization

    expect(firstWebchat.unmount).toHaveBeenCalledTimes(1)
    expect(Business.latestStylesheet.href).toContain('/second.css')
    expect(document.head.innerHTML).not.toContain('/first.css')
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
