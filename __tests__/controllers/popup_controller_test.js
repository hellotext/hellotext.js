/**
 * @jest-environment jsdom
 */

import PopupController from '../../src/controllers/popup_controller'
import PopupsAPI from '../../src/api/popups'
import Hellotext from '../../src/hellotext'

describe('PopupController', () => {
  let controller
  const buildController = ({
    hasBubble = true,
    id = 'popup-id',
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
    const globalError = document.createElement('p')
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
    globalError.hidden = true
    globalError.dataset.submitError = "We couldn't submit your information. Please try again."

    stepOne.appendChild(emailInput)
    stepTwo.appendChild(phoneInput)
    dialog.append(stepOne, stepTwo, globalError, completed)
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
    controller.globalErrorTarget = globalError
    controller.stepTargets = [stepOne, stepTwo]
    controller.inputTargets = [emailInput, phoneInput]
    controller.submitButtonTargets = [stepOneButton, stepTwoButton]
    Object.defineProperties(controller, {
      resendButtonTarget: { value: resendButton, configurable: true },
      changeDestinationButtonTarget: { value: changeDestinationButton, configurable: true },
      hasResendButtonTarget: { value: true, configurable: true },
      hasChangeDestinationButtonTarget: { value: true, configurable: true },
      hasGlobalErrorTarget: { value: true, configurable: true },
    })
    controller.hasBubbleTarget = hasBubble
    controller.hasBubbleValue = hasBubble
    controller.captureValue = { capture_id: 'capture-id' }
    controller.deviceValue = 'all'
    controller.idValue = id
    controller.initialize()

    return {
      element,
      bubble,
      dialog,
      completed,
      stepOne,
      stepTwo,
      emailInput,
      phoneInput,
      globalError,
      resendButton,
      changeDestinationButton,
    }
  }

  beforeEach(() => {
    jest.spyOn(PopupsAPI, 'submit').mockResolvedValue({
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
    jest.spyOn(PopupsAPI, 'resend').mockResolvedValue({
      succeeded: true,
      data: { headers: new Headers({ 'Retry-After': '60' }), status: 202 },
    })
    jest.spyOn(PopupsAPI, 'cancel').mockResolvedValue({ failed: false, succeeded: true })
    jest.spyOn(Hellotext.eventEmitter, 'dispatch')
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('shows the bubble first and opens the dialog when clicked', () => {
    const { element, bubble, dialog } = buildController()

    controller.connect()

    expect(element.hidden).toBe(false)
    expect(bubble.hidden).toBe(false)
    expect(dialog.hidden).toBe(true)
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(1)
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(1, 'popup:mounted')

    controller.open()

    expect(bubble.hidden).toBe(true)
    expect(dialog.hidden).toBe(false)
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(2, 'popup:opened')
  })

  it('dispatches popup:mounted before an automatic popup opens and popup:closed when it is dismissed', () => {
    const { element, dialog } = buildController({ hasBubble: false })

    controller.connect()
    controller.close()

    expect(element.hidden).toBe(true)
    expect(dialog.hidden).toBe(true)
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(1, 'popup:mounted')
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(2, 'popup:opened')
    expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(3, 'popup:closed')
  })

  it('validates the current step before moving to the next one', async () => {
    const { stepOne, stepTwo, emailInput } = buildController({ hasBubble: false })

    controller.connect()

    await controller.next()

    expect(stepOne.hidden).toBe(false)
    expect(stepTwo.hidden).toBe(true)
    expect(PopupsAPI.submit).not.toHaveBeenCalled()

    emailInput.value = 'customer@example.com'

    await controller.next()

    expect(stepOne.hidden).toBe(true)
    expect(stepTwo.hidden).toBe(false)
    expect(PopupsAPI.submit).not.toHaveBeenCalled()
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
    expect(PopupsAPI.submit).not.toHaveBeenCalled()
  })

  it('submits collected fields and shows the completed step on the last step', async () => {
    const { completed, emailInput, phoneInput, stepOne, stepTwo } = buildController({ hasBubble: false })

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'

    await controller.next()

    expect(PopupsAPI.submit).toHaveBeenCalledWith(
      'popup-id',
      {
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
      },
      expect.any(String),
    )
    expect(stepOne.hidden).toBe(true)
    expect(stepTwo.hidden).toBe(true)
    expect(completed.hidden).toBe(false)
    expect(completed.querySelector('p').textContent).toBe(
      'We sent it to customer@example.com via email. It may take a minute to arrive.',
    )
    expect(completed.querySelector('strong').textContent).toBe('customer@example.com')
  })

  it('reuses the idempotency key after a lost response and restores the submit buttons', async () => {
    const { emailInput, phoneInput, globalError } = buildController({ hasBubble: false })
    PopupsAPI.submit.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'

    await controller.submit()
    const firstKey = PopupsAPI.submit.mock.calls[0][2]

    expect(controller.submitButtonTargets.every(button => !button.disabled)).toBe(true)
    expect(globalError.hidden).toBe(false)
    expect(globalError.textContent).toBe("We couldn't submit your information. Please try again.")

    await controller.submit()

    expect(PopupsAPI.submit.mock.calls[1][2]).toBe(firstKey)
    expect(globalError.hidden).toBe(true)
  })

  it('generates a new idempotency key after the submitted data changes', async () => {
    const { emailInput, phoneInput } = buildController({ hasBubble: false })
    PopupsAPI.submit.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'
    await controller.submit()
    const firstKey = PopupsAPI.submit.mock.calls[0][2]

    phoneInput.value = '+15557654321'
    await controller.submit()

    expect(PopupsAPI.submit.mock.calls[1][2]).not.toBe(firstKey)
  })

  it('shows submission errors that are not associated with an input', async () => {
    const { emailInput, phoneInput, globalError } = buildController({ hasBubble: false })
    PopupsAPI.submit.mockResolvedValueOnce({
      failed: true,
      json: jest.fn().mockResolvedValue({
        errors: [{ parameter: 'base', description: 'Enter an email address or phone number.' }],
      }),
    })

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'
    await controller.submit()

    expect(globalError.hidden).toBe(false)
    expect(globalError.textContent).toBe('Enter an email address or phone number.')
    expect(controller.submitButtonTargets.every(button => !button.disabled)).toBe(true)
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

    expect(PopupsAPI.resend).toHaveBeenCalledWith(
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

    expect(PopupsAPI.cancel).toHaveBeenCalledWith(
      'popup-id',
      'submission-id',
      'action-token',
    )
    expect(completed.hidden).toBe(true)
    expect(stepOne.hidden).toBe(false)
    expect(emailInput.focus).toHaveBeenCalled()
    expect(changeDestinationButton.textContent).toBe('Change email')
    expect(controller.submissionDeliveryStatus).toBeNull()
    expect(controller.submissionDeliveryChannel).toBeNull()
    expect(controller.submissionDestination).toBeNull()
  })

  it('keeps the completed step visible when the previous submission cannot be canceled', async () => {
    const { completed, emailInput, phoneInput, stepOne, changeDestinationButton } = buildController({ hasBubble: false })
    PopupsAPI.cancel.mockResolvedValueOnce({ failed: true, succeeded: false })

    controller.connect()
    phoneInput.required = false
    emailInput.value = 'customer@example.com'
    await controller.next()
    await controller.submit()
    await controller.changeDestination({ preventDefault: jest.fn() })

    expect(completed.hidden).toBe(false)
    expect(stepOne.hidden).toBe(true)
    expect(changeDestinationButton.disabled).toBe(false)
    expect(controller.submissionId).toBe('submission-id')
  })

  it('keeps the completed step visible when cancellation cannot reach the API', async () => {
    const { completed, emailInput, phoneInput, stepOne, changeDestinationButton } = buildController({ hasBubble: false })
    PopupsAPI.cancel.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    controller.connect()
    phoneInput.required = false
    emailInput.value = 'customer@example.com'
    await controller.next()
    await controller.submit()
    await controller.changeDestination({ preventDefault: jest.fn() })

    expect(completed.hidden).toBe(false)
    expect(stepOne.hidden).toBe(true)
    expect(changeDestinationButton.disabled).toBe(false)
    expect(controller.submissionId).toBe('submission-id')
  })

  it('returns to the identity selected by the backend fallback route', async () => {
    const { emailInput, phoneInput, stepOne } = buildController({ hasBubble: false })
    jest.spyOn(emailInput, 'focus')
    controller.inputTargets = [phoneInput, emailInput]
    controller.submissionId = 'submission-id'
    controller.submissionActionToken = 'action-token'
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

    expect(PopupsAPI.submit).not.toHaveBeenCalled()
    expect(stepTwo.hidden).toBe(false)
    expect(completed.hidden).toBe(true)
    expect(phoneInput.checkValidity()).toBe(false)
  })

})
