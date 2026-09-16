"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _api = _interopRequireDefault(require("../api"));
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _popup_display_rules = require("../models/popup_display_rules");
var _utm = require("../models/utm");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Public popup runtime controller.
 *
 * Renders the persisted dashboard popup on merchant sites, controls
 * bubble-to-dialog transitions, validates every step, submits the collected
 * data, and shows the completion screen.
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
 * - rules: Page-scoped display rules that survived server-side evaluation.
 */
class _default extends _stimulus.Controller {
  static targets = ['bubble', 'dialog', 'step', 'completed', 'input', 'submitButton', 'globalError', 'resendButton', 'changeDestinationButton'];
  static values = {
    capture: Object,
    device: String,
    hasBubble: Boolean,
    id: String,
    rules: Object
  };
  connect() {
    this.stepIndex = 0;
    this.resendLabel = this.hasResendButtonTarget ? this.resendButtonTarget.textContent.trim() : '';
    this.rules = new _popup_display_rules.PopupDisplayRules(this.rulesValue);
    this.connectedAt = this.pageStartedAt();
    this.hideElement(this.element);
    this.hideElement(this.dialogTarget);
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
    this.watchNavigation();
    this.watchActivities();
    this.evaluateDisplay();
    this.watchMeasurements();
  }
  disconnect() {
    this.stopResendCooldown();
    this.stopWatchingMeasurements();
    this.stopWatchingNavigation();
    this.stopWatchingActivities();
  }
  pageStartedAt() {
    const timeOrigin = window.performance?.timeOrigin;
    return Number.isFinite(timeOrigin) && timeOrigin <= Date.now() ? timeOrigin : Date.now();
  }

  /**
   * Merchant sites can be SPAs. Re-check client-side page/session rules whenever their
   * route changes, including History API navigation which does not emit a browser event.
   * The wrapper is restored only when it is still ours, so a later integration is never
   * overwritten during cleanup.
   */
  watchNavigation() {
    if (this.displayed || !this.rules.needsNavigation || this.onNavigation) return;
    this.lastLocation = window.location.href;
    this.onNavigation = () => this.scheduleNavigationEvaluation();
    this.onTurboNavigation = () => this.scheduleNavigationEvaluation(true);
    window.addEventListener('popstate', this.onNavigation);
    window.addEventListener('hashchange', this.onNavigation);
    window.addEventListener('turbo:load', this.onTurboNavigation);
    window.addEventListener('turbo:render', this.onTurboNavigation);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    let navigationActive = true;
    this.originalPushState = originalPushState;
    this.originalReplaceState = originalReplaceState;
    this.stopNavigationWrapper = () => {
      navigationActive = false;
    };
    this.patchedPushState = (...args) => {
      const result = originalPushState.apply(window.history, args);

      // A SPA can update document.title without changing the URL. History calls are an
      // explicit navigation boundary, so they must still re-evaluate title rules.
      if (navigationActive) this.scheduleNavigationEvaluation(true);
      return result;
    };
    this.patchedReplaceState = (...args) => {
      const result = originalReplaceState.apply(window.history, args);
      if (navigationActive) this.scheduleNavigationEvaluation(true);
      return result;
    };
    window.history.pushState = this.patchedPushState;
    window.history.replaceState = this.patchedReplaceState;
  }
  scheduleNavigationEvaluation(force = false) {
    this.navigationEvaluationForced ||= force;
    if (this.navigationTimer) return;
    this.navigationTimer = setTimeout(() => {
      this.navigationTimer = undefined;
      const location = window.location.href;
      if (!this.navigationEvaluationForced && location === this.lastLocation) return;
      this.navigationEvaluationForced = false;
      if (location !== this.lastLocation) _hellotext.default.recordPageView();
      this.lastLocation = location;
      this.connectedAt = Date.now();
      this.evaluateDisplay();
    });
  }
  stopWatchingNavigation() {
    this.stopNavigationWrapper?.();
    this.stopNavigationWrapper = undefined;
    if (this.onNavigation) {
      window.removeEventListener('popstate', this.onNavigation);
      window.removeEventListener('hashchange', this.onNavigation);
      this.onNavigation = undefined;
    }
    if (this.onTurboNavigation) {
      window.removeEventListener('turbo:load', this.onTurboNavigation);
      window.removeEventListener('turbo:render', this.onTurboNavigation);
      this.onTurboNavigation = undefined;
    }
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
      this.navigationTimer = undefined;
    }
    if (window.history.pushState === this.patchedPushState) {
      window.history.pushState = this.originalPushState;
    }
    if (window.history.replaceState === this.patchedReplaceState) {
      window.history.replaceState = this.originalReplaceState;
    }
    this.patchedPushState = undefined;
    this.patchedReplaceState = undefined;
    this.originalPushState = undefined;
    this.originalReplaceState = undefined;
    this.navigationEvaluationForced = false;
  }

  /**
   * Scroll depth and time on page only grow, so a popup gated on them cannot be decided
   * once on connect. Watching starts only when a rule actually needs a measurement, so a
   * popup without one adds no listeners and no timer.
   */
  watchMeasurements() {
    if (this.displayed || !this.rules.needsMeasurements) return;
    this.onScroll = () => this.evaluateDisplay();
    window.addEventListener('scroll', this.onScroll, {
      passive: true
    });
    this.measurementTimer = setInterval(() => this.evaluateDisplay(), 1000);
  }
  stopWatchingMeasurements() {
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
      this.onScroll = undefined;
    }
    if (this.measurementTimer) {
      clearInterval(this.measurementTimer);
      this.measurementTimer = undefined;
    }
  }
  watchActivities() {
    if (this.displayed || !this.rules.needsActivities || this.onActivity) return;
    this.onActivity = () => this.evaluateDisplay();
    _hellotext.default.on('activity:occurred', this.onActivity);
  }
  stopWatchingActivities() {
    if (!this.onActivity) return;
    _hellotext.default.removeEventListener('activity:occurred', this.onActivity);
    this.onActivity = undefined;
  }
  open(event) {
    if (event) event.preventDefault();
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
    this.showElement(this.dialogTarget);
    _hellotext.default.eventEmitter.dispatch('popup:opened');
  }
  close(event) {
    if (event) event.preventDefault();
    this.dismissed = true;
    this.hideElement(this.dialogTarget);
    if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
    this.hideElement(this.element);
    _hellotext.default.eventEmitter.dispatch('popup:closed');
  }
  async next(event) {
    if (event) event.preventDefault();
    this.clearCustomValidity();
    if (!this.currentStepValid()) {
      this.showErrorMessages(this.currentStepInputs);
      return;
    }
    this.clearErrorMessages(this.currentStepInputs);
    if (this.stepIndex < this.stepTargets.length - 1) {
      this.showStep(this.stepIndex + 1);
      return;
    }
    await this.submit();
  }
  async submit(event) {
    if (event) event.preventDefault();
    this.clearCustomValidity();
    if (this.stepIndex < this.stepTargets.length - 1) {
      await this.next();
      return;
    }
    if (!this.currentStepValid()) {
      this.showErrorMessages(this.currentStepInputs);
      return;
    }
    this.clearErrorMessages(this.currentStepInputs);
    this.clearGlobalError();
    this.submitButtonTargets.forEach(button => {
      button.disabled = true;
    });
    try {
      const payload = this.submissionPayload();
      const response = await _api.default.popups.submit(this.idValue, payload, this.idempotencyKeyFor(payload));
      if (response.failed) {
        await this.handleSubmissionError(response);
        return;
      }
      const submission = await response.json();
      this.submissionId = submission.id;
      this.submissionVerificationState = submission.verification_state;
      this.submissionActionToken = submission.action_token;
      this.submissionDeliveryStatus = submission.delivery_status;
      this.submissionDeliveryChannel = submission.delivery_channel;
      this.submissionDestination = submission.destination;
      this.resetSubmissionRequest();
    } catch (_) {
      this.showGlobalError();
      return;
    } finally {
      this.submitButtonTargets.forEach(button => {
        button.disabled = false;
      });
    }
    this.showCompleted();
  }
  evaluateDisplay() {
    if (this.dismissed || this.displayed || !this.matchesDevice()) {
      return;
    }
    if (!this.rules.matches(this.pageContext())) {
      return;
    }

    // A popup counts as shown only once it actually displays. Rules matching is not
    // enough: a visitor who never scrolls far enough never sees it.
    this.displayed = true;
    this.stopWatchingMeasurements();
    this.stopWatchingNavigation();
    this.stopWatchingActivities();
    this.showInitialState();
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
      pageViews: _hellotext.default.pageViews,
      language: this.browserLanguage(),
      visitorType: _hellotext.default.visitorType,
      browser: this.browserName(),
      utm: this.currentUtmParams(),
      activities: _hellotext.default.activities
    };
  }

  /**
   * The campaign this visit arrived with. A URL carrying source, medium or campaign answers
   * for itself and becomes the visit's campaign, so a SPA route that adds parameters is
   * picked up at the next evaluation.
   *
   * Without any of them in the URL the campaign the visit started with still applies, which
   * is what keeps a rule true after the site navigates past its landing URL or strips the
   * parameters from it. Persisted attribution is deliberately not the fallback: `hello_utm`
   * outlives the visit by years and would let an old campaign target a visitor who arrived
   * from somewhere else entirely.
   *
   * The URL's parameters replace the remembered ones rather than merging with them, so a
   * rule never pairs the source of one campaign with the name of another.
   */
  currentUtmParams() {
    const current = this.popupUtmParams(_utm.UTM.paramsFrom(window.location.search));
    if (Object.keys(current).length > 0) {
      _hellotext.default.rememberVisitCampaign(current);
      return current;
    }
    return this.popupUtmParams(_hellotext.default.visitCampaign);
  }

  // Only the three parameters Rules can target, without the blanks. Capitalization and `+`
  // are left alone here and settled when the values are compared, so the campaign a rule
  // holds reads the way the merchant wrote it.
  popupUtmParams(params) {
    return Object.fromEntries(Object.entries(params || {}).flatMap(([key, value]) => {
      if (!['source', 'medium', 'campaign'].includes(key) || typeof value !== 'string') return [];
      return value.trim() === '' ? [] : [[key, value.trim()]];
    }));
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
    const brands = window.navigator.userAgentData?.brands;
    if (Array.isArray(brands)) {
      const brand = brands.map(({
        brand
      }) => brand?.toLowerCase() || '');
      if (brand.some(name => name.includes('edge'))) return 'edge';
      if (brand.some(name => name.includes('chrome') || name.includes('chromium'))) return 'chrome';
    }
    const agent = window.navigator.userAgent?.toLowerCase() || '';
    if (/edg[ea]?\//.test(agent)) return 'edge';
    if (agent.includes('firefox/') || agent.includes('fxios/')) return 'firefox';
    if (agent.includes('chrome/') || agent.includes('crios/')) return 'chrome';
    if (agent.includes('safari/')) return 'safari';
    return undefined;
  }
  browserLanguage() {
    const language = window.navigator.languages?.[0] || window.navigator.language;
    return language?.split('-')[0]?.toLowerCase();
  }

  /**
   * Percentage of the document the visitor has reached, counting the viewport itself. A
   * page shorter than the viewport has nothing to scroll, so it reads as fully seen rather
   * than dividing by zero.
   */
  scrollDepth() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 100;
    const scrolled = window.scrollY / scrollable * 100;
    return Math.max(0, Math.min(100, Math.round(scrolled)));
  }
  showInitialState() {
    this.showElement(this.element);
    if (this.hasBubbleValue && this.hasBubbleTarget) {
      this.showElement(this.bubbleTarget);
      this.hideElement(this.dialogTarget);
      return;
    }
    this.showElement(this.dialogTarget);
    _hellotext.default.eventEmitter.dispatch('popup:opened');
  }
  showStep(index) {
    this.stepIndex = index;
    this.stepTargets.forEach((step, stepIndex) => {
      this.toggleElement(step, stepIndex !== index);
    });
    this.hideElement(this.completedTarget);
  }
  showCompleted() {
    this.stepTargets.forEach(step => this.hideElement(step));
    this.interpolateCompletionCopy();
    this.configureCompletionActions();
    this.showElement(this.completedTarget);
  }
  interpolateCompletionCopy() {
    const identity = this.completedIdentity;
    if (!identity) return;
    const replacements = {
      destination: identity.value,
      channel: this.submissionDeliveryChannel || identity.kind
    };
    this.completionTextTemplates.forEach(({
      node,
      template
    }) => {
      node.nodeValue = template.replace(/\{(destination|channel)\}/g, (placeholder, key) => replacements[key] || placeholder);
    });
  }
  identityValue(input) {
    const value = this.inputValue(input).trim();
    if (input.dataset.popupFieldKind !== 'phone' || value.startsWith('+')) return value;
    const prefix = input.dataset.popupPhonePrefix;
    return prefix ? `${prefix}${value.replace(/^0+/, '')}` : value;
  }
  configureCompletionActions() {
    if (this.submissionDeliveryStatus === 'not_required') {
      this.renderNoDeliveryCopy();
      this.completedTarget.querySelector('[data-delivery-actions]')?.setAttribute('hidden', '');
      return;
    }
    const identity = this.completedIdentity;
    if (!identity) return;
    if (this.hasChangeDestinationButtonTarget) {
      this.changeDestinationButtonTarget.textContent = this.changeDestinationButtonTarget.dataset[`${identity.kind}Label`];
      this.showElement(this.changeDestinationButtonTarget);
    }
    if (this.submissionId && this.submissionActionToken && this.submissionDeliveryStatus === 'queued' && this.submissionVerificationState === 'unverified' && this.hasResendButtonTarget) {
      this.showElement(this.resendButtonTarget);
      this.startResendCooldown(60);
    }
  }
  async resend(event) {
    if (event) event.preventDefault();
    if (!this.submissionId || !this.submissionActionToken || this.resendPending || this.resendCooldownActive) return;
    const identity = this.completedIdentity;
    if (!identity) return;
    this.resendPending = true;
    this.resendButtonTarget.disabled = true;
    try {
      const response = await _api.default.popups.resend(this.idValue, this.submissionId, this.submissionActionToken);
      const retryAfter = Number(response.data.headers?.get('Retry-After')) || 60;
      if (response.succeeded || response.data.status === 429) {
        this.startResendCooldown(retryAfter);
      } else {
        this.resendButtonTarget.disabled = false;
      }
    } catch (_) {
      this.resendButtonTarget.disabled = false;
    } finally {
      this.resendPending = false;
    }
  }
  async changeDestination(event) {
    if (event) event.preventDefault();
    if (!this.submissionId || !this.submissionActionToken || this.changeDestinationPending) return;
    const input = this.completedIdentity?.input;
    if (!input) return;
    const stepIndex = this.stepTargets.findIndex(step => step.dataset.stepId === input.dataset.popupStepId);
    if (stepIndex < 0) return;
    this.changeDestinationPending = true;
    this.changeDestinationButtonTarget.disabled = true;
    try {
      const response = await _api.default.popups.cancel(this.idValue, this.submissionId, this.submissionActionToken);
      if (response.failed) return;
      this.stopResendCooldown();
      this.submissionId = null;
      this.submissionActionToken = null;
      this.submissionVerificationState = null;
      this.submissionDeliveryStatus = null;
      this.submissionDeliveryChannel = null;
      this.submissionDestination = null;
      this.resetSubmissionRequest();
      this.showStep(stepIndex);
      input.focus();
    } catch (_) {
      // Keep Completed visible when cancellation cannot be confirmed. Starting
      // a replacement submission before that boundary could deliver twice.
    } finally {
      this.changeDestinationPending = false;
      this.changeDestinationButtonTarget.disabled = false;
    }
  }
  startResendCooldown(seconds) {
    this.stopResendCooldown();
    this.resendCooldownEndsAt = Date.now() + Math.max(seconds, 1) * 1000;
    this.updateResendCountdown();
    this.resendTimer = window.setInterval(() => this.updateResendCountdown(), 1000);
  }
  stopResendCooldown() {
    if (this.resendTimer) window.clearInterval(this.resendTimer);
    this.resendTimer = null;
    this.resendCooldownEndsAt = null;
  }
  updateResendCountdown() {
    const seconds = Math.max(0, Math.ceil((this.resendCooldownEndsAt - Date.now()) / 1000));
    if (seconds === 0) {
      this.stopResendCooldown();
      this.resendButtonTarget.textContent = this.resendLabel;
      this.resendButtonTarget.disabled = false;
      return;
    }
    const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    const template = this.resendButtonTarget.dataset.countdownLabel || `${this.resendLabel} %{time}`;
    this.resendButtonTarget.textContent = template.replace('%{time}', time);
    this.resendButtonTarget.disabled = true;
  }
  get resendCooldownActive() {
    return this.resendCooldownEndsAt > Date.now();
  }
  get completionIdentity() {
    return this.identityInputs.map(input => ({
      input,
      kind: input.dataset.popupFieldKind,
      value: this.identityValue(input)
    })).find(({
      value
    }) => value);
  }
  get completedIdentity() {
    if (this.submissionDestination && this.submissionDeliveryChannel) {
      const kind = this.submissionDeliveryChannel === 'email' ? 'email' : 'phone';
      const input = this.identityInputs.find(candidate => candidate.dataset.popupFieldKind === kind);
      return {
        input,
        kind,
        value: this.submissionDestination
      };
    }
    return this.completionIdentity;
  }
  renderNoDeliveryCopy() {
    const headline = this.completedTarget.querySelector('.hellotext--popup__completion-headline');
    const description = this.completedTarget.querySelector('.hellotext--popup__completion-description');
    if (headline && this.completedTarget.dataset.notRequiredHeadline) {
      headline.innerHTML = '';
      const title = document.createElement('h4');
      const strong = document.createElement('strong');
      strong.textContent = this.completedTarget.dataset.notRequiredHeadline;
      title.appendChild(strong);
      headline.appendChild(title);
    }
    if (description) description.textContent = this.completedTarget.dataset.notRequiredDescription || '';
  }
  currentStepValid() {
    return this.currentStepInputs.every(input => input.checkValidity());
  }
  showErrorMessages(inputs) {
    inputs.forEach(input => {
      const container = input.closest('.hellotext--popup-field')?.querySelector('[data-error-container]');
      if (!container) return;
      container.textContent = input.validity.valid ? '' : input.validationMessage;
    });
  }
  clearErrorMessages(inputs = this.inputTargets) {
    inputs.forEach(input => {
      const container = input.closest('.hellotext--popup-field')?.querySelector('[data-error-container]');
      if (container) container.textContent = '';
    });
  }
  clearCustomValidity() {
    this.inputTargets.forEach(input => input.setCustomValidity(''));
  }
  clearGlobalError() {
    if (!this.hasGlobalErrorTarget) return;
    this.globalErrorTarget.textContent = '';
    this.hideElement(this.globalErrorTarget);
  }
  showGlobalError(message = null) {
    if (!this.hasGlobalErrorTarget) return;
    this.globalErrorTarget.textContent = message || this.globalErrorTarget.dataset.submitError || 'Unable to submit. Please try again.';
    this.showElement(this.globalErrorTarget);
  }
  async handleSubmissionError(response) {
    let data;
    try {
      data = await response.json();
    } catch (_) {
      this.showGlobalError();
      return;
    }
    const errors = data.errors || [];
    const generalErrors = [];
    errors.forEach(error => {
      const input = this.inputForError(error);
      if (!input) {
        if (error.description) generalErrors.push(error.description);
        return;
      }
      input.setCustomValidity(error.description || input.validationMessage);
      input.reportValidity();
    });
    this.showErrorMessages(this.inputTargets);
    if (generalErrors.length) this.showGlobalError(generalErrors.join(' '));else if (!errors.length) this.showGlobalError();
  }
  inputForError(error) {
    const parameter = error.parameter;
    if (!parameter) return null;
    return this.inputTargets.find(input => {
      return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter;
    });
  }
  submissionPayload() {
    const payload = {
      metadata: {
        capture: this.captureValue || {},
        fields: {},
        steps: []
      }
    };
    this.stepTargets.forEach(step => {
      const stepFields = {};
      const inputs = this.inputsForStep(step);
      inputs.forEach(input => {
        const value = this.inputValue(input);
        const key = input.dataset.popupFieldKey || input.name;
        stepFields[key] = value;
        payload.metadata.fields[key] = value;
        if (input.dataset.popupFieldKind === 'email') payload.email = value;
        if (input.dataset.popupFieldKind === 'phone') payload.phone = value;
      });
      payload.metadata.steps.push({
        id: step.dataset.stepId,
        name: step.dataset.stepName,
        fields: stepFields
      });
    });
    return payload;
  }
  idempotencyKeyFor(payload) {
    const serializedPayload = JSON.stringify(payload);
    if (this.submissionPayloadSnapshot !== serializedPayload) {
      this.submissionPayloadSnapshot = serializedPayload;
      this.submissionIdempotencyKey = _api.default.popups.idempotencyKey();
    }
    return this.submissionIdempotencyKey;
  }
  resetSubmissionRequest() {
    this.submissionPayloadSnapshot = null;
    this.submissionIdempotencyKey = null;
  }
  inputValue(input) {
    if (input.type === 'checkbox') return input.checked;
    return input.value;
  }
  inputsForStep(step) {
    return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId);
  }
  get identityInputs() {
    const inputs = this.inputTargets.filter(input => {
      return ['email', 'phone'].includes(input.dataset.popupFieldKind);
    });
    return inputs.filter(input => input.required).concat(inputs.filter(input => !input.required));
  }
  get completionTextTemplates() {
    if (this._completionTextTemplates) return this._completionTextTemplates;
    const walker = document.createTreeWalker(this.completedTarget, NodeFilter.SHOW_TEXT);
    this._completionTextTemplates = [];
    while (walker.nextNode()) {
      this._completionTextTemplates.push({
        node: walker.currentNode,
        template: walker.currentNode.nodeValue
      });
    }
    return this._completionTextTemplates;
  }
  matchesDevice() {
    if (this.deviceValue === 'all') return true;
    if (this.deviceValue === 'mobile') return window.innerWidth < 768;
    if (this.deviceValue === 'desktop') return window.innerWidth >= 768;
    return true;
  }
  showElement(element) {
    element.hidden = false;
  }
  hideElement(element) {
    element.hidden = true;
  }
  toggleElement(element, hidden) {
    element.hidden = hidden;
  }
  get currentStep() {
    return this.stepTargets[this.stepIndex];
  }
  get currentStepInputs() {
    return this.inputsForStep(this.currentStep);
  }
}
exports.default = _default;