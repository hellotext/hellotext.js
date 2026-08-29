/**
 * @jest-environment jsdom
 */

import PopupController from '../../src/controllers/popup_controller'
import API from '../../src/api'

describe('PopupController', () => {
  let controller
  let originalLocalStorage

  const buildController = ({
    hasBubble = true,
    id = 'popup-id',
    rules = { operator: 'and', conditions: [] },
  } = {}) => {
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
    const resendButton = document.createElement('button')
    const changeDestinationButton = document.createElement('button')

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
    completed.innerHTML = [
      '<p>We sent it to <strong>{destination}</strong>',
      ' via {channel}. It may take a minute to arrive.</p>',
    ].join('')
    resendButton.textContent = 'Resend'
    resendButton.hidden = true
    resendButton.dataset.countdownLabel = 'Resend in %{time}'
    changeDestinationButton.hidden = true
    changeDestinationButton.dataset.emailLabel = 'Change email'
    changeDestinationButton.dataset.phoneLabel = 'Change number'
    completed.append(resendButton, changeDestinationButton)

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
    Object.defineProperties(controller, {
      resendButtonTarget: { value: resendButton, configurable: true },
      changeDestinationButtonTarget: { value: changeDestinationButton, configurable: true },
      hasResendButtonTarget: { value: true, configurable: true },
      hasChangeDestinationButtonTarget: { value: true, configurable: true },
    })
    controller.hasBubbleTarget = hasBubble
    controller.hasBubbleValue = hasBubble
    controller.captureValue = { capture_id: 'capture-id' }
    controller.deviceValue = 'all'
    controller.idValue = id
    controller.rulesValue = rules

    return {
      element,
      bubble,
      dialog,
      completed,
      stepOne,
      stepTwo,
      emailInput,
      phoneInput,
      resendButton,
      changeDestinationButton,
    }
  }

  beforeEach(() => {
    originalLocalStorage = window.localStorage
    jest.spyOn(API.popups, 'submit').mockResolvedValue({
      failed: false,
      json: jest.fn().mockResolvedValue({
        id: 'submission-id',
        verification_state: 'unverified',
        action_token: 'action-token',
        delivery_status: 'queued',
        delivery_channel: 'email',
        destination: 'customer@example.com',
      }),
    })
    jest.spyOn(API.popups, 'resend').mockResolvedValue({
      succeeded: true,
      data: { headers: new Headers({ 'Retry-After': '60' }), status: 202 },
    })
    jest.spyOn(API.popups, 'cancel').mockResolvedValue({ failed: false, succeeded: true })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    PopupController.controllers.clear()
    PopupController.displayOwner = undefined
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

  it('shows only the first eligible popup and releases the surface when it closes', () => {
    const first = buildController({ hasBubble: false, id: 'first-popup' })
    const firstController = controller
    const second = buildController({ hasBubble: false, id: 'second-popup' })
    const secondController = controller

    firstController.connect()
    secondController.connect()

    expect(first.dialog.hidden).toBe(false)
    expect(second.element.hidden).toBe(true)

    firstController.close()

    expect(first.element.hidden).toBe(true)
    expect(second.dialog.hidden).toBe(false)
  })

  it('releases the next eligible popup when a bubble popup closes', () => {
    const first = buildController({ id: 'first-popup' })
    const firstController = controller
    const second = buildController({ hasBubble: false, id: 'second-popup' })
    const secondController = controller

    firstController.connect()
    secondController.connect()

    expect(first.bubble.hidden).toBe(false)
    expect(second.element.hidden).toBe(true)

    firstController.close()

    expect(first.element.hidden).toBe(true)
    expect(second.dialog.hidden).toBe(false)
  })

  it('allows the next popup to display when the first popup does not match the device', () => {
    const first = buildController({ hasBubble: false, id: 'mobile-popup' })
    const firstController = controller
    firstController.deviceValue = 'mobile'
    const second = buildController({ hasBubble: false, id: 'desktop-popup' })
    const secondController = controller
    secondController.deviceValue = 'desktop'

    firstController.connect()
    secondController.connect()

    expect(first.element.hidden).toBe(true)
    expect(second.dialog.hidden).toBe(false)
  })

  it('releases the next eligible popup when the display owner disconnects', () => {
    const first = buildController({ hasBubble: false, id: 'first-popup' })
    const firstController = controller
    const second = buildController({ hasBubble: false, id: 'second-popup' })
    const secondController = controller

    firstController.connect()
    secondController.connect()
    firstController.disconnect()

    expect(second.dialog.hidden).toBe(false)
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
    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to customer@example.com via email. It may take a minute to arrive.',
    )
    expect(completed.querySelector('strong').textContent).toBe('customer@example.com')
  })

  it('shows a one-minute resend cooldown and the change action for the submitted identity', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-24T12:00:00Z'))
    const { emailInput, phoneInput, resendButton, changeDestinationButton } = buildController({ hasBubble: false })

    controller.connect()
    phoneInput.required = false
    emailInput.value = 'customer@example.com'
    await controller.next()
    await controller.submit()

    expect(resendButton.hidden).toBe(false)
    expect(resendButton.disabled).toBe(true)
    expect(resendButton.textContent).toBe('Resend in 1:00')
    expect(changeDestinationButton.hidden).toBe(false)
    expect(changeDestinationButton.textContent).toBe('Change email')

    jest.advanceTimersByTime(60000)

    expect(resendButton.disabled).toBe(false)
    expect(resendButton.textContent).toBe('Resend')
  })

  it('resends only the identity shown in the completed step and restarts the cooldown', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-08-24T12:00:00Z'))
    const { emailInput, phoneInput, resendButton } = buildController({ hasBubble: false })

    controller.connect()
    phoneInput.required = false
    emailInput.value = 'customer@example.com'
    await controller.next()
    await controller.submit()
    jest.advanceTimersByTime(60000)

    await controller.resend({ preventDefault: jest.fn() })

    expect(API.popups.resend).toHaveBeenCalledWith(
      'popup-id',
      'submission-id',
      'action-token',
    )
    expect(resendButton.disabled).toBe(true)
    expect(resendButton.textContent).toBe('Resend in 1:00')
  })

  it('returns to and focuses the step that owns the completed identity', async () => {
    const { completed, emailInput, phoneInput, stepOne, changeDestinationButton } = buildController({ hasBubble: false })
    jest.spyOn(emailInput, 'focus')

    controller.connect()
    phoneInput.required = false
    emailInput.value = 'customer@example.com'
    await controller.next()
    await controller.submit()
    await controller.changeDestination({ preventDefault: jest.fn() })

    expect(API.popups.cancel).not.toHaveBeenCalled()
    expect(completed.hidden).toBe(true)
    expect(stepOne.hidden).toBe(false)
    expect(emailInput.focus).toHaveBeenCalled()
    expect(changeDestinationButton.textContent).toBe('Change email')
    expect(controller.submissionDeliveryStatus).toBeNull()
    expect(controller.submissionDeliveryChannel).toBeNull()
    expect(controller.submissionDestination).toBeNull()
  })

  it('returns to the identity selected by the backend fallback route', async () => {
    const { emailInput, phoneInput, stepOne } = buildController({ hasBubble: false })
    jest.spyOn(emailInput, 'focus')
    controller.inputTargets = [phoneInput, emailInput]
    controller.submissionDeliveryChannel = 'email'
    controller.submissionDestination = 'customer@example.com'
    emailInput.value = 'customer@example.com'
    phoneInput.value = '+15551234567'

    controller.showCompleted()
    await controller.changeDestination({ preventDefault: jest.fn() })

    expect(stepOne.hidden).toBe(false)
    expect(emailInput.focus).toHaveBeenCalled()
  })

  it('uses a readable channel when the popup only requires one identity field', () => {
    const { completed, emailInput, phoneInput } = buildController({ hasBubble: false })

    phoneInput.required = false
    emailInput.value = 'customer@example.com'

    controller.showCompleted()

    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to customer@example.com via email. It may take a minute to arrive.',
    )

    emailInput.value = 'updated@example.com'
    controller.showCompleted()

    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to updated@example.com via email. It may take a minute to arrive.',
    )
  })

  it('falls back to the first populated optional identity field', () => {
    const { completed, emailInput, phoneInput } = buildController({ hasBubble: false })

    emailInput.required = false
    phoneInput.required = false
    emailInput.value = 'customer@example.com'

    controller.showCompleted()

    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to customer@example.com via email. It may take a minute to arrive.',
    )
  })

  it('formats a required phone with the popup country prefix', () => {
    const { completed, emailInput, phoneInput } = buildController({ hasBubble: false })

    emailInput.required = false
    phoneInput.dataset.popupPhonePrefix = '+58'
    phoneInput.value = '04126625353'

    controller.showCompleted()

    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to +584126625353 via phone. It may take a minute to arrive.',
    )
  })

  it('uses the backend delivery channel and destination in the completed step', () => {
    const { completed, emailInput, phoneInput } = buildController({ hasBubble: false })

    emailInput.value = 'customer@example.com'
    phoneInput.value = '+15551234567'
    controller.submissionDeliveryChannel = 'sms'
    controller.submissionDestination = '+15551234567'

    controller.showCompleted()

    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to +15551234567 via sms. It may take a minute to arrive.',
    )
  })

  it('shows contact-only completion copy and no delivery actions when delivery is not required', () => {
    const { completed, emailInput, resendButton, changeDestinationButton } = buildController({ hasBubble: false })
    const headline = document.createElement('header')
    const description = document.createElement('div')
    const actions = document.createElement('footer')

    emailInput.value = 'customer@example.com'
    headline.className = 'hellotext--popup__completion-headline'
    description.className = 'hellotext--popup__completion-description'
    actions.dataset.deliveryActions = ''
    completed.dataset.notRequiredHeadline = 'Thanks for signing up'
    completed.dataset.notRequiredDescription = 'Your details were saved.'
    completed.append(headline, description, actions)
    controller.submissionDeliveryStatus = 'not_required'

    controller.showCompleted()

    expect(headline.textContent).toBe('Thanks for signing up')
    expect(description.textContent).toBe('Your details were saved.')
    expect(actions.hidden).toBe(true)
    expect(resendButton.hidden).toBe(true)
    expect(changeDestinationButton.hidden).toBe(true)
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
