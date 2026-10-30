import { Application } from '@hotwired/stimulus'
import Hellotext from '../src/hellotext'
import API from '../src/api'
import { Business, Popup, Push } from '../src/models'
import AlertController from '../src/controllers/alert_controller'
import PopupController from '../src/controllers/popup_controller'

const html = `
  <article hidden data-controller="hellotext--alert"
    data-hellotext--alert-sections-value='[{"kind":"homepage","title":"Store updates","description":"New arrivals","primary_action":"Activate alerts","secondary_action":"Not now"}]'>
    <h4 data-hellotext--alert-target="title"></h4>
    <p data-hellotext--alert-target="description"></p>
    <button data-hellotext--alert-target="primaryAction"
      data-action="click->hellotext--alert#subscribe"></button>
    <button data-hellotext--alert-target="secondaryAction"
      data-action="click->hellotext--alert#hide"></button>
  </article>
`

const businessData = (overrides = {}) => ({
  id: 'alert-initialization-business',
  locale: 'en',
  style_url: 'https://example.com/hellotext.css',
  webchat: null,
  whatsapp: null,
  push: { public_key: 'business-public-key' },
  alert: { html },
  ...overrides,
})

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

describe('Smart Alert initialization', () => {
  let application
  let supported
  let stylesheetLoaded
  let notificationDescriptor
  let forms

  const hydrate = data => {
    API.businesses.get.mockResolvedValue({ ok: true, json: async () => data })
  }

  const initialize = async (id = 'alert-initialization-business', config = {}) => {
    await Hellotext.initialize(id, config)
    forms.push(Hellotext.forms)
  }

  beforeEach(async () => {
    document.body.innerHTML = ''
    localStorage.clear()
    forms = []
    notificationDescriptor = Object.getOwnPropertyDescriptor(window, 'Notification')
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { permission: 'default' },
    })
    supported = jest.spyOn(Push, 'supported', 'get').mockReturnValue(true)
    jest.spyOn(Push.prototype, 'initialize').mockImplementation(function () {
      this.ready = Promise.resolve()
      return this.ready
    })
    stylesheetLoaded = jest.spyOn(Business, 'waitForStylesheet').mockResolvedValue(true)
    jest.spyOn(API.businesses, 'get')
    jest.spyOn(API.pushAlerts, 'create').mockResolvedValue({ succeeded: true })
    hydrate(businessData())
    application = new Application(document.documentElement)
    application.register('hellotext--alert', AlertController)
    await application.start()
  })

  afterEach(() => {
    Hellotext.alert?.dispose()
    Hellotext.alert = null
    Hellotext.push?.dispose()
    Hellotext.push = null
    forms.forEach(collection => collection.mutationObserver?.disconnect())
    application.stop()
    document.body.innerHTML = ''
    document.querySelectorAll('link[data-hellotext-stylesheet]').forEach(link => link.remove())
    jest.restoreAllMocks()
    if (notificationDescriptor) {
      Object.defineProperty(window, 'Notification', notificationDescriptor)
    } else {
      delete window.Notification
    }
  })

  it('exposes a hidden alert that can show server-provided sections', async () => {
    await initialize()
    await Hellotext.alert.ready

    expect(document.querySelector('article').hidden).toBe(true)
    await expect(Hellotext.alert.show('homepage')).resolves.toBe(true)
    expect(document.querySelector('h4').textContent).toBe('Store updates')
    expect(document.querySelector('article').hidden).toBe(false)
  })

  it.each([
    ['the alert payload is missing', { alert: undefined }],
    ['the playbook is disabled', { alert: null }],
    ['the public key is missing', { push: {} }],
  ])('does not create an alert when %s', async (_reason, overrides) => {
    hydrate(businessData(overrides))

    await initialize()

    expect(Hellotext.alert).toBeNull()
    expect(document.querySelector('article')).toBeNull()
  })

  it('does not create an alert when Push is disabled in page configuration', async () => {
    await initialize('alert-initialization-business', { push: false })

    expect(Hellotext.alert).toBeNull()
    expect(Hellotext.push).toBeNull()
    expect(document.querySelector('article')).toBeNull()
  })

  it('does not create an alert when the browser lacks Push support', async () => {
    supported.mockReturnValue(false)

    await initialize()

    expect(Hellotext.alert).toBeNull()
    expect(document.querySelector('article')).toBeNull()
  })

  it('removes the old alert when reinitialized with Push disabled', async () => {
    await initialize()
    const previous = Hellotext.alert
    await previous.show('homepage')

    await initialize('alert-initialization-business', { push: false })

    expect(previous.disposed).toBe(true)
    expect(previous.push.disposed).toBe(true)
    expect(Hellotext.alert).toBeNull()
    expect(document.querySelector('article')).toBeNull()
  })

  it('prevents a pending old alert from mounting after another business initializes', async () => {
    const previousStylesheet = deferred()
    stylesheetLoaded.mockReturnValue(previousStylesheet.promise)
    await initialize('business-a')
    const previous = Hellotext.alert
    const previousShown = previous.show('homepage')

    stylesheetLoaded.mockResolvedValue(true)
    hydrate(businessData({ id: 'business-b', style_url: 'https://example.com/business-b.css' }))
    await initialize('business-b')
    await expect(Hellotext.alert.show('homepage')).resolves.toBe(true)
    previousStylesheet.resolve(true)

    await expect(previousShown).resolves.toBe(false)
    expect(previous.disposed).toBe(true)
    expect(document.querySelectorAll('article')).toHaveLength(1)
    expect(document.querySelector('article')).toBe(Hellotext.alert.element)
    expect(Hellotext.alert.business.id).toBe('business-b')
  })

  it('ignores an earlier hydration that finishes after Push was disabled for another business', async () => {
    const previousResponse = deferred()
    API.businesses.get.mockReturnValueOnce(previousResponse.promise)
    const previousInitialization = initialize('business-a')

    hydrate(businessData({ id: 'business-b' }))
    await initialize('business-b', { push: false })
    previousResponse.resolve({ ok: true, json: async () => businessData({ id: 'business-a' }) })
    await previousInitialization

    expect(Hellotext.business.id).toBe('business-b')
    expect(Hellotext.push).toBeNull()
    expect(Hellotext.alert).toBeNull()
    expect(document.querySelector('article')).toBeNull()
  })

  describe('with a popup', () => {
    const popupHTML = ({ bubble }) => `
      <article hidden data-controller="hellotext--popup"
        data-hellotext--popup-device-value="all"
        data-hellotext--popup-has-bubble-value="${bubble}"
        data-hellotext--popup-id-value="popup-id">
        <button hidden data-hellotext--popup-target="bubble"
          data-action="hellotext--popup#open"></button>
        <section hidden data-hellotext--popup-target="dialog">
          <button data-popup-close data-action="hellotext--popup#close"></button>
          <section data-hellotext--popup-target="step"></section>
          <section hidden data-hellotext--popup-target="completed"></section>
        </section>
      </article>
    `

    const withPopup = ({ bubble = false } = {}) => {
      hydrate(businessData({ popup: { id: 'popup-id' } }))
      jest.spyOn(API.popups, 'get').mockImplementation(async () => {
        return new DOMParser()
          .parseFromString(popupHTML({ bubble }), 'text/html')
          .querySelector('article')
      })
    }

    const flush = () => new Promise(resolve => setTimeout(resolve, 0))

    beforeEach(() => {
      application.register('hellotext--popup', PopupController)
    })

    afterEach(() => {
      Hellotext.popup?.unmount()
      Hellotext.popup = undefined
      document.cookie = `${Popup.finishedKey('popup-id')}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })

    it('waits for an open popup, and does not show on this page once the visitor closes it', async () => {
      withPopup()
      await initialize()
      const alert = Hellotext.alert
      let settled = false
      const shown = alert.show('homepage').then(result => {
        settled = true
        return result
      })
      await flush()

      expect(document.querySelector('[data-hellotext--popup-target="dialog"]').hidden).toBe(false)
      expect(settled).toBe(false)
      expect(alert.element.hidden).toBe(true)

      document.querySelector('[data-popup-close]').click()

      await expect(shown).resolves.toBe(false)
      expect(alert.disposed).toBe(true)
      expect(document.querySelector('[data-controller="hellotext--alert"]')).toBeNull()
      await expect(alert.show('homepage')).resolves.toBe(false)
    })

    it('does not show on this page once the visitor completes the popup', async () => {
      withPopup()
      await initialize()
      const shown = Hellotext.alert.show('homepage')
      await flush()

      const popup = document.querySelector('[data-controller="hellotext--popup"]')
      application.getControllerForElementAndIdentifier(popup, 'hellotext--popup').showCompleted()

      await expect(shown).resolves.toBe(false)
      expect(Hellotext.alert.disposed).toBe(true)
    })

    it('shows next to a popup showing only its bubble, and not after the visitor opens it', async () => {
      withPopup({ bubble: true })
      await initialize()

      await expect(Hellotext.alert.show('homepage')).resolves.toBe(true)

      document.querySelector('[data-hellotext--popup-target="bubble"]').click()

      expect(Hellotext.alert.element.hidden).toBe(true)
      expect(localStorage.length).toBe(0)

      document.querySelector('[data-popup-close]').click()

      expect(Hellotext.alert.disposed).toBe(true)
    })

    it('does not wait for a popup that does not load', async () => {
      withPopup()
      API.popups.get.mockResolvedValue(null)
      await initialize()

      await expect(Hellotext.alert.show('homepage')).resolves.toBe(true)
    })

    it('shows on a later page load, once this browser finished the popup', async () => {
      withPopup()
      Popup.markFinished('popup-id')
      await initialize()

      await expect(Hellotext.alert.show('homepage')).resolves.toBe(true)
      expect(API.popups.get).not.toHaveBeenCalled()
    })
  })
})
