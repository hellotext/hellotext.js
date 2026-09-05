"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _popups = _interopRequireDefault(require("../api/popups"));
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
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
 *
 * Values:
 * - capture: Capture metadata supplied by the server and included in submissions.
 * - device: Popup device targeting.
 * - hasBubble: Whether the popup starts from a bubble.
 * - id: Public popup identifier.
 */
let _default = /*#__PURE__*/function (_Controller) {
  _inherits(_default, _Controller);
  var _super = _createSuper(_default);
  function _default() {
    _classCallCheck(this, _default);
    return _super.apply(this, arguments);
  }
  _createClass(_default, [{
    key: "initialize",
    value:
    /**
     * Establish progress and preserve the original resend label once per instance.
     * Keeping this outside connect() avoids resetting progress or capturing the
     * temporary countdown text when Stimulus reconnects the same controller.
     *
     * @returns {void}
     */
    function initialize() {
      this.stepIndex = 0;
      this.resendLabel = this.hasResendButtonTarget ? this.resendButtonTarget.textContent.trim() : '';
    }

    /**
     * Announce that the popup has joined the DOM before applying the display policy.
     * Mounting does not imply dialog visibility: the server supplies hidden markup,
     * and device targeting or bubble mode may keep the dialog closed.
     *
     * @returns {void}
     */
  }, {
    key: "connect",
    value: function connect() {
      _hellotext.default.eventEmitter.dispatch('popup:mounted');
      this.evaluateDisplay();
    }

    /**
     * Stop the countdown interval when detached so it does not keep updating old DOM.
     *
     * @returns {void}
     */
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.stopResendCooldown();
    }

    /**
     * Replace the launcher with the dialog inside an already eligible popup.
     * Subscribers are notified when the dialog is revealed, not when the bubble appears.
     *
     * @param {Event} [event] - Optional launcher interaction whose default action is prevented.
     * @returns {void}
     */
  }, {
    key: "open",
    value: function open(event) {
      if (event) event.preventDefault();
      if (this.hasBubbleTarget) this.bubbleTarget.hidden = true;
      this.dialogTarget.hidden = false;
      _hellotext.default.eventEmitter.dispatch('popup:opened');
    }

    /**
     * Dismiss the entire popup and remember that choice for this controller instance.
     * Closing changes visibility; it does not cancel a submission or its delivery.
     *
     * @param {Event} [event] - Optional close-button interaction.
     * @returns {void}
     */
  }, {
    key: "close",
    value: function close(event) {
      if (event) event.preventDefault();
      this.dismissed = true;
      this.dialogTarget.hidden = true;
      if (this.hasBubbleTarget) this.bubbleTarget.hidden = true;
      this.element.hidden = true;
      _hellotext.default.eventEmitter.dispatch('popup:closed');
    }

    /**
     * Validate the current step before advancing, or submit if this is the final step.
     * Clear previous server validity errors first so corrected values can be checked.
     *
     * @param {Event} [event] - Optional step-button interaction.
     * @returns {Promise<void>}
     */
  }, {
    key: "next",
    value: async function next(event) {
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

    /**
     * Send the collected steps only after the final step passes validation.
     * Earlier form submissions act as Next, preserving the same progression for Enter
     * and button clicks. Failures leave the form available for a deliberate retry.
     *
     * @param {Event} [event] - Optional form submission or final-button interaction.
     * @returns {Promise<void>}
     */
  }, {
    key: "submit",
    value: async function submit(event) {
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
        const response = await _popups.default.submit(this.idValue, payload, this.idempotencyKeyFor(payload));
        if (response.failed) {
          await this.handleSubmissionError(response);
          return;
        }

        // Keep the backend's chosen route and action token together. Resend and edit
        // must act on this accepted submission, even if a fallback route was selected.
        const submission = await response.json();
        this.submissionId = submission.id;
        this.submissionVerificationState = submission.verification_state;
        this.submissionActionToken = submission.action_token;
        this.submissionDeliveryStatus = submission.delivery_status;
        this.submissionDeliveryChannel = submission.delivery_channel;
        this.submissionDestination = submission.destination;
        this.resetSubmissionRequest();
      } catch (_) {
        // The server may have accepted a request whose response was lost. Retain the
        // payload's idempotency key so another attempt can recover that submission.
        this.showGlobalError();
        return;
      } finally {
        this.submitButtonTargets.forEach(button => {
          button.disabled = false;
        });
      }
      this.showCompleted();
    }

    /**
     * Apply dismissal and viewport eligibility before revealing any popup surface.
     * Hide the root on rejection so this also works after a previously visible mount.
     *
     * @returns {void}
     */
  }, {
    key: "evaluateDisplay",
    value: function evaluateDisplay() {
      if (this.dismissed || !this.matchesDevice()) {
        this.element.hidden = true;
        return;
      }
      this.showInitialState();
    }

    /**
     * Choose the launcher or immediate dialog without resetting entered form values.
     * Set both surface states explicitly because a reconnect can reuse modified DOM.
     * Bubble display alone does not emit the dialog's popup:opened event.
     *
     * @returns {void}
     */
  }, {
    key: "showInitialState",
    value: function showInitialState() {
      this.element.hidden = false;
      if (this.hasBubbleValue && this.hasBubbleTarget) {
        this.bubbleTarget.hidden = false;
        this.dialogTarget.hidden = true;
        return;
      }
      if (this.hasBubbleTarget) this.bubbleTarget.hidden = true;
      this.dialogTarget.hidden = false;
      _hellotext.default.eventEmitter.dispatch('popup:opened');
    }

    /**
     * Reveal one existing step and leave completion, preserving all collected values.
     * Also used after confirmed cancellation to return to the destination's own step.
     *
     * @param {number} index - Zero-based index of a step in the rendered flow.
     * @returns {void}
     */
  }, {
    key: "showStep",
    value: function showStep(index) {
      this.stepIndex = index;
      this.stepTargets.forEach((step, stepIndex) => {
        step.hidden = stepIndex !== index;
      });
      this.completedTarget.hidden = true;
    }

    /**
     * Replace the form steps with the result of an accepted submission.
     * Completion reflects the response received so far; it does not assert that
     * delivery or verification has finished, and it does not poll for later changes.
     *
     * @returns {void}
     */
  }, {
    key: "showCompleted",
    value: function showCompleted() {
      this.stepTargets.forEach(step => {
        step.hidden = true;
      });
      this.interpolateCompletionCopy();
      this.configureCompletionActions();
      this.completedTarget.hidden = false;
    }

    /**
     * Fill destination/channel placeholders while preserving the server's rich markup.
     * Replace text nodes from saved templates so visitor values stay text and a later
     * corrected destination can replace the original placeholders again.
     *
     * @returns {void}
     */
  }, {
    key: "interpolateCompletionCopy",
    value: function interpolateCompletionCopy() {
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

    /**
     * Format a local identity for completion copy when backend route data is absent.
     * Phone prefixes and leading-zero removal apply only to this display fallback;
     * submissionPayload() still sends the original field value.
     *
     * @param {PopupInput} input - Email or phone field containing a string value.
     * @returns {string} Trimmed identity with the configured phone prefix when needed.
     */
  }, {
    key: "identityValue",
    value: function identityValue(input) {
      const value = this.inputValue(input).trim();
      if (input.dataset.popupFieldKind !== 'phone' || value.startsWith('+')) return value;
      const prefix = input.dataset.popupPhonePrefix;
      return prefix ? `${prefix}${value.replace(/^0+/, '')}` : value;
    }

    /**
     * Configure follow-up actions from the backend's delivery and verification state.
     * Contact-only submissions show saved-details copy. Queued, unverified deliveries
     * with an action token expose resend after the initial one-minute cooldown.
     *
     * @returns {void}
     */
  }, {
    key: "configureCompletionActions",
    value: function configureCompletionActions() {
      if (this.submissionDeliveryStatus === 'not_required') {
        var _this$completedTarget;
        this.renderNoDeliveryCopy();
        (_this$completedTarget = this.completedTarget.querySelector('[data-delivery-actions]')) === null || _this$completedTarget === void 0 ? void 0 : _this$completedTarget.setAttribute('hidden', '');
        return;
      }
      const identity = this.completedIdentity;
      if (!identity) return;
      if (this.hasChangeDestinationButtonTarget) {
        this.changeDestinationButtonTarget.textContent = this.changeDestinationButtonTarget.dataset[`${identity.kind}Label`];
        this.changeDestinationButtonTarget.hidden = false;
      }
      if (this.submissionId && this.submissionActionToken && this.submissionDeliveryStatus === 'queued' && this.submissionVerificationState === 'unverified' && this.hasResendButtonTarget) {
        this.resendButtonTarget.hidden = false;
        this.startResendCooldown(60);
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
  }, {
    key: "resend",
    value: async function resend(event) {
      if (event) event.preventDefault();
      if (!this.submissionId || !this.submissionActionToken || this.resendPending || this.resendCooldownActive) return;
      const identity = this.completedIdentity;
      if (!identity) return;
      this.resendPending = true;
      this.resendButtonTarget.disabled = true;
      try {
        var _response$data$header;
        const response = await _popups.default.resend(this.idValue, this.submissionId, this.submissionActionToken);
        const retryAfter = Number((_response$data$header = response.data.headers) === null || _response$data$header === void 0 ? void 0 : _response$data$header.get('Retry-After')) || 60;
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

    /**
     * Cancel the accepted submission before allowing its destination to be edited.
     * Returning to the form before confirmation could create a replacement while the
     * previous submission remains deliverable. On failure, keep its state and the
     * completion screen; on success, focus the field matching the backend's route.
     *
     * @param {Event} [event] - Optional change-email or change-phone interaction.
     * @returns {Promise<void>}
     */
  }, {
    key: "changeDestination",
    value: async function changeDestination(event) {
      var _this$completedIdenti;
      if (event) event.preventDefault();
      if (!this.submissionId || !this.submissionActionToken || this.changeDestinationPending) return;
      const input = (_this$completedIdenti = this.completedIdentity) === null || _this$completedIdenti === void 0 ? void 0 : _this$completedIdenti.input;
      if (!input) return;
      const stepIndex = this.stepTargets.findIndex(step => step.dataset.stepId === input.dataset.popupStepId);
      if (stepIndex < 0) return;
      this.changeDestinationPending = true;
      this.changeDestinationButtonTarget.disabled = true;
      try {
        const response = await _popups.default.cancel(this.idValue, this.submissionId, this.submissionActionToken);
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

    /**
     * Replace any countdown and immediately reflect its remaining time in the button.
     * Store a deadline rather than decrementing a counter so delayed timer callbacks
     * do not lengthen the cooldown when the browser throttles background tabs.
     *
     * @param {number} seconds - Cooldown duration, clamped to at least one second.
     * @returns {void}
     */
  }, {
    key: "startResendCooldown",
    value: function startResendCooldown(seconds) {
      this.stopResendCooldown();
      this.resendCooldownEndsAt = Date.now() + Math.max(seconds, 1) * 1000;
      this.updateResendCountdown();
      this.resendTimer = window.setInterval(() => this.updateResendCountdown(), 1000);
    }

    /**
     * Clear the timer and deadline. Callers own the next button or screen state;
     * stopping a timer during disconnect or cancellation must not reveal UI itself.
     *
     * @returns {void}
     */
  }, {
    key: "stopResendCooldown",
    value: function stopResendCooldown() {
      if (this.resendTimer) window.clearInterval(this.resendTimer);
      this.resendTimer = null;
      this.resendCooldownEndsAt = null;
    }

    /**
     * Render the localized remaining time, or restore the original label on expiry.
     * Recompute from the deadline on each tick instead of assuming ticks are punctual.
     *
     * @returns {void}
     */
  }, {
    key: "updateResendCountdown",
    value: function updateResendCountdown() {
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

    /**
     * Check the deadline independently of whether the latest timer tick has run.
     *
     * @returns {boolean} Whether a resend is still blocked by the local cooldown.
     */
  }, {
    key: "resendCooldownActive",
    get: function () {
      return this.resendCooldownEndsAt > Date.now();
    }

    /**
     * Choose a populated local identity when no backend destination is available.
     * Required fields take precedence; optional identities are a fallback.
     *
     * @returns {PopupIdentity | undefined} First populated identity in priority order.
     */
  }, {
    key: "completionIdentity",
    get: function () {
      return this.identityInputs.map(input => ({
        input,
        kind: input.dataset.popupFieldKind,
        value: this.identityValue(input)
      })).find(({
        value
      }) => value);
    }

    /**
     * Prefer the backend's actual destination so fallback delivery is represented
     * accurately. Map non-email delivery channels, such as SMS or WhatsApp, back to
     * the phone field for editing; retain the actual channel separately for copy.
     *
     * @returns {PopupIdentity | undefined} Backend identity or the local display fallback.
     */
  }, {
    key: "completedIdentity",
    get: function () {
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

    /**
     * Use server-provided thank-you copy when capture succeeds without any delivery.
     * Construct text nodes so these labels are not interpreted as rich HTML.
     *
     * @returns {void}
     */
  }, {
    key: "renderNoDeliveryCopy",
    value: function renderNoDeliveryCopy() {
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

    /**
     * Apply the browser's constraints only to the step the visitor is completing.
     * Required fields in later, hidden steps must not block earlier progression.
     *
     * @returns {boolean} Whether every input associated with the current step is valid.
     */
  }, {
    key: "currentStepValid",
    value: function currentStepValid() {
      return this.currentStepInputs.every(input => input.checkValidity());
    }

    /**
     * Mirror native/custom validity messages into the server's inline error containers.
     * Valid fields clear their old message; fields without a container are skipped.
     *
     * @param {PopupInput[]} inputs - Fields whose current validity should be displayed.
     * @returns {void}
     */
  }, {
    key: "showErrorMessages",
    value: function showErrorMessages(inputs) {
      inputs.forEach(input => {
        var _input$closest;
        const container = (_input$closest = input.closest('.hellotext--popup-field')) === null || _input$closest === void 0 ? void 0 : _input$closest.querySelector('[data-error-container]');
        if (!container) return;
        container.textContent = input.validity.valid ? '' : input.validationMessage;
      });
    }

    /**
     * Remove displayed field errors without changing values or validity constraints.
     *
     * @param {PopupInput[]} [inputs=this.inputTargets] - Fields to clear, defaulting to all.
     * @returns {void}
     */
  }, {
    key: "clearErrorMessages",
    value: function clearErrorMessages(inputs = this.inputTargets) {
      inputs.forEach(input => {
        var _input$closest2;
        const container = (_input$closest2 = input.closest('.hellotext--popup-field')) === null || _input$closest2 === void 0 ? void 0 : _input$closest2.querySelector('[data-error-container]');
        if (container) container.textContent = '';
      });
    }

    /**
     * Remove server-set validity messages before validating a fresh attempt.
     * Native constraints remain active; stale custom errors must not reject edits.
     *
     * @returns {void}
     */
  }, {
    key: "clearCustomValidity",
    value: function clearCustomValidity() {
      this.inputTargets.forEach(input => input.setCustomValidity(''));
    }

    /**
     * Clear and hide the optional form-level error before a new submission attempt.
     *
     * @returns {void}
     */
  }, {
    key: "clearGlobalError",
    value: function clearGlobalError() {
      if (!this.hasGlobalErrorTarget) return;
      this.globalErrorTarget.textContent = '';
      this.globalErrorTarget.hidden = true;
    }

    /**
     * Show a form-level failure with the server's localized fallback when needed.
     * Render messages as text, and tolerate markup without a global-error target.
     *
     * @param {string | null} [message=null] - Specific error, or no value for fallback copy.
     * @returns {void}
     */
  }, {
    key: "showGlobalError",
    value: function showGlobalError(message = null) {
      if (!this.hasGlobalErrorTarget) return;
      this.globalErrorTarget.textContent = message || this.globalErrorTarget.dataset.submitError || 'Unable to submit. Please try again.';
      this.globalErrorTarget.hidden = false;
    }

    /**
     * Route backend errors to matching fields or the form-level error container.
     * Unreadable JSON or an empty errors list uses generic copy when the server
     * cannot provide a structured validation explanation.
     *
     * @param {import('../api/response').Response} response - Failed submission response.
     * @returns {Promise<void>}
     */
  }, {
    key: "handleSubmissionError",
    value: async function handleSubmissionError(response) {
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

    /**
     * Match both built-in identity names and custom property keys in backend errors.
     * Missing or unmatched parameters belong to the form-level error path.
     *
     * @param {PopupSubmissionError} error - Error identifying a field when possible.
     * @returns {PopupInput | null | undefined} Matching input, or no match.
     */
  }, {
    key: "inputForError",
    value: function inputForError(error) {
      const parameter = error.parameter;
      if (!parameter) return null;
      return this.inputTargets.find(input => {
        return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter;
      });
    }

    /**
     * Collect the whole flow while preserving the dashboard's field and step identity.
     * Top-level email/phone support backend identity handling; metadata retains all
     * values, including custom properties and checkboxes, with their step context.
     *
     * @returns {PopupSubmissionPayload} Collected data before the API adds session context.
     */
  }, {
    key: "submissionPayload",
    value: function submissionPayload() {
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

    /**
     * Reuse the request key while the serialized payload remains unchanged.
     * A failed or unreadable response does not prove the submission was rejected;
     * retaining the key lets a manual retry recover the same server-side operation.
     * Changed values represent a new attempt and receive a fresh key.
     *
     * @param {PopupSubmissionPayload} payload - Data about to be submitted.
     * @returns {string} Key associated with this controller's current payload snapshot.
     */
  }, {
    key: "idempotencyKeyFor",
    value: function idempotencyKeyFor(payload) {
      const serializedPayload = JSON.stringify(payload);
      if (this.submissionPayloadSnapshot !== serializedPayload) {
        this.submissionPayloadSnapshot = serializedPayload;
        this.submissionIdempotencyKey = _popups.default.idempotencyKey();
      }
      return this.submissionIdempotencyKey;
    }

    /**
     * Forget the retry identity after a parsed success or confirmed cancellation.
     * Failures intentionally keep it, because the backend may already have accepted
     * the request even though the visitor has not received its response.
     *
     * @returns {void}
     */
  }, {
    key: "resetSubmissionRequest",
    value: function resetSubmissionRequest() {
      this.submissionPayloadSnapshot = null;
      this.submissionIdempotencyKey = null;
    }

    /**
     * Preserve checkbox choices as booleans and other values as entered strings.
     * Reading checkbox.value would lose whether the visitor actually checked it.
     *
     * @param {PopupInput} input - Field to read without mutating its value.
     * @returns {string | boolean} Submitted representation of the field's current value.
     */
  }, {
    key: "inputValue",
    value: function inputValue(input) {
      if (input.type === 'checkbox') return input.checked;
      return input.value;
    }

    /**
     * Associate inputs through the server's step IDs rather than DOM nesting.
     * Layout wrappers can change without changing validation or payload grouping.
     *
     * @param {HTMLElement} step - Step carrying a data-step-id attribute.
     * @returns {PopupInput[]} Inputs whose data-popup-step-id matches this step.
     */
  }, {
    key: "inputsForStep",
    value: function inputsForStep(step) {
      return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId);
    }

    /**
     * Prioritize required email/phone fields for local completion identity selection.
     * Preserve DOM order within the required and optional groups.
     *
     * @returns {PopupInput[]} Identity fields ordered by required status, then DOM order.
     */
  }, {
    key: "identityInputs",
    get: function () {
      const inputs = this.inputTargets.filter(input => {
        return ['email', 'phone'].includes(input.dataset.popupFieldKind);
      });
      return inputs.filter(input => input.required).concat(inputs.filter(input => !input.required));
    }

    /**
     * Snapshot completion text nodes before the first placeholder replacement.
     * Reusing the original templates supports a corrected destination on a later
     * submission while preserving surrounding markup and existing DOM references.
     *
     * @returns {Array<{node: Text, template: string}>} Cached nodes and their original text.
     */
  }, {
    key: "completionTextTemplates",
    get: function () {
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

    /**
     * Evaluate the dashboard's device target against the current viewport.
     * The 768px split matches the API's automatic device selection; all or unspecified
     * targets are unrestricted. This check runs when called, not on a resize listener.
     *
     * @returns {boolean} Whether this viewport is eligible to display the popup.
     */
  }, {
    key: "matchesDevice",
    value: function matchesDevice() {
      if (this.deviceValue === 'all') return true;
      if (this.deviceValue === 'mobile') return window.innerWidth < 768;
      if (this.deviceValue === 'desktop') return window.innerWidth >= 768;
      return true;
    }

    /**
     * Resolve the active step from the server-rendered sequence and local progress.
     *
     * @returns {HTMLElement | undefined} Step at the current index, if present.
     */
  }, {
    key: "currentStep",
    get: function () {
      return this.stepTargets[this.stepIndex];
    }

    /**
     * Select the active step's fields for progression validation and inline errors.
     * Requires a current step; the server renders this controller only for a flow
     * with steps, and navigation selects indices from that rendered sequence.
     *
     * @returns {PopupInput[]} Fields associated with the current step.
     */
  }, {
    key: "currentStepInputs",
    get: function () {
      return this.inputsForStep(this.currentStep);
    }
  }]);
  return _default;
}(_stimulus.Controller);
exports.default = _default;
_default.targets = ['bubble', 'dialog', 'step', 'completed', 'input', 'submitButton', 'globalError', 'resendButton', 'changeDestinationButton'];
_default.values = {
  capture: Object,
  device: String,
  hasBubble: Boolean,
  id: String
};