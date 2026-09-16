/**
 * @jest-environment jsdom
 */

import PopupController from '../../src/controllers/popup_controller'
import Hellotext from '../../src/hellotext'

describe('PopupController display rules', () => {
  let controller

  const buildController = ({ lanes = [], hasBubble = false } = {}) => {
    const element = document.createElement('article')
    const dialog = document.createElement('section')
    const step = document.createElement('section')

    step.dataset.stepId = 'step-one'
    dialog.append(step)
    element.append(dialog)
    document.body.appendChild(element)

    controller = new PopupController()
    Object.defineProperty(controller, 'element', { value: element, configurable: true })

    controller.dialogTarget = dialog
    controller.stepTargets = [step]
    controller.inputTargets = []
    controller.submitButtonTargets = []
    Object.defineProperties(controller, {
      hasResendButtonTarget: { value: false, configurable: true },
      hasChangeDestinationButtonTarget: { value: false, configurable: true },
      hasGlobalErrorTarget: { value: false, configurable: true },
    })
    controller.hasBubbleTarget = hasBubble
    controller.hasBubbleValue = hasBubble
    controller.captureValue = {}
    controller.deviceValue = 'all'
    controller.idValue = 'popup-id'
    // Before initialize(): that is where the controller builds its display rules.
    controller.rulesValue = { lanes }
    controller.initialize()

    return { element, dialog }
  }

  const lane = (...conditions) => conditions.map(([field, operator, values]) => ({
    field,
    operator,
    values: [].concat(values),
  }))

  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    window.localStorage.clear()
    window.sessionStorage.clear()
    Hellotext.activities.clear()
    jest.spyOn(Hellotext.eventEmitter, 'dispatch').mockImplementation(() => {})
  })

  afterEach(() => {
    controller?.disconnect()
    controller = undefined
    document.body.innerHTML = ''
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('displays a popup with no rules', () => {
    const { element } = buildController()

    controller.connect()

    expect(element.hidden).toBe(false)
  })

  it('displays when the page matches a lane', () => {
    const { element } = buildController({ lanes: [lane(['page.path', 'is', '/'])] })

    controller.connect()

    expect(element.hidden).toBe(false)
  })

  it('stays hidden when the page does not match', () => {
    const { element } = buildController({ lanes: [lane(['page.path', 'contains', '/sale'])] })

    controller.connect()

    expect(element.hidden).toBe(true)
  })

  // The server strips visitor conditions once it has decided them, so a surviving lane can
  // arrive empty and the popup should display.
  it('displays when the server already satisfied every condition in a lane', () => {
    const { element } = buildController({ lanes: [[]] })

    controller.connect()

    expect(element.hidden).toBe(false)
  })

  describe('measurements', () => {
    it('keeps re-checking until the visitor scrolls far enough', () => {
      const { element } = buildController({ lanes: [lane(['session.scroll_depth', 'at_least', 50])] })

      jest.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(4000)
      window.innerWidth = 1200
      Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })

      controller.connect()
      expect(element.hidden).toBe(true)

      window.scrollY = 1100
      window.dispatchEvent(new Event('scroll'))

      expect(element.hidden).toBe(false)
    })

    it('displays once enough time has passed on the page', () => {
      jest.useFakeTimers()
      const { element } = buildController({ lanes: [lane(['session.time_on_page', 'at_least', 5])] })

      controller.connect()
      expect(element.hidden).toBe(true)

      jest.advanceTimersByTime(6000)

      expect(element.hidden).toBe(false)
    })

    // A popup without a measured rule is decided once, so it must not install a scroll
    // listener or an interval that would run for the life of the page.
    it('does not watch measurements when no rule needs one', () => {
      const listener = jest.spyOn(window, 'addEventListener')
      buildController({ lanes: [lane(['page.path', 'contains', '/sale'])] })

      controller.connect()

      expect(listener).not.toHaveBeenCalledWith('scroll', expect.anything(), expect.anything())
      expect(controller.measurementTimer).toBeUndefined()
    })

    // "Shown" means actually displayed. Once it displays, the watchers stop so the popup is
    // never evaluated — or counted — a second time.
    it('stops watching once the popup displays', () => {
      jest.useFakeTimers()
      buildController({ lanes: [lane(['session.time_on_page', 'at_least', 1])] })

      controller.connect()
      jest.advanceTimersByTime(2000)

      expect(controller.displayed).toBe(true)
      expect(controller.measurementTimer).toBeUndefined()
    })
  })

  describe('current-visit activity', () => {
    it('re-evaluates when a matching tracked activity occurs', () => {
      Hellotext.eventEmitter.dispatch.mockRestore()
      const { element } = buildController({
        lanes: [lane(['activity.product_viewed', 'occurred', []])],
      })

      controller.connect()
      expect(element.hidden).toBe(true)

      Hellotext.recordActivity('product.viewed')

      expect(element.hidden).toBe(false)
      expect(controller.onActivity).toBeUndefined()
    })

    it('does not match an unrelated activity from the same visit', () => {
      const { element } = buildController({
        lanes: [lane(['activity.cart_added', 'occurred', []])],
      })

      Hellotext.activities.add('activity.product_viewed')
      controller.connect()

      expect(element.hidden).toBe(true)
    })
  })

  // The campaign a visit arrives with has to survive the rest of that visit: a popup that
  // waits for scroll or time is almost never decided on the landing page itself.
  describe('campaign this visit arrived with', () => {
    const utmRules = (...conditions) => [lane(...conditions)]

    beforeEach(() => {
      Hellotext.visitCampaign = {}
      Hellotext.visitBusinessId = 'business-1'
    })

    it('keeps the landing campaign after the site navigates past it', () => {
      window.history.replaceState({}, '', '/?utm_campaign=spring')
      Hellotext.initializeVisitSignals('business-1')
      window.history.replaceState({}, '', '/products/42')

      const { element } = buildController({
        lanes: utmRules(['session.utm_campaign', 'is', 'spring']),
      })
      controller.connect()

      expect(element.hidden).toBe(false)
    })

    // `hello_utm` only ever holds a complete source and medium pair, and it outlives the
    // visit by years. A campaign-only landing must not fall back onto it.
    it('never falls back to the campaign persisted for the browser', () => {
      Hellotext.page = { utmParams: { source: 'google', medium: 'cpc' } }
      window.history.replaceState({}, '', '/?utm_campaign=spring')
      Hellotext.initializeVisitSignals('business-1')
      window.history.replaceState({}, '', '/products/42')

      const { element } = buildController({
        lanes: utmRules(['session.utm_source', 'is', 'google']),
      })
      controller.connect()

      expect(element.hidden).toBe(true)
      expect(controller.pageContext().utm).toEqual({ campaign: 'spring' })
      Hellotext.page = undefined
    })

    it('replaces the remembered campaign when a later URL carries its own', () => {
      window.history.replaceState({}, '', '/?utm_source=instagram&utm_medium=social')
      Hellotext.initializeVisitSignals('business-1')
      buildController()
      window.history.replaceState({}, '', '/?utm_campaign=spring')

      expect(controller.pageContext().utm).toEqual({ campaign: 'spring' })

      window.history.replaceState({}, '', '/products/42')
      expect(controller.pageContext().utm).toEqual({ campaign: 'spring' })
    })

    it('does not inherit a campaign from another visit or another business', () => {
      window.history.replaceState({}, '', '/?utm_campaign=spring')
      Hellotext.initializeVisitSignals('business-1')

      // A new tab starts with empty session storage, and a second business keeps its own.
      window.sessionStorage.clear()
      window.history.replaceState({}, '', '/products/42')
      Hellotext.visitBusinessId = undefined
      Hellotext.initializeVisitSignals('business-2')

      buildController()
      expect(controller.pageContext().utm).toEqual({})
    })

    it('reads the URL and stays quiet when session storage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied')
      })
      window.history.replaceState({}, '', '/?utm_campaign=spring')
      Hellotext.initializeVisitSignals('business-1')

      buildController()
      expect(controller.pageContext().utm).toEqual({ campaign: 'spring' })
    })

    it('does not touch persisted attribution while a popup is evaluated', () => {
      const previous = document.cookie
      window.history.replaceState({}, '', '/?utm_campaign=spring')
      Hellotext.initializeVisitSignals('business-1')

      buildController()
      controller.connect()
      controller.pageContext()

      expect(document.cookie).toBe(previous)
    })
  })

  it('builds rule context from visit signals and the campaign this visit arrived with', () => {
    buildController()
    Hellotext.pageViews = 4
    Hellotext.visitorType = 'returning'
    Hellotext.visitCampaign = { source: 'instagram', medium: 'social' }
    Object.defineProperty(window.navigator, 'languages', {
      value: ['es-VE'],
      configurable: true,
    })
    controller.connectedAt = Date.now()

    expect(controller.pageContext()).toEqual(
      expect.objectContaining({
        pageViews: 4,
        language: 'es',
        visitorType: 'returning',
        utm: { source: 'instagram', medium: 'social' },
      }),
    )
  })

  it('does not display again after the visitor dismisses it', () => {
    const { element } = buildController()

    controller.connect()
    controller.close()
    controller.evaluateDisplay()

    expect(element.hidden).toBe(true)
  })

  describe('SPA navigation', () => {
    it('re-evaluates page rules after pushState', () => {
      jest.useFakeTimers()
      const { element } = buildController({ lanes: [lane(['page.path', 'contains', '/sale'])] })

      controller.connect()
      expect(element.hidden).toBe(true)

      window.history.pushState({}, '', '/sale')
      jest.runOnlyPendingTimers()

      expect(element.hidden).toBe(false)
    })

    it('re-evaluates title rules after Turbo renders', () => {
      jest.useFakeTimers()
      document.title = 'Home'
      const { element } = buildController({ lanes: [lane(['page.title', 'contains', 'sale'])] })

      controller.connect()
      expect(element.hidden).toBe(true)

      document.title = 'Sale'
      window.dispatchEvent(new Event('turbo:render'))
      jest.runOnlyPendingTimers()

      expect(element.hidden).toBe(false)
    })

    it.each(['pushState', 'replaceState'])(
      're-evaluates title rules after %s even when the URL is unchanged',
      method => {
        jest.useFakeTimers()
        document.title = 'Home'
        const { element } = buildController({ lanes: [lane(['page.title', 'contains', 'sale'])] })

        controller.connect()
        expect(element.hidden).toBe(true)

        window.history[method]({}, '', '/')
        document.title = 'Sale'
        jest.runOnlyPendingTimers()

        expect(element.hidden).toBe(false)
      },
    )

    it('restores history methods and cancels pending navigation work on disconnect', () => {
      jest.useFakeTimers()
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState
      buildController({ lanes: [lane(['page.path', 'contains', '/sale'])] })

      controller.connect()
      window.history.pushState({}, '', '/sale')
      controller.disconnect()
      jest.runOnlyPendingTimers()

      expect(window.history.pushState).toBe(originalPushState)
      expect(window.history.replaceState).toBe(originalReplaceState)
      expect(controller.element.hidden).toBe(true)
    })

    it('keeps a downstream history wrapper functional after disconnect', () => {
      jest.useFakeTimers()
      const { element } = buildController({ lanes: [lane(['page.path', 'contains', '/sale'])] })

      controller.connect()
      const popupPushState = window.history.pushState
      const downstreamPushState = jest.fn(function (...args) {
        return popupPushState.apply(this, args)
      })
      window.history.pushState = downstreamPushState
      const evaluateDisplay = jest.spyOn(controller, 'evaluateDisplay')

      controller.disconnect()

      expect(window.history.pushState).toBe(downstreamPushState)
      expect(() => window.history.pushState({}, '', '/sale')).not.toThrow()
      jest.runOnlyPendingTimers()
      expect(downstreamPushState).toHaveBeenCalledTimes(1)
      expect(evaluateDisplay).not.toHaveBeenCalled()
      expect(element.hidden).toBe(true)
    })

    it('restarts time on page after navigation', () => {
      jest.useFakeTimers()
      const { element } = buildController({ lanes: [lane(['session.time_on_page', 'at_least', 5])] })

      controller.connect()
      jest.advanceTimersByTime(4000)
      window.history.pushState({}, '', '/sale')
      jest.runOnlyPendingTimers()
      jest.advanceTimersByTime(2000)

      expect(element.hidden).toBe(true)

      jest.advanceTimersByTime(3000)
      expect(element.hidden).toBe(false)
    })
  })
})
