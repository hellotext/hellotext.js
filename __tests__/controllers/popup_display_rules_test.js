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
    controller.rulesValue = { lanes }

    return { element, dialog }
  }

  const lane = (...conditions) => conditions.map(([field, operator, values]) => ({
    field,
    operator,
    values: [].concat(values),
  }))

  beforeEach(() => {
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
    const { element } = buildController({ lanes: [lane(['page.path', 'contains', '/'])] })

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

      jest.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2000)
      window.innerWidth = 1200
      Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })

      controller.connect()
      expect(element.hidden).toBe(true)

      window.scrollY = 900
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

  it('does not display again after the visitor dismisses it', () => {
    const { element } = buildController()

    controller.connect()
    controller.close()
    controller.evaluateDisplay()

    expect(element.hidden).toBe(true)
  })
})
