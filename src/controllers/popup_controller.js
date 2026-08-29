import { Controller } from '@hotwired/stimulus'

import API from '../api'

/**
 * Public popup runtime controller.
 *
 * Renders the persisted dashboard popup on merchant sites, applies client-side
 * display rules, controls bubble-to-dialog transitions, validates every step,
 * submits the collected data, and shows the completion screen.
 *
 * Targets:
 * - bubble: Launcher shown before the popup when bubble mode is enabled.
 * - dialog: Popup dialog/surface wrapper.
 * - step: Sequential form steps.
 * - completed: Completion state shown after submission.
 * - input: User-entered popup fields.
 * - submitButton: Step buttons disabled while the submission is in flight.
 *
 * Values:
 * - capture: Persisted capture, coupon, and journey metadata.
 * - device: Popup device targeting.
 * - hasBubble: Whether the popup starts from a bubble.
 * - id: Public popup identifier.
 * - rules: Persisted AND display rules.
 */
export default class extends Controller {
  static controllers = new Set()
  static displayOwner

  static targets = [
    'bubble',
    'dialog',
    'step',
    'completed',
    'input',
    'submitButton',
    'resendButton',
    'changeDestinationButton',
  ]
  static values = {
    capture: Object,
    device: String,
    hasBubble: Boolean,
    id: String,
    rules: Object,
  }

  connect() {
    this.constructor.controllers.add(this)
    this.stepIndex = 0
    this.onScroll = this.evaluateDisplay.bind(this)
    this.resendLabel = this.hasResendButtonTarget ? this.resendButtonTarget.textContent.trim() : ''

    this.hideElement(this.element)
    this.hideElement(this.dialogTarget)
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget)

    this.evaluateDisplay()
  }

  disconnect() {
    this.releaseDisplay()
    this.constructor.controllers.delete(this)
    window.removeEventListener('scroll', this.onScroll)
    this.stopResendCooldown()
  }

  open(event) {
    if (event) event.preventDefault()

    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget)
    this.showElement(this.dialogTarget)
    this.markViewed()
  }

  close(event) {
    if (event) event.preventDefault()

    this.dismissed = true
    this.hideElement(this.dialogTarget)
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget)
    this.hideElement(this.element)
    this.releaseDisplay()
  }

  async next(event) {
    if (event) event.preventDefault()

    this.clearCustomValidity()

    if (!this.currentStepValid()) {
      this.showErrorMessages(this.currentStepInputs)
      return
    }

    this.clearErrorMessages(this.currentStepInputs)

    if (this.stepIndex < this.stepTargets.length - 1) {
      this.showStep(this.stepIndex + 1)
      return
    }

    await this.submit()
  }

  async submit(event) {
    if (event) event.preventDefault()

    this.clearCustomValidity()

    if (this.stepIndex < this.stepTargets.length - 1) {
      await this.next()
      return
    }

    if (!this.currentStepValid()) {
      this.showErrorMessages(this.currentStepInputs)
      return
    }

    this.clearErrorMessages(this.currentStepInputs)

    this.submitButtonTargets.forEach(button => {
      button.disabled = true
    })

    const response = await API.popups.submit(this.idValue, this.submissionPayload())

    this.submitButtonTargets.forEach(button => {
      button.disabled = false
    })

    if (response.failed) {
      await this.handleSubmissionError(response)
      return
    }

    try {
      const submission = await response.json()
      this.submissionId = submission.id
      this.submissionVerificationState = submission.verification_state
      this.submissionActionToken = submission.action_token
      this.submissionDeliveryStatus = submission.delivery_status
      this.submissionDeliveryChannel = submission.delivery_channel
      this.submissionDestination = submission.destination
    } catch (_) {
      this.submissionId = null
    }

    this.showCompleted()
  }

  evaluateDisplay() {
    if (this.dismissed || !this.matchesDevice() || !this.rulesWithoutScrollPass()) {
      this.releaseDisplay()
      return
    }

    if (this.scrollRule && !this.scrollRulePasses()) {
      window.addEventListener('scroll', this.onScroll, { passive: true })
      return
    }

    window.removeEventListener('scroll', this.onScroll)
    if (!this.claimDisplay()) return
    this.showInitialState()
  }

  claimDisplay() {
    const Controller = this.constructor

    if (Controller.displayOwner && Controller.displayOwner !== this) return false

    Controller.displayOwner = this
    return true
  }

  releaseDisplay() {
    const Controller = this.constructor
    if (Controller.displayOwner !== this) return

    Controller.displayOwner = undefined
    Controller.controllers.forEach(controller => {
      if (controller !== this) controller.evaluateDisplay()
    })
  }

  showInitialState() {
    this.showElement(this.element)

    if (this.hasBubbleValue && this.hasBubbleTarget) {
      this.showElement(this.bubbleTarget)
      this.hideElement(this.dialogTarget)
      return
    }

    this.showElement(this.dialogTarget)
    this.markViewed()
  }

  showStep(index) {
    this.stepIndex = index

    this.stepTargets.forEach((step, stepIndex) => {
      this.toggleElement(step, stepIndex !== index)
    })

    this.hideElement(this.completedTarget)
  }

  showCompleted() {
    this.stepTargets.forEach(step => this.hideElement(step))
    this.interpolateCompletionCopy()
    this.configureCompletionActions()
    this.showElement(this.completedTarget)
  }

  interpolateCompletionCopy() {
    const identity = this.completedIdentity

    if (!identity) return

    const replacements = {
      destination: identity.value,
      channel: this.submissionDeliveryChannel || identity.kind,
    }

    this.completionTextTemplates.forEach(({ node, template }) => {
      node.nodeValue = template.replace(
        /\{(destination|channel)\}/g,
        (placeholder, key) => replacements[key] || placeholder,
      )
    })
  }

  identityValue(input) {
    const value = this.inputValue(input).trim()
    if (input.dataset.popupFieldKind !== 'phone' || value.startsWith('+')) return value

    const prefix = input.dataset.popupPhonePrefix

    return prefix ? `${prefix}${value.replace(/^0+/, '')}` : value
  }

  configureCompletionActions() {
    if (this.submissionDeliveryStatus === 'not_required') {
      this.renderNoDeliveryCopy()
      this.completedTarget.querySelector('[data-delivery-actions]')?.setAttribute('hidden', '')
      return
    }

    const identity = this.completedIdentity
    if (!identity) return

    if (this.hasChangeDestinationButtonTarget) {
      this.changeDestinationButtonTarget.textContent =
        this.changeDestinationButtonTarget.dataset[`${identity.kind}Label`]
      this.showElement(this.changeDestinationButtonTarget)
    }

    if (
      this.submissionId &&
      this.submissionActionToken &&
      this.submissionDeliveryStatus === 'queued' &&
      this.submissionVerificationState === 'unverified' &&
      this.hasResendButtonTarget
    ) {
      this.showElement(this.resendButtonTarget)
      this.startResendCooldown(60)
    }
  }

  async resend(event) {
    if (event) event.preventDefault()
    if (
      !this.submissionId ||
      !this.submissionActionToken ||
      this.resendPending ||
      this.resendCooldownActive
    )
      return

    const identity = this.completedIdentity
    if (!identity) return

    this.resendPending = true
    this.resendButtonTarget.disabled = true

    try {
      const response = await API.popups.resend(
        this.idValue,
        this.submissionId,
        this.submissionActionToken,
      )
      const retryAfter = Number(response.data.headers?.get('Retry-After')) || 60

      if (response.succeeded || response.data.status === 429) {
        this.startResendCooldown(retryAfter)
      } else {
        this.resendButtonTarget.disabled = false
      }
    } catch (_) {
      this.resendButtonTarget.disabled = false
    } finally {
      this.resendPending = false
    }
  }

  async changeDestination(event) {
    if (event) event.preventDefault()

    const input = this.completedIdentity?.input
    if (!input) return

    const stepIndex = this.stepTargets.findIndex(
      step => step.dataset.stepId === input.dataset.popupStepId,
    )
    if (stepIndex < 0) return

    this.stopResendCooldown()
    this.submissionId = null
    this.submissionActionToken = null
    this.submissionVerificationState = null
    this.submissionDeliveryStatus = null
    this.submissionDeliveryChannel = null
    this.submissionDestination = null
    this.showStep(stepIndex)
    input.focus()
  }

  startResendCooldown(seconds) {
    this.stopResendCooldown()
    this.resendCooldownEndsAt = Date.now() + Math.max(seconds, 1) * 1000
    this.updateResendCountdown()
    this.resendTimer = window.setInterval(() => this.updateResendCountdown(), 1000)
  }

  stopResendCooldown() {
    if (this.resendTimer) window.clearInterval(this.resendTimer)
    this.resendTimer = null
    this.resendCooldownEndsAt = null
  }

  updateResendCountdown() {
    const seconds = Math.max(0, Math.ceil((this.resendCooldownEndsAt - Date.now()) / 1000))

    if (seconds === 0) {
      this.stopResendCooldown()
      this.resendButtonTarget.textContent = this.resendLabel
      this.resendButtonTarget.disabled = false
      return
    }

    const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    const template = this.resendButtonTarget.dataset.countdownLabel || `${this.resendLabel} %{time}`
    this.resendButtonTarget.textContent = template.replace('%{time}', time)
    this.resendButtonTarget.disabled = true
  }

  get resendCooldownActive() {
    return this.resendCooldownEndsAt > Date.now()
  }

  get completionIdentity() {
    return this.identityInputs
      .map(input => ({
        input,
        kind: input.dataset.popupFieldKind,
        value: this.identityValue(input),
      }))
      .find(({ value }) => value)
  }

  get completedIdentity() {
    if (this.submissionDestination && this.submissionDeliveryChannel) {
      const kind = this.submissionDeliveryChannel === 'email' ? 'email' : 'phone'
      const input = this.identityInputs.find(candidate => candidate.dataset.popupFieldKind === kind)

      return { input, kind, value: this.submissionDestination }
    }

    return this.completionIdentity
  }

  renderNoDeliveryCopy() {
    const headline = this.completedTarget.querySelector('.hellotext--popup__completion-headline')
    const description = this.completedTarget.querySelector(
      '.hellotext--popup__completion-description',
    )

    if (headline && this.completedTarget.dataset.notRequiredHeadline) {
      headline.innerHTML = ''
      const title = document.createElement('h4')
      const strong = document.createElement('strong')
      strong.textContent = this.completedTarget.dataset.notRequiredHeadline
      title.appendChild(strong)
      headline.appendChild(title)
    }

    if (description)
      description.textContent = this.completedTarget.dataset.notRequiredDescription || ''
  }

  currentStepValid() {
    return this.currentStepInputs.every(input => input.checkValidity())
  }

  showErrorMessages(inputs) {
    inputs.forEach(input => {
      const container = input
        .closest('.hellotext--popup-field')
        ?.querySelector('[data-error-container]')
      if (!container) return

      container.textContent = input.validity.valid ? '' : input.validationMessage
    })
  }

  clearErrorMessages(inputs = this.inputTargets) {
    inputs.forEach(input => {
      const container = input
        .closest('.hellotext--popup-field')
        ?.querySelector('[data-error-container]')
      if (container) container.textContent = ''
    })
  }

  clearCustomValidity() {
    this.inputTargets.forEach(input => input.setCustomValidity(''))
  }

  async handleSubmissionError(response) {
    let data

    try {
      data = await response.json()
    } catch (_) {
      return
    }

    const errors = data.errors || []

    errors.forEach(error => {
      const input = this.inputForError(error)
      if (!input) return

      input.setCustomValidity(error.description || input.validationMessage)
      input.reportValidity()
    })

    this.showErrorMessages(this.inputTargets)
  }

  inputForError(error) {
    const parameter = error.parameter
    if (!parameter) return null

    return this.inputTargets.find(input => {
      return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter
    })
  }

  submissionPayload() {
    const payload = {
      metadata: {
        capture: this.captureValue || {},
        fields: {},
        steps: [],
      },
    }

    this.stepTargets.forEach(step => {
      const stepFields = {}
      const inputs = this.inputsForStep(step)

      inputs.forEach(input => {
        const value = this.inputValue(input)
        const key = input.dataset.popupFieldKey || input.name

        stepFields[key] = value
        payload.metadata.fields[key] = value

        if (input.dataset.popupFieldKind === 'email') payload.email = value
        if (input.dataset.popupFieldKind === 'phone') payload.phone = value
      })

      payload.metadata.steps.push({
        id: step.dataset.stepId,
        name: step.dataset.stepName,
        fields: stepFields,
      })
    })

    return payload
  }

  inputValue(input) {
    if (input.type === 'checkbox') return input.checked

    return input.value
  }

  inputsForStep(step) {
    return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId)
  }

  get identityInputs() {
    const inputs = this.inputTargets.filter(input => {
      return ['email', 'phone'].includes(input.dataset.popupFieldKind)
    })

    return inputs.filter(input => input.required).concat(inputs.filter(input => !input.required))
  }

  get completionTextTemplates() {
    if (this._completionTextTemplates) return this._completionTextTemplates

    const walker = document.createTreeWalker(this.completedTarget, NodeFilter.SHOW_TEXT)
    this._completionTextTemplates = []

    while (walker.nextNode()) {
      this._completionTextTemplates.push({
        node: walker.currentNode,
        template: walker.currentNode.nodeValue,
      })
    }

    return this._completionTextTemplates
  }

  rulesWithoutScrollPass() {
    return this.conditions
      .filter(condition => condition.type !== 'scroll_depth')
      .every(condition => this.conditionPasses(condition))
  }

  conditionPasses(condition) {
    if (condition.group === 'properties' && condition.type === 'page_property') {
      return this.pagePropertyRulePasses(condition)
    }

    if (condition.group === 'actions' && condition.type === 'viewed_popup') {
      return this.viewedPopupRulePasses(condition)
    }

    return true
  }

  pagePropertyRulePasses(condition) {
    const expected = String(condition.value || '')
      .trim()
      .toLowerCase()
    if (!expected) return true

    const actual = this.pagePropertyValue(condition.field)
    const includes = actual.includes(expected)

    return condition.query === 'does_not_contain' ? !includes : includes
  }

  pagePropertyValue(field) {
    if (field === 'url') return window.location.href.toLowerCase()
    if (field === 'title') return document.title.toLowerCase()

    return window.location.pathname.toLowerCase()
  }

  viewedPopupRulePasses(condition) {
    const viewed = this.popupWasViewed()

    return condition.inclusion === false ? !viewed : viewed
  }

  scrollRulePasses() {
    return this.scrollPercentage >= Number(this.scrollRule.value || 0)
  }

  matchesDevice() {
    if (this.deviceValue === 'all') return true
    if (this.deviceValue === 'mobile') return window.innerWidth < 768
    if (this.deviceValue === 'desktop') return window.innerWidth >= 768

    return true
  }

  markViewed() {
    try {
      localStorage.setItem(this.viewedStorageKey, 'true')
    } catch (_) {
      // Some browsers disable storage in private contexts; showing the popup is safer than crashing the page.
    }
  }

  popupWasViewed() {
    try {
      return localStorage.getItem(this.viewedStorageKey) === 'true'
    } catch (_) {
      return false
    }
  }

  showElement(element) {
    element.hidden = false
  }

  hideElement(element) {
    element.hidden = true
  }

  toggleElement(element, hidden) {
    element.hidden = hidden
  }

  get currentStep() {
    return this.stepTargets[this.stepIndex]
  }

  get currentStepInputs() {
    return this.inputsForStep(this.currentStep)
  }

  get conditions() {
    return this.rulesValue?.conditions || []
  }

  get scrollRule() {
    return this.conditions.find(
      condition => condition.group === 'actions' && condition.type === 'scroll_depth',
    )
  }

  get scrollPercentage() {
    const documentElement = document.documentElement
    const scrollableHeight = documentElement.scrollHeight - window.innerHeight

    if (scrollableHeight <= 0) return 100

    return Math.round((window.scrollY / scrollableHeight) * 100)
  }

  get viewedStorageKey() {
    return `hellotext:popup:${this.idValue}:viewed`
  }
}
