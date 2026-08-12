/**
 * @jest-environment jsdom
 */

import PopupController from '../../src/controllers/popup_controller'
import API from '../../src/api'

describe('PopupController', () => {
  let controller
  let originalLocalStorage

  const buildController = ({ hasBubble = true, rules = { operator: 'and', conditions: [] } } = {}) => {
    const element = document.createElement('article')
    const bubble = document.createElement('button')
    const dialog = document.createElement('section')
    const completed = document.createElement('section')
    const stepOne = document.createElement('section')
    const stepTwo = document.createElement('section')
    const emailInput = document.createElement('input')
    const phoneInput = document.createElement('input')
    const stepOneButton = document.createElement('button')
    const stepTwoButton = document.createElement('button')

    bubble.textContent = '10% OFF'
    emailInput.type = 'email'
    emailInput.required = true
    emailInput.dataset.popupFieldKind = 'email'
    emailInput.dataset.popupFieldKey = 'email'
    emailInput.dataset.popupStepId = 'step-one'
    phoneInput.type = 'tel'
    phoneInput.required = true
    phoneInput.dataset.popupFieldKind = 'phone'
    phoneInput.dataset.popupFieldKey = 'phone'
    phoneInput.dataset.popupStepId = 'step-two'
    stepOne.dataset.stepId = 'step-one'
    stepOne.dataset.stepName = 'Step 1'
    stepTwo.dataset.stepId = 'step-two'
    stepTwo.dataset.stepName = 'Step 2'
    stepTwo.hidden = true
    completed.hidden = true

    stepOne.appendChild(emailInput)
    stepTwo.appendChild(phoneInput)
    dialog.append(stepOne, stepTwo, completed)
    element.append(bubble, dialog)
    document.body.appendChild(element)

    controller = new PopupController()
    Object.defineProperty(controller, 'element', {
      value: element,
      writable: false,
      configurable: true,
    })

    controller.bubbleTarget = bubble
    controller.dialogTarget = dialog
    controller.completedTarget = completed
    controller.stepTargets = [stepOne, stepTwo]
    controller.inputTargets = [emailInput, phoneInput]
    controller.submitButtonTargets = [stepOneButton, stepTwoButton]
    controller.hasBubbleTarget = hasBubble
    controller.hasBubbleValue = hasBubble
    controller.captureValue = { capture_id: 'capture-id' }
    controller.deviceValue = 'all'
    controller.idValue = 'popup-id'
    controller.rulesValue = rules

    return { element, bubble, dialog, completed, stepOne, stepTwo, emailInput, phoneInput }
  }

  beforeEach(() => {
    originalLocalStorage = window.localStorage
    jest.spyOn(API.popups, 'submit').mockResolvedValue({ failed: false })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
    document.body.innerHTML = ''
    localStorage.clear()
  })

  it('shows the bubble first and opens the dialog when clicked', () => {
    const { element, bubble, dialog } = buildController()

    controller.connect()

    expect(element.hidden).toBe(false)
    expect(bubble.hidden).toBe(false)
    expect(dialog.hidden).toBe(true)

    controller.open()

    expect(bubble.hidden).toBe(true)
    expect(dialog.hidden).toBe(false)
    expect(localStorage.getItem('hellotext:popup:popup-id:viewed')).toBe('true')
  })

  it('validates the current step before moving to the next one', async () => {
    const { stepOne, stepTwo, emailInput } = buildController({ hasBubble: false })

    controller.connect()

    await controller.next()

    expect(stepOne.hidden).toBe(false)
    expect(stepTwo.hidden).toBe(true)
    expect(API.popups.submit).not.toHaveBeenCalled()

    emailInput.value = 'customer@example.com'

    await controller.next()

    expect(stepOne.hidden).toBe(true)
    expect(stepTwo.hidden).toBe(false)
    expect(API.popups.submit).not.toHaveBeenCalled()
  })

  it('advances instead of submitting when the form submits before the last step', async () => {
    const { stepOne, stepTwo, emailInput } = buildController({ hasBubble: false })
    const event = { preventDefault: jest.fn() }

    controller.connect()
    emailInput.value = 'customer@example.com'

    await controller.submit(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(stepOne.hidden).toBe(true)
    expect(stepTwo.hidden).toBe(false)
    expect(API.popups.submit).not.toHaveBeenCalled()
  })

  it('submits collected fields and shows the completed step on the last step', async () => {
    const { completed, emailInput, phoneInput, stepOne, stepTwo } = buildController({ hasBubble: false })

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'

    await controller.next()

    expect(API.popups.submit).toHaveBeenCalledWith('popup-id', {
      email: 'customer@example.com',
      phone: '+15551234567',
      metadata: {
        capture: {
          capture_id: 'capture-id',
        },
        fields: {
          email: 'customer@example.com',
          phone: '+15551234567',
        },
        steps: [
          {
            id: 'step-one',
            name: 'Step 1',
            fields: {
              email: 'customer@example.com',
            },
          },
          {
            id: 'step-two',
            name: 'Step 2',
            fields: {
              phone: '+15551234567',
            },
          },
        ],
      },
    })
    expect(stepOne.hidden).toBe(true)
    expect(stepTwo.hidden).toBe(true)
    expect(completed.hidden).toBe(false)
  })

  it('validates the last step before submitting', async () => {
    const { completed, emailInput, phoneInput, stepTwo } = buildController({ hasBubble: false })

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()

    await controller.submit()

    expect(API.popups.submit).not.toHaveBeenCalled()
    expect(stepTwo.hidden).toBe(false)
    expect(completed.hidden).toBe(true)
    expect(phoneInput.checkValidity()).toBe(false)
  })

  it('tolerates browsers that block localStorage', () => {
    buildController()
    const storage = {
      getItem: jest.fn(() => {
        throw new Error('blocked')
      }),
      setItem: jest.fn(() => {
        throw new Error('blocked')
      }),
      clear: jest.fn(),
    }

    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    })

    expect(() => controller.markViewed()).not.toThrow()
    expect(controller.viewedPopupRulePasses({ inclusion: false })).toBe(true)
  })
})
