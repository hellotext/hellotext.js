import { Controller } from '@hotwired/stimulus'

import PopupsAPI from '../api/popups'
import Hellotext from '../hellotext'
import { PopupDisplayRules } from '../models/popup_display_rules'
import { UTM } from '../models/utm'

/**
 * An input rendered by the popup's server-side field components.
 *
 * @typedef {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} PopupInput
 */

/**
 * Identity used for completion copy and for locating the field to edit.
 * A backend destination may have no matching input in the rendered form.
 *
 * @typedef {Object} PopupIdentity
 * @property {PopupInput | undefined} input - Field associated with the destination.
 * @property {'email' | 'phone'} kind - Field kind, distinct from the delivery channel.
 * @property {string} value - Destination to display to the visitor.
 */

/**
 * Collected values retain both field lookup and their original step grouping.
 * Checkbox values are booleans; other field values remain strings.
 *
 * @typedef {Object} PopupSubmissionPayload
 * @property {string} [email] - Email input value for backend identity handling.
 * @property {string} [phone] - Phone input value for backend identity handling.
 * @property {Object} metadata
 * @property {Object<string, *>} metadata.capture - Capture metadata supplied by the server.
 * @property {Object<string, string | boolean>} metadata.fields - Values keyed by field identifier.
 * @property {Array<{id: string, name: string, fields: Object<string, string | boolean>}>} metadata.steps
 */

/**
 * A backend validation error, optionally associated with a built-in or custom field.
 *
 * @typedef {Object} PopupSubmissionError
 * @property {string} [parameter] - Built-in field kind or custom property identifier.
 * @property {string} [description] - Message suitable for displaying to the visitor.
 */

/**
 * Controls a dashboard popup rendered by Popup::RuntimeComponent on merchant sites.
 *
 * The server owns the markup, styling, and initial hidden attributes: the bubble,
 * dialog, later steps, and completion state arrive hidden. This controller chooses
 * when to reveal them and manages the visitor's progress through the existing DOM.
 * State initialized here belongs to one controller instance, not persistent storage.
 *
 * A successful submission opens the completion screen even when verification is
 * pending. The backend owns delivery routing and verification; this controller
 * displays the returned state and requests resends or cancellation using its token.
 *
 * Targets:
 * - bubble: Launcher shown before the popup when bubble mode is enabled.
 * - dialog: Popup dialog/surface wrapper.
 * - step: Sequential form steps.
 * - completed: Completion state shown after submission.
 * - input: User-entered popup fields.
 * - submitButton: Step buttons disabled while the submission is in flight.
 * - globalError: Submission errors that cannot be shown beside an input.
 * - resendButton: Delivery resend action and its localized countdown label.
 * - changeDestinationButton: Action that returns to the delivered-to identity field.
 * - deliveryCopy: Completion headline and description shown when a delivery is queued.
 * - noDeliveryCopy: Server-rendered completion copy shown when no delivery is required.
 *
 * Values:
 * - capture: Capture metadata supplied by the server and included in submissions.
 * - device: Popup device targeting.
 * - hasBubble: Whether the popup starts from a bubble.
 * - id: Public popup identifier.
 * - rules: Page-scoped display rules that survived server-side evaluation.
 */
export default class extends Controller {
  static targets = [
    'bubble',
    'dialog',
    'step',
    'completed',
    'input',
    'submitButton',
    'globalError',
    'resendButton',
    'changeDestinationButton',
    'deliveryCopy',
    'noDeliveryCopy',
  ]

  static values = {
    capture: Object,
    device: String,
    hasBubble: Boolean,
    id: String,
    frequency: String,
    frequencyDays: Number,
    rules: Object,
  }

  /**
   * Establish progress and preserve the original resend label once per instance.
   * Keeping this outside connect() avoids resetting progress or capturing the
   * temporary countdown text when Stimulus reconnects the same controller.
   *
   * @returns {void}
   */
  initialize() {
    this.stepIndex = 0
    this.resendLabel = this.hasResendButtonTarget ? this.resendButtonTarget.textContent.trim() : ''
    this.rules = new PopupDisplayRules(this.rulesValue)
    this.connectedAt = this.pageStartedAt()
  }

  /**
   * Announce that the popup has joined the DOM before applying the display policy.
   * Mounting does not imply dialog visibility: the server supplies hidden markup,
   * and device targeting or bubble mode may keep the dialog closed.
   *
   * @returns {void}
   */
  connect() {
    Hellotext.eventEmitter.dispatch('popup:mounted')

    if (!this.frequencyAllowsDisplay()) return

    this.watchNavigation()
    this.watchActivities()
    this.evaluateDisplay()
    this.watchMeasurements()
  }

  /**
   * Stop the countdown interval when detached so it does not keep updating old DOM.
   *
   * @returns {void}
   */
  disconnect() {
    this.stopResendCooldown()
    this.stopWatchingMeasurements()
    this.stopWatchingNavigation()
    this.stopWatchingActivities()
  }

  pageStartedAt() {
    const timeOrigin = window.performance?.timeOrigin

    return Number.isFinite(timeOrigin) && timeOrigin <= Date.now() ? timeOrigin : Date.now()
  }

  /**
   * Merchant sites can be SPAs. Re-check client-side page/session rules whenever their
   * route changes, including History API navigation which does not emit a browser event.
   * The wrapper is restored only when it is still ours, so a later integration is never
   * overwritten during cleanup.
   */
  watchNavigation() {
    if (this.displayed || !this.rules.needsNavigation || this.onNavigation) return

    this.lastLocation = window.location.href
    this.onNavigation = () => this.scheduleNavigationEvaluation()
    this.onTurboNavigation = () => this.scheduleNavigationEvaluation(true)

    window.addEventListener('popstate', this.onNavigation)
    window.addEventListener('hashchange', this.onNavigation)
    window.addEventListener('turbo:load', this.onTurboNavigation)
    window.addEventListener('turbo:render', this.onTurboNavigation)

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    let navigationActive = true

    this.originalPushState = originalPushState
    this.originalReplaceState = originalReplaceState
    this.stopNavigationWrapper = () => {
      navigationActive = false
    }
    this.patchedPushState = (...args) => {
      const result = originalPushState.apply(window.history, args)

      // A SPA can update document.title without changing the URL. History calls are an
      // explicit navigation boundary, so they must still re-evaluate title rules.
      if (navigationActive) this.scheduleNavigationEvaluation(true)
      return result
    }
    this.patchedReplaceState = (...args) => {
      const result = originalReplaceState.apply(window.history, args)

      if (navigationActive) this.scheduleNavigationEvaluation(true)
      return result
    }
    window.history.pushState = this.patchedPushState
    window.history.replaceState = this.patchedReplaceState
  }

  scheduleNavigationEvaluation(force = false) {
    this.navigationEvaluationForced ||= force
    if (this.navigationTimer) return

    this.navigationTimer = setTimeout(() => {
      this.navigationTimer = undefined

      const location = window.location.href
      if (!this.navigationEvaluationForced && location === this.lastLocation) return

      this.navigationEvaluationForced = false
      if (location !== this.lastLocation) Hellotext.recordPageView()
      this.lastLocation = location
      this.connectedAt = Date.now()
      this.evaluateDisplay()
    })
  }

  stopWatchingNavigation() {
    this.stopNavigationWrapper?.()
    this.stopNavigationWrapper = undefined

    if (this.onNavigation) {
      window.removeEventListener('popstate', this.onNavigation)
      window.removeEventListener('hashchange', this.onNavigation)
      this.onNavigation = undefined
    }
    if (this.onTurboNavigation) {
      window.removeEventListener('turbo:load', this.onTurboNavigation)
      window.removeEventListener('turbo:render', this.onTurboNavigation)
      this.onTurboNavigation = undefined
    }
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer)
      this.navigationTimer = undefined
    }
    if (window.history.pushState === this.patchedPushState) {
      window.history.pushState = this.originalPushState
    }
    if (window.history.replaceState === this.patchedReplaceState) {
      window.history.replaceState = this.originalReplaceState
    }

    this.patchedPushState = undefined
    this.patchedReplaceState = undefined
    this.originalPushState = undefined
    this.originalReplaceState = undefined
    this.navigationEvaluationForced = false
  }

  /**
   * Scroll depth and time on page only grow, so a popup gated on them cannot be decided
   * once on connect. Watching starts only when a rule actually needs a measurement, so a
   * popup without one adds no listeners and no timer.
   */
  watchMeasurements() {
    if (this.displayed || !this.rules.needsMeasurements) return

    this.onScroll = () => this.evaluateDisplay()
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.measurementTimer = setInterval(() => this.evaluateDisplay(), 1000)
  }

  stopWatchingMeasurements() {
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll)
      this.onScroll = undefined
    }

    if (this.measurementTimer) {
      clearInterval(this.measurementTimer)
      this.measurementTimer = undefined
    }
  }

  watchActivities() {
    if (this.displayed || !this.rules.needsActivities || this.onActivity) return

    this.onActivity = () => this.evaluateDisplay()
    Hellotext.on('activity:occurred', this.onActivity)
  }

  stopWatchingActivities() {
    if (!this.onActivity) return

    Hellotext.removeEventListener('activity:occurred', this.onActivity)
    this.onActivity = undefined
  }

  /**
   * Replace the launcher with the dialog inside an already eligible popup.
   * Subscribers are notified when the dialog is revealed, not when the bubble appears.
   *
   * @param {Event} [event] - Optional launcher interaction whose default action is prevented.
   * @returns {void}
   */
  open(event) {
    if (event) event.preventDefault()
    if (this.hasBubbleTarget) this.bubbleTarget.hidden = true

    this.dialogTarget.hidden = false
    Hellotext.eventEmitter.dispatch('popup:opened')
  }

  /**
   * Dismiss the entire popup and remember that choice for this controller instance.
   * Closing changes visibility; it does not cancel a submission or its delivery.
   *
   * @param {Event} [event] - Optional close-button interaction.
   * @returns {void}
   */
  close(event) {
    if (event) event.preventDefault()

    this.dismissed = true
    this.dialogTarget.hidden = true

    if (this.hasBubbleTarget) this.bubbleTarget.hidden = true

    this.element.hidden = true
    Hellotext.eventEmitter.dispatch('popup:closed')
  }

  /**
   * Validate the current step before advancing, or submit if this is the final step.
   * Clear previous server validity errors first so corrected values can be checked.
   *
   * @param {Event} [event] - Optional step-button interaction.
   * @returns {Promise<void>}
   */
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

  /**
   * Send the collected steps only after the final step passes validation.
   * Earlier form submissions act as Next, preserving the same progression for Enter
   * and button clicks. Failures leave the form available for a deliberate retry.
   *
   * @param {Event} [event] - Optional form submission or final-button interaction.
   * @returns {Promise<void>}
   */
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
    this.clearGlobalError()

    this.submitButtonTargets.forEach(button => {
      button.disabled = true
    })

    try {
      const payload = this.submissionPayload()
      const response = await PopupsAPI.submit(
        this.idValue,
        payload,
        this.idempotencyKeyFor(payload),
      )

      if (response.failed) {
        await this.handleSubmissionError(response)
        return
      }

      // Keep the backend's chosen route and action token together. Resend and edit
      // must act on this accepted submission, even if a fallback route was selected.
      const submission = await response.json()
      this.submissionId = submission.id
      this.submissionVerificationState = submission.verification_state
      this.submissionActionToken = submission.action_token
      this.submissionDeliveryStatus = submission.delivery_status
      this.submissionDeliveryChannel = submission.delivery_channel
      this.submissionDestination = submission.destination
      this.resetSubmissionRequest()
    } catch (_) {
      // The server may have accepted a request whose response was lost. Retain the
      // payload's idempotency key so another attempt can recover that submission.
      this.showGlobalError()
      return
    } finally {
      this.submitButtonTargets.forEach(button => {
        button.disabled = false
      })
    }

    this.showCompleted()
  }

  /**
   * Apply dismissal and viewport eligibility before revealing any popup surface.
   * Hide the root on rejection so this also works after a previously visible mount.
   *
   * @returns {void}
   */
  evaluateDisplay() {
    if (
      this.dismissed ||
      this.displayed ||
      !this.matchesDevice() ||
      !this.frequencyAllowsDisplay()
    ) {
      this.element.hidden = true
      return
    }

    if (!this.rules.matches(this.pageContext())) {
      this.element.hidden = true
      return
    }

    // A popup counts as shown only once it actually displays. Rules matching is not
    // enough: a visitor who never scrolls far enough never sees it, and must not be
    // recorded as having been shown.
    this.displayed = true
    this.recordDisplay()
    this.stopWatchingMeasurements()
    this.stopWatchingNavigation()
    this.stopWatchingActivities()
    this.showInitialState()
  }

  pageContext() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer || undefined,
      scrollDepth: this.scrollDepth(),
      timeOnPage: Math.floor((Date.now() - this.connectedAt) / 1000),
      pageViews: Hellotext.pageViews,
      language: this.browserLanguage(),
      visitorType: Hellotext.visitorType,
      browser: this.browserName(),
      utm: this.currentUtmParams(),
      activities: Hellotext.activities,
    }
  }

  /**
   * The campaign behind the page the visitor is on now. A URL carrying source, medium or
   * campaign answers for itself: persisted attribution only stores a complete source and
   * medium pair, while a rule may target any one of the three. Reading the URL at each
   * evaluation also keeps a SPA route that adds UTM parameters in step.
   *
   * The URL's parameters replace the stored ones rather than merging with them, so a rule
   * never pairs the source of one campaign with the name of another. Without any in the
   * URL, the last persisted touch still applies.
   */
  currentUtmParams() {
    const current = UTM.paramsFrom(window.location.search)
    const carriesCampaign = ['source', 'medium', 'campaign'].some(key => current[key])

    return carriesCampaign ? current : Hellotext.page?.utmParams || {}
  }

  /**
   * Names the browser, or nothing when it is not one of the four the catalog offers.
   *
   * User-Agent Client Hints answer this without parsing when they exist. Where they do not
   * — Safari and Firefox — the user agent string is the only source, and its order matters:
   * Edge claims to be Chrome, and Chrome claims to be Safari. Testing from the most
   * specific claim to the least is what keeps each from answering for the others.
   *
   * An unrecognised browser reports nothing rather than a guess, so `is` never matches on a
   * mistake and `is not` never excludes on one.
   */
  browserName() {
    const brands = window.navigator.userAgentData?.brands
    if (Array.isArray(brands)) {
      const brand = brands.map(({ brand }) => brand?.toLowerCase() || '')
      if (brand.some(name => name.includes('edge'))) return 'edge'
      if (brand.some(name => name.includes('chrome') || name.includes('chromium'))) return 'chrome'
    }

    const agent = window.navigator.userAgent?.toLowerCase() || ''
    if (/edg[ea]?\//.test(agent)) return 'edge'
    if (agent.includes('firefox/') || agent.includes('fxios/')) return 'firefox'
    if (agent.includes('chrome/') || agent.includes('crios/')) return 'chrome'
    if (agent.includes('safari/')) return 'safari'

    return undefined
  }

  browserLanguage() {
    const language = window.navigator.languages?.[0] || window.navigator.language

    return language?.split('-')[0]?.toLowerCase()
  }

  frequencyAllowsDisplay() {
    const frequency = this.frequencyValue || 'always'
    const key = this.frequencyStorageKey

    if (frequency === 'always') return true
    if (frequency === 'once_per_session') return !this.storageValue(window.sessionStorage, key)

    const shownAt = Number(this.storageValue(window.localStorage, key))
    if (frequency === 'once_per_visitor') return !shownAt
    if (frequency !== 'every_n_days' || !this.hasFrequencyDaysValue) return false

    return !shownAt || Date.now() - shownAt >= this.frequencyDaysValue * 86_400_000
  }

  recordDisplay() {
    const frequency = this.frequencyValue || 'always'
    if (frequency === 'always') return

    const storage = frequency === 'once_per_session' ? window.sessionStorage : window.localStorage

    try {
      storage.setItem(this.frequencyStorageKey, String(Date.now()))
    } catch (_) {
      // Frequency limits fail open when the browser blocks storage.
    }
  }

  storageValue(storage, key) {
    try {
      return storage.getItem(key)
    } catch (_) {
      return null
    }
  }

  get frequencyStorageKey() {
    return `hellotext:popup:${this.idValue}:shown`
  }

  /**
   * Percentage of the document the visitor has reached, counting the viewport itself. A
   * page shorter than the viewport has nothing to scroll, so it reads as fully seen rather
   * than dividing by zero.
   */
  scrollDepth() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight

    if (scrollable <= 0) return 100

    const scrolled = (window.scrollY / scrollable) * 100

    return Math.max(0, Math.min(100, Math.round(scrolled)))
  }

  /**
   * Choose the launcher or immediate dialog without resetting entered form values.
   * Set both surface states explicitly because a reconnect can reuse modified DOM.
   * Bubble display alone does not emit the dialog's popup:opened event.
   *
   * @returns {void}
   */
  showInitialState() {
    this.element.hidden = false

    if (this.hasBubbleValue && this.hasBubbleTarget) {
      this.bubbleTarget.hidden = false
      this.dialogTarget.hidden = true
      return
    }

    if (this.hasBubbleTarget) this.bubbleTarget.hidden = true

    this.dialogTarget.hidden = false
    Hellotext.eventEmitter.dispatch('popup:opened')
  }

  /**
   * Reveal one existing step and leave completion, preserving all collected values.
   * Also used after confirmed cancellation to return to the destination's own step.
   *
   * @param {number} index - Zero-based index of a step in the rendered flow.
   * @returns {void}
   */
  showStep(index) {
    this.stepIndex = index

    this.stepTargets.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== index
    })

    this.completedTarget.hidden = true
  }

  /**
   * Replace the form steps with the result of an accepted submission.
   * Completion reflects the response received so far; it does not assert that
   * delivery or verification has finished, and it does not poll for later changes.
   *
   * @returns {void}
   */
  showCompleted() {
    this.stepTargets.forEach(step => {
      step.hidden = true
    })

    this.interpolateCompletionCopy()
    this.configureCompletionActions()

    this.completedTarget.hidden = false
  }

  /**
   * Fill destination/channel placeholders while preserving the server's rich markup.
   * Replace text nodes from saved templates so visitor values stay text and a later
   * corrected destination can replace the original placeholders again.
   *
   * @returns {void}
   */
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

  /**
   * Format a local identity for completion copy when backend route data is absent.
   * Phone prefixes and leading-zero removal apply only to this display fallback;
   * submissionPayload() still sends the original field value.
   *
   * @param {PopupInput} input - Email or phone field containing a string value.
   * @returns {string} Trimmed identity with the configured phone prefix when needed.
   */
  identityValue(input) {
    const value = this.inputValue(input).trim()
    if (input.dataset.popupFieldKind !== 'phone' || value.startsWith('+')) return value

    const prefix = input.dataset.popupPhonePrefix

    return prefix ? `${prefix}${value.replace(/^0+/, '')}` : value
  }

  /**
   * Configure follow-up actions from the backend's delivery and verification state.
   * Contact-only submissions show saved-details copy. Queued, unverified deliveries
   * with an action token expose resend after the initial one-minute cooldown.
   *
   * @returns {void}
   */
  configureCompletionActions() {
    const deliveryRequired = this.submissionDeliveryStatus !== 'not_required'
    this.revealCompletionCopy(deliveryRequired)

    if (!deliveryRequired) {
      this.completedTarget.querySelector('[data-delivery-actions]')?.setAttribute('hidden', '')
      return
    }

    const identity = this.completedIdentity
    if (!identity) return

    if (this.hasChangeDestinationButtonTarget) {
      this.changeDestinationButtonTarget.textContent =
        this.changeDestinationButtonTarget.dataset[`${identity.kind}Label`]
      this.changeDestinationButtonTarget.hidden = false
    }

    if (
      this.submissionId &&
      this.submissionActionToken &&
      this.submissionDeliveryStatus === 'queued' &&
      this.submissionVerificationState === 'unverified' &&
      this.hasResendButtonTarget
    ) {
      this.resendButtonTarget.hidden = false
      this.startResendCooldown(60)
    }
  }

  /**
   * Request another delivery for the accepted submission using its action token.
   * No edited destination is sent: the backend retains ownership of the route.
   * Ignore repeated clicks while pending or cooling down; honor Retry-After on
   * success or rate limiting, and allow a manual retry after other failures.
   *
   * @param {Event} [event] - Optional resend-button interaction.
   * @returns {Promise<void>}
   */
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
      const response = await PopupsAPI.resend(
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

  /**
   * Cancel the accepted submission before allowing its destination to be edited.
   * Returning to the form before confirmation could create a replacement while the
   * previous submission remains deliverable. On failure, keep its state and the
   * completion screen; on success, focus the field matching the backend's route.
   *
   * @param {Event} [event] - Optional change-email or change-phone interaction.
   * @returns {Promise<void>}
   */
  async changeDestination(event) {
    if (event) event.preventDefault()
    if (!this.submissionId || !this.submissionActionToken || this.changeDestinationPending) return

    const input = this.completedIdentity?.input
    if (!input) return

    const stepIndex = this.stepTargets.findIndex(
      step => step.dataset.stepId === input.dataset.popupStepId,
    )
    if (stepIndex < 0) return

    this.changeDestinationPending = true
    this.changeDestinationButtonTarget.disabled = true

    try {
      const response = await PopupsAPI.cancel(
        this.idValue,
        this.submissionId,
        this.submissionActionToken,
      )
      if (response.failed) return

      this.stopResendCooldown()
      this.submissionId = null
      this.submissionActionToken = null
      this.submissionVerificationState = null
      this.submissionDeliveryStatus = null
      this.submissionDeliveryChannel = null
      this.submissionDestination = null
      this.resetSubmissionRequest()
      this.showStep(stepIndex)
      input.focus()
    } catch (_) {
      // Keep Completed visible when cancellation cannot be confirmed. Starting
      // a replacement submission before that boundary could deliver twice.
    } finally {
      this.changeDestinationPending = false
      this.changeDestinationButtonTarget.disabled = false
    }
  }

  /**
   * Replace any countdown and immediately reflect its remaining time in the button.
   * Store a deadline rather than decrementing a counter so delayed timer callbacks
   * do not lengthen the cooldown when the browser throttles background tabs.
   *
   * @param {number} seconds - Cooldown duration, clamped to at least one second.
   * @returns {void}
   */
  startResendCooldown(seconds) {
    this.stopResendCooldown()
    this.resendCooldownEndsAt = Date.now() + Math.max(seconds, 1) * 1000
    this.updateResendCountdown()
    this.resendTimer = window.setInterval(() => this.updateResendCountdown(), 1000)
  }

  /**
   * Clear the timer and deadline. Callers own the next button or screen state;
   * stopping a timer during disconnect or cancellation must not reveal UI itself.
   *
   * @returns {void}
   */
  stopResendCooldown() {
    if (this.resendTimer) window.clearInterval(this.resendTimer)
    this.resendTimer = null
    this.resendCooldownEndsAt = null
  }

  /**
   * Render the localized remaining time, or restore the original label on expiry.
   * Recompute from the deadline on each tick instead of assuming ticks are punctual.
   *
   * @returns {void}
   */
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

  /**
   * Check the deadline independently of whether the latest timer tick has run.
   *
   * @returns {boolean} Whether a resend is still blocked by the local cooldown.
   */
  get resendCooldownActive() {
    return this.resendCooldownEndsAt > Date.now()
  }

  /**
   * Choose a populated local identity when no backend destination is available.
   * Required fields take precedence; optional identities are a fallback.
   *
   * @returns {PopupIdentity | undefined} First populated identity in priority order.
   */
  get completionIdentity() {
    return this.identityInputs
      .map(input => ({
        input,
        kind: input.dataset.popupFieldKind,
        value: this.identityValue(input),
      }))
      .find(({ value }) => value)
  }

  /**
   * Prefer the backend's actual destination so fallback delivery is represented
   * accurately. Map non-email delivery channels, such as SMS or WhatsApp, back to
   * the phone field for editing; retain the actual channel separately for copy.
   *
   * @returns {PopupIdentity | undefined} Backend identity or the local display fallback.
   */
  get completedIdentity() {
    if (this.submissionDestination && this.submissionDeliveryChannel) {
      const kind = this.submissionDeliveryChannel === 'email' ? 'email' : 'phone'
      const input = this.identityInputs.find(candidate => candidate.dataset.popupFieldKind === kind)

      return { input, kind, value: this.submissionDestination }
    }

    return this.completionIdentity
  }

  /**
   * Reveal the completion copy that matches the delivery outcome. The server renders both
   * variants and owns their markup; the controller only chooses which one is visible, so
   * no completion structure is built here and interpolated text nodes are never replaced.
   *
   * @param {boolean} deliveryRequired - Whether the submission queued a delivery.
   * @returns {void}
   */
  revealCompletionCopy(deliveryRequired) {
    if (this.hasDeliveryCopyTarget) {
      this.deliveryCopyTargets.forEach(element => {
        element.hidden = !deliveryRequired
      })
    }

    if (this.hasNoDeliveryCopyTarget) {
      this.noDeliveryCopyTargets.forEach(element => {
        element.hidden = deliveryRequired
      })
    }
  }

  /**
   * Apply the browser's constraints only to the step the visitor is completing.
   * Required fields in later, hidden steps must not block earlier progression.
   *
   * @returns {boolean} Whether every input associated with the current step is valid.
   */
  currentStepValid() {
    return this.currentStepInputs.every(input => input.checkValidity())
  }

  /**
   * Mirror native/custom validity messages into the server's inline error containers.
   * Valid fields clear their old message; fields without a container are skipped.
   *
   * @param {PopupInput[]} inputs - Fields whose current validity should be displayed.
   * @returns {void}
   */
  showErrorMessages(inputs) {
    inputs.forEach(input => {
      const container = input
        .closest('.hellotext--popup-field')
        ?.querySelector('[data-error-container]')
      if (!container) return

      container.textContent = input.validity.valid ? '' : input.validationMessage
    })
  }

  /**
   * Remove displayed field errors without changing values or validity constraints.
   *
   * @param {PopupInput[]} [inputs=this.inputTargets] - Fields to clear, defaulting to all.
   * @returns {void}
   */
  clearErrorMessages(inputs = this.inputTargets) {
    inputs.forEach(input => {
      const container = input
        .closest('.hellotext--popup-field')
        ?.querySelector('[data-error-container]')
      if (container) container.textContent = ''
    })
  }

  /**
   * Remove server-set validity messages before validating a fresh attempt.
   * Native constraints remain active; stale custom errors must not reject edits.
   *
   * @returns {void}
   */
  clearCustomValidity() {
    this.inputTargets.forEach(input => input.setCustomValidity(''))
  }

  /**
   * Clear and hide the optional form-level error before a new submission attempt.
   *
   * @returns {void}
   */
  clearGlobalError() {
    if (!this.hasGlobalErrorTarget) return

    this.globalErrorTarget.textContent = ''
    this.globalErrorTarget.hidden = true
  }

  /**
   * Show a form-level failure with the server's localized fallback when needed.
   * Render messages as text, and tolerate markup without a global-error target.
   *
   * @param {string | null} [message=null] - Specific error, or no value for fallback copy.
   * @returns {void}
   */
  showGlobalError(message = null) {
    if (!this.hasGlobalErrorTarget) return

    this.globalErrorTarget.textContent =
      message || this.globalErrorTarget.dataset.submitError || 'Unable to submit. Please try again.'
    this.globalErrorTarget.hidden = false
  }

  /**
   * Route backend errors to matching fields or the form-level error container.
   * Unreadable JSON or an empty errors list uses generic copy when the server
   * cannot provide a structured validation explanation.
   *
   * @param {import('../api/response').Response} response - Failed submission response.
   * @returns {Promise<void>}
   */
  async handleSubmissionError(response) {
    let data

    try {
      data = await response.json()
    } catch (_) {
      this.showGlobalError()
      return
    }

    const errors = data.errors || []
    const generalErrors = []

    errors.forEach(error => {
      const input = this.inputForError(error)
      if (!input) {
        if (error.description) generalErrors.push(error.description)
        return
      }

      input.setCustomValidity(error.description || input.validationMessage)
      input.reportValidity()
    })

    this.showErrorMessages(this.inputTargets)
    if (generalErrors.length) this.showGlobalError(generalErrors.join(' '))
    else if (!errors.length) this.showGlobalError()
  }

  /**
   * Match both built-in identity names and custom property keys in backend errors.
   * Missing or unmatched parameters belong to the form-level error path.
   *
   * @param {PopupSubmissionError} error - Error identifying a field when possible.
   * @returns {PopupInput | null | undefined} Matching input, or no match.
   */
  inputForError(error) {
    const parameter = error.parameter
    if (!parameter) return null

    return this.inputTargets.find(input => {
      return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter
    })
  }

  /**
   * Collect the whole flow while preserving the dashboard's field and step identity.
   * Top-level email/phone support backend identity handling; metadata retains all
   * values, including custom properties and checkboxes, with their step context.
   *
   * @returns {PopupSubmissionPayload} Collected data before the API adds session context.
   */
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

  /**
   * Reuse the request key while the serialized payload remains unchanged.
   * A failed or unreadable response does not prove the submission was rejected;
   * retaining the key lets a manual retry recover the same server-side operation.
   * Changed values represent a new attempt and receive a fresh key.
   *
   * @param {PopupSubmissionPayload} payload - Data about to be submitted.
   * @returns {string} Key associated with this controller's current payload snapshot.
   */
  idempotencyKeyFor(payload) {
    const serializedPayload = JSON.stringify(payload)

    if (this.submissionPayloadSnapshot !== serializedPayload) {
      this.submissionPayloadSnapshot = serializedPayload
      this.submissionIdempotencyKey = PopupsAPI.idempotencyKey()
    }

    return this.submissionIdempotencyKey
  }

  /**
   * Forget the retry identity after a parsed success or confirmed cancellation.
   * Failures intentionally keep it, because the backend may already have accepted
   * the request even though the visitor has not received its response.
   *
   * @returns {void}
   */
  resetSubmissionRequest() {
    this.submissionPayloadSnapshot = null
    this.submissionIdempotencyKey = null
  }

  /**
   * Preserve checkbox choices as booleans and other values as entered strings.
   * Reading checkbox.value would lose whether the visitor actually checked it.
   *
   * @param {PopupInput} input - Field to read without mutating its value.
   * @returns {string | boolean} Submitted representation of the field's current value.
   */
  inputValue(input) {
    if (input.type === 'checkbox') return input.checked

    return input.value
  }

  /**
   * Associate inputs through the server's step IDs rather than DOM nesting.
   * Layout wrappers can change without changing validation or payload grouping.
   *
   * @param {HTMLElement} step - Step carrying a data-step-id attribute.
   * @returns {PopupInput[]} Inputs whose data-popup-step-id matches this step.
   */
  inputsForStep(step) {
    return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId)
  }

  /**
   * Prioritize required email/phone fields for local completion identity selection.
   * Preserve DOM order within the required and optional groups.
   *
   * @returns {PopupInput[]} Identity fields ordered by required status, then DOM order.
   */
  get identityInputs() {
    const inputs = this.inputTargets.filter(input => {
      return ['email', 'phone'].includes(input.dataset.popupFieldKind)
    })

    return inputs.filter(input => input.required).concat(inputs.filter(input => !input.required))
  }

  /**
   * Snapshot completion text nodes before the first placeholder replacement.
   * Reusing the original templates supports a corrected destination on a later
   * submission while preserving surrounding markup and existing DOM references.
   *
   * @returns {Array<{node: Text, template: string}>} Cached nodes and their original text.
   */
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

  /**
   * Evaluate the dashboard's device target against the current viewport.
   * The 768px split matches the API's automatic device selection; all or unspecified
   * targets are unrestricted. This check runs when called, not on a resize listener.
   *
   * @returns {boolean} Whether this viewport is eligible to display the popup.
   */
  matchesDevice() {
    if (this.deviceValue === 'all') return true
    if (this.deviceValue === 'mobile') return window.innerWidth < 768
    if (this.deviceValue === 'desktop') return window.innerWidth >= 768

    return true
  }

  /**
   * Resolve the active step from the server-rendered sequence and local progress.
   *
   * @returns {HTMLElement | undefined} Step at the current index, if present.
   */
  get currentStep() {
    return this.stepTargets[this.stepIndex]
  }

  /**
   * Select the active step's fields for progression validation and inline errors.
   * Requires a current step; the server renders this controller only for a flow
   * with steps, and navigation selects indices from that rendered sequence.
   *
   * @returns {PopupInput[]} Fields associated with the current step.
   */
  get currentStepInputs() {
    return this.inputsForStep(this.currentStep)
  }
}
