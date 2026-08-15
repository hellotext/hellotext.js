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
 * - delay: Seconds to wait before evaluating automatic display rules.
 * - device: Popup device targeting.
 * - hasBubble: Whether the popup starts from a bubble.
 * - id: Public popup identifier.
 * - rules: Persisted AND display rules.
 */
export default class extends Controller {
  static targets = ['bubble', 'dialog', 'step', 'completed', 'globalError', 'input', 'submitButton']
  static values = {
    capture: Object,
    delay: Number,
    device: String,
    hasBubble: Boolean,
    id: String,
    rules: Object,
  }

  connect() {
    this.stepIndex = 0
    this.idempotencyKey = null
    this.onScroll = this.evaluateDisplay.bind(this)

    this.hideElement(this.element)
    this.hideElement(this.dialogTarget)
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget)

    if (this.hasBubbleValue || !this.delayValue) {
      this.evaluateDisplay()
    } else {
      this.displayTimeout = window.setTimeout(() => this.evaluateDisplay(), this.delayValue * 1000)
    }
  }

  disconnect() {
    window.clearTimeout(this.displayTimeout)
    window.removeEventListener('scroll', this.onScroll)
  }

  open(event) {
    if (event) event.preventDefault()

    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget)
    this.showElement(this.dialogTarget)
    this.markViewed()
  }

  close(event) {
    if (event) event.preventDefault()

    this.hideElement(this.dialogTarget)

    if (this.hasBubbleValue && this.hasBubbleTarget) {
      this.showElement(this.element)
      this.showElement(this.bubbleTarget)
    } else {
      this.hideElement(this.element)
    }
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

    this.clearGlobalError()
    if (!this.currentStepValid()) {
      this.showErrorMessages(this.currentStepInputs)
      return
    }

    this.clearErrorMessages(this.currentStepInputs)

    this.submitButtonTargets.forEach(button => {
      button.disabled = true
    })

    const payload = this.submissionPayload()
    const response = await API.popups.submit(this.idValue, payload, this.currentIdempotencyKey)

    this.submitButtonTargets.forEach(button => {
      button.disabled = false
    })

    if (response.failed) {
      if (response.data?.status === 409) this.idempotencyKey = null
      await this.handleSubmissionError(response)
      return
    }

    this.interpolateCompletion(payload)
    this.idempotencyKey = null
    this.showCompleted()
  }

  evaluateDisplay() {
    if (!this.matchesDevice() || !this.rulesWithoutScrollPass()) return

    if (this.scrollRule && !this.scrollRulePasses()) {
      window.addEventListener('scroll', this.onScroll, { passive: true })
      return
    }

    window.removeEventListener('scroll', this.onScroll)
    this.showInitialState()
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
    this.showElement(this.completedTarget)
  }

  currentStepValid() {
    return this.currentStepInputs.every(input => input.checkValidity())
  }

  showErrorMessages(inputs) {
    inputs.forEach(input => {
      const container = input.closest('.hellotext--popup-field')?.querySelector('[data-error-container]')
      if (!container) return

      container.textContent = input.validity.valid ? '' : input.validationMessage
    })
  }

  clearErrorMessages(inputs = this.inputTargets) {
    inputs.forEach(input => {
      const container = input.closest('.hellotext--popup-field')?.querySelector('[data-error-container]')
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
      this.showGlobalError()
      return
    }

    const errors = data.errors || []
    let fieldErrorShown = false

    errors.forEach(error => {
      const input = this.inputForError(error)
      if (!input) return

      input.setCustomValidity(error.description || input.validationMessage)
      input.reportValidity()
      fieldErrorShown = true
    })

    this.showErrorMessages(this.inputTargets)

    if (!fieldErrorShown) {
      this.showGlobalError(errors.map(error => error.description).filter(Boolean).join(' '))
    }
  }

  showGlobalError(message = '') {
    if (!this.hasGlobalErrorTarget) return

    this.globalErrorTarget.textContent = message || 'We could not submit the popup. Please try again.'
    this.showElement(this.globalErrorTarget)
  }

  clearGlobalError() {
    if (!this.hasGlobalErrorTarget) return

    this.globalErrorTarget.textContent = ''
    this.hideElement(this.globalErrorTarget)
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

  interpolateCompletion(payload) {
    const destination = payload.email || payload.phone || ''
    const channel = payload.email ? 'email' : payload.phone ? 'SMS' : ''
    const replacements = {
      '{destination}': destination,
      '{channel}': channel,
    }
    const walker = document.createTreeWalker(this.completedTarget, NodeFilter.SHOW_TEXT)
    const nodes = []

    while (walker.nextNode()) nodes.push(walker.currentNode)

    nodes.forEach(node => {
      node.textContent = Object.entries(replacements).reduce(
        (text, [placeholder, value]) => text.split(placeholder).join(value),
        node.textContent,
      )
    })
  }

  inputsForStep(step) {
    return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId)
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
    const expected = String(condition.value || '').trim().toLowerCase()
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
    return this.conditions.find(condition => condition.group === 'actions' && condition.type === 'scroll_depth')
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

  get currentIdempotencyKey() {
    this.idempotencyKey ||= this.generateIdempotencyKey()

    return this.idempotencyKey
  }

  generateIdempotencyKey() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  }
}
