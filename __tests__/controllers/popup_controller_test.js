/**
 * @jest-environment jsdom
 */

import PopupController from '../../src/controllers/popup_controller'
import PopupsAPI from '../../src/api/popups'
import Hellotext from '../../src/hellotext'
import { Cookies } from '../../src/models/cookies'

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
    // Before initialize(): that is where the controller builds its display rules.
    controller.rulesValue = { lanes: [] }
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

  // A rule may target any of the three campaign parameters. The URL the visitor is on answers
  // for itself, and what it carried is remembered for the rest of the visit — persisted
  // attribution, which outlives the visit by years, is never the fallback.
  describe('UTM rules', () => {
    const utmRule = (field, value) => ({
      lanes: [[{ type: 'condition', field, operator: 'is', values: [value] }]],
    })
    const flushTimers = () => new Promise(resolve => setTimeout(resolve, 0))
    let originalPage

    // The rule has to be in place before initialize(), which is where the controller builds
    // it. Assigning rulesValue after that leaves the controller evaluating an empty rule set,
    // which matches every page and would let these tests pass without reading their rule.
    const connectWith = rules => {
      const built = buildController({ hasBubble: false })
      controller.rulesValue = rules
      controller.initialize()
      controller.connect()

      return built
    }

    beforeEach(() => {
      originalPage = Hellotext.page
      // Set, and expected to stay unread: this is the attribution the browser persisted.
      Hellotext.page = { utmParams: { source: 'google', medium: 'cpc' } }
      Hellotext.visitBusinessId = 'business-1'
      Hellotext.visitCampaign = {}
      window.sessionStorage.clear()
    })

    afterEach(() => {
      controller?.disconnect()
      Hellotext.page = originalPage
      Hellotext.visitCampaign = {}
      window.history.replaceState({}, '', '/')
    })

    it('matches a campaign the URL carries without a source or medium', () => {
      window.history.replaceState({}, '', '/landing?utm_campaign=spring')

      const { element } = connectWith(utmRule('session.utm_campaign', 'spring'))

      expect(element.hidden).toBe(false)
    })

    it('ignores capitalization while keeping each value as the link wrote it', () => {
      window.history.replaceState({}, '', '/landing?utm_source=Google&utm_medium=Paid_Social&utm_campaign=Spring')

      const { element } = connectWith(utmRule('session.utm_source', 'google'))

      expect(element.hidden).toBe(false)
      expect(controller.pageContext().utm).toEqual({
        source: 'Google',
        medium: 'Paid_Social',
        campaign: 'Spring',
      })

      controller.disconnect()
      const campaign = connectWith(utmRule('session.utm_campaign', 'spring'))

      expect(campaign.element.hidden).toBe(false)
    })

    it('keeps an encoded literal plus distinct from a space in campaign values', () => {
      window.history.replaceState({}, '', '/landing?utm_campaign=Black%2BFriday')

      const plus = connectWith(utmRule('session.utm_campaign', 'black+friday'))

      expect(plus.element.hidden).toBe(false)
      expect(controller.pageContext().utm).toEqual({ campaign: 'Black+Friday' })

      controller.disconnect()
      const words = connectWith(utmRule('session.utm_campaign', 'black friday'))

      expect(words.element.hidden).toBe(true)
    })

    it('keeps the campaign this visit arrived with once the URL drops it', () => {
      Hellotext.rememberVisitCampaign({ campaign: 'spring' })
      window.history.replaceState({}, '', '/products/42')

      const { element } = connectWith(utmRule('session.utm_campaign', 'spring'))

      expect(element.hidden).toBe(false)
    })

    // `hello_utm` records only a complete source and medium pair and survives for years, so
    // an old campaign must never decide a popup for a visit that arrived some other way.
    it('never falls back to the attribution persisted for the browser', () => {
      window.history.replaceState({}, '', '/landing')

      const { element } = connectWith(utmRule('session.utm_source', 'google'))

      expect(element.hidden).toBe(true)
      expect(controller.pageContext().utm).toEqual({})
    })

    it('lets the URL replace the remembered campaign rather than merge with it', () => {
      Hellotext.rememberVisitCampaign({ source: 'google', medium: 'cpc' })
      window.history.replaceState({}, '', '/landing?utm_campaign=spring')

      const { element } = connectWith(utmRule('session.utm_source', 'google'))

      expect(element.hidden).toBe(true)
      expect(controller.pageContext().utm).toEqual({ campaign: 'spring' })
    })

    it('ignores parameters that name no campaign', () => {
      Hellotext.rememberVisitCampaign({ source: 'google', medium: 'cpc' })
      window.history.replaceState({}, '', '/landing?utm_term=shoes')

      const { element } = connectWith(utmRule('session.utm_source', 'google'))

      expect(element.hidden).toBe(false)
    })

    it('falls back when UTM values are blank and reads campaign parameters from a hash route', () => {
      Hellotext.rememberVisitCampaign({ source: 'Google', medium: 'CPC' })
      window.history.replaceState({}, '', '/landing?utm_campaign=%20')

      const { element } = connectWith(utmRule('session.utm_source', 'google'))
      expect(element.hidden).toBe(false)

      controller.disconnect()
      window.history.replaceState({}, '', '/?affiliate=1#/landing?utm_campaign=spring')
      const hashRoute = connectWith(utmRule('session.utm_source', 'google'))

      expect(hashRoute.element.hidden).toBe(true)
    })

    it('prefers a document campaign over campaign parameters inside the hash route', () => {
      window.history.replaceState(
        {},
        '',
        '/?utm_source=paid#/landing?utm_campaign=spring',
      )

      const { element } = connectWith(utmRule('session.utm_source', 'paid'))

      expect(element.hidden).toBe(false)
      expect(controller.pageContext().utm).toEqual({ source: 'paid' })
    })

    it('uses the first duplicate UTM parameter without changing persisted attribution', () => {
      const set = jest.spyOn(Cookies, 'set')
      window.history.replaceState({}, '', '/landing?utm_source=First&utm_source=Second')

      const { element } = connectWith(utmRule('session.utm_source', 'first'))

      expect(element.hidden).toBe(false)
      expect(controller.pageContext().utm).toEqual({ source: 'First' })
      expect(set).not.toHaveBeenCalled()
    })

    it('re-reads the URL after a SPA route adds a campaign', async () => {
      window.history.replaceState({}, '', '/landing')

      const { element } = connectWith(utmRule('session.utm_source', 'newsletter'))
      expect(element.hidden).toBe(true)

      window.history.pushState({}, '', '/offer?utm_source=newsletter')
      await flushTimers()

      expect(element.hidden).toBe(false)
    })
  })

  describe('browser detection', () => {
    it.each([
      ['Opera', 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0'],
      ['Samsung Internet', 'Mozilla/5.0 Chrome/120.0.0.0 Mobile Safari/537.36 SamsungBrowser/23.0'],
    ])('does not classify %s as Chrome', (_browser, userAgent) => {
      jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
      buildController()

      expect(controller.browserName()).toBeUndefined()
    })
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

  it('returns to the step containing a field the server rejects', async () => {
    const { emailInput, phoneInput, stepOne, stepTwo } = buildController({ hasBubble: false })
    PopupsAPI.submit.mockResolvedValueOnce({
      failed: true,
      json: jest.fn().mockResolvedValue({
        errors: [{ parameter: 'email', description: 'Email is already in use.' }],
      }),
    })

    controller.connect()
    emailInput.value = 'customer@example.com'
    await controller.next()
    phoneInput.value = '+15551234567'
    await controller.submit()

    expect(controller.stepIndex).toBe(0)
    expect(stepOne.hidden).toBe(false)
    expect(stepTwo.hidden).toBe(true)
    expect(emailInput.validationMessage).toBe('Email is already in use.')
  })

  it('returns to the step associated with a rejected field outside its layout wrapper', async () => {
    const { emailInput, phoneInput, stepOne, stepTwo } = buildController({ hasBubble: false })
    stepOne.removeChild(emailInput)
    controller.element.appendChild(emailInput)
    PopupsAPI.submit.mockResolvedValueOnce({
      failed: true,
      json: jest.fn().mockResolvedValue({
        errors: [{ parameter: 'email', description: 'Email is already in use.' }],
      }),
    })

    controller.connect()
    emailInput.value = 'customer@example.com'
    phoneInput.value = '+15551234567'
    controller.showStep(1)
    await controller.submit()

    expect(controller.stepIndex).toBe(0)
    expect(stepOne.hidden).toBe(false)
    expect(stepTwo.hidden).toBe(true)
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

  it('submits a prefixed phone value in the identity and metadata fields', () => {
    const { emailInput, phoneInput } = buildController({ hasBubble: false })

    emailInput.required = false
    phoneInput.dataset.popupPhonePrefix = '+58'
    phoneInput.value = '04126625353'

    expect(controller.submissionPayload()).toEqual(
      expect.objectContaining({
        phone: '+584126625353',
        metadata: expect.objectContaining({
          fields: expect.objectContaining({ phone: '+584126625353' }),
          steps: expect.arrayContaining([
            expect.objectContaining({ fields: expect.objectContaining({ phone: '+584126625353' }) }),
          ]),
        }),
      }),
    )
  })

  it('keeps an empty optional phone blank when it has a country prefix', () => {
    const { emailInput, phoneInput } = buildController({ hasBubble: false })

    phoneInput.required = false
    phoneInput.dataset.popupPhonePrefix = '+58'
    phoneInput.value = ''
    emailInput.value = 'customer@example.com'

    expect(controller.submissionPayload()).toEqual(
      expect.objectContaining({
        phone: '',
        metadata: expect.objectContaining({
          fields: expect.objectContaining({ phone: '' }),
        }),
      }),
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

  // The server renders both completion variants as targets; the controller only chooses
  // which one is visible. This mirrors that markup.
  const renderCompletionCopy = completed => {
    const deliveryHeadline = document.createElement('header')
    const deliveryDescription = document.createElement('div')
    const noDeliveryHeadline = document.createElement('header')
    const noDeliveryDescription = document.createElement('div')
    const actions = document.createElement('footer')

    deliveryHeadline.className = 'hellotext--popup__completion-headline'
    deliveryHeadline.innerHTML = '<h4><strong>Your code is on its way</strong></h4>'
    deliveryDescription.className = 'hellotext--popup__completion-description'
    deliveryDescription.textContent = 'We sent it to {destination}.'
    noDeliveryHeadline.className = 'hellotext--popup__completion-headline'
    noDeliveryHeadline.hidden = true
    noDeliveryHeadline.innerHTML = '<h4><strong>Thanks for signing up</strong></h4>'
    noDeliveryDescription.className = 'hellotext--popup__completion-description'
    noDeliveryDescription.hidden = true
    noDeliveryDescription.textContent = 'Your details were saved.'
    actions.dataset.deliveryActions = ''
    completed.append(deliveryHeadline, deliveryDescription, noDeliveryHeadline, noDeliveryDescription, actions)

    Object.defineProperties(controller, {
      deliveryCopyTargets: { value: [deliveryHeadline, deliveryDescription], configurable: true },
      noDeliveryCopyTargets: { value: [noDeliveryHeadline, noDeliveryDescription], configurable: true },
      hasDeliveryCopyTarget: { value: true, configurable: true },
      hasNoDeliveryCopyTarget: { value: true, configurable: true },
    })

    return { deliveryHeadline, deliveryDescription, noDeliveryHeadline, noDeliveryDescription, actions }
  }

  it('reveals the server-rendered no-delivery copy and hides delivery actions when delivery is not required', () => {
    const { completed, emailInput, resendButton, changeDestinationButton } = buildController({ hasBubble: false })
    const copy = renderCompletionCopy(completed)

    emailInput.value = 'customer@example.com'
    controller.submissionDeliveryStatus = 'not_required'

    controller.showCompleted()

    expect(copy.noDeliveryHeadline.hidden).toBe(false)
    expect(copy.noDeliveryDescription.hidden).toBe(false)
    expect(copy.deliveryHeadline.hidden).toBe(true)
    expect(copy.deliveryDescription.hidden).toBe(true)
    expect(copy.actions.hidden).toBe(true)
    expect(resendButton.hidden).toBe(true)
    expect(changeDestinationButton.hidden).toBe(true)
  })

  it('leaves the server markup untouched when revealing the no-delivery copy', () => {
    const { completed, emailInput } = buildController({ hasBubble: false })
    const copy = renderCompletionCopy(completed)

    emailInput.value = 'customer@example.com'
    controller.submissionDeliveryStatus = 'not_required'

    controller.showCompleted()

    expect(copy.noDeliveryHeadline.innerHTML).toBe('<h4><strong>Thanks for signing up</strong></h4>')
    expect(copy.deliveryHeadline.innerHTML).toBe('<h4><strong>Your code is on its way</strong></h4>')
    expect(copy.noDeliveryDescription.textContent).toBe('Your details were saved.')
    expect(copy.deliveryDescription.textContent).toBe('We sent it to customer@example.com.')
    expect(completed.querySelectorAll('h4')).toHaveLength(2)
  })

  it('keeps the delivery copy visible and interpolated when a delivery is queued', () => {
    const { completed, emailInput } = buildController({ hasBubble: false })
    const copy = renderCompletionCopy(completed)

    emailInput.value = 'customer@example.com'
    controller.submissionDeliveryStatus = 'queued'

    controller.showCompleted()

    expect(copy.deliveryHeadline.hidden).toBe(false)
    expect(copy.deliveryDescription.hidden).toBe(false)
    expect(copy.deliveryDescription.textContent).toContain('customer@example.com')
    expect(copy.noDeliveryHeadline.hidden).toBe(true)
    expect(copy.noDeliveryDescription.hidden).toBe(true)
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
