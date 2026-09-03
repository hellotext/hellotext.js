function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
import { Controller } from '@hotwired/stimulus';
import API from '../api';
import Hellotext from '../hellotext';

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
 */
var _default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "connect",
    value: function connect() {
      this.stepIndex = 0;
      this.resendLabel = this.hasResendButtonTarget ? this.resendButtonTarget.textContent.trim() : '';
      this.hideElement(this.element);
      this.hideElement(this.dialogTarget);
      if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
      this.evaluateDisplay();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.stopResendCooldown();
    }
  }, {
    key: "open",
    value: function open(event) {
      if (event) event.preventDefault();
      if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
      this.showElement(this.dialogTarget);
      Hellotext.eventEmitter.dispatch('popup:opened');
    }
  }, {
    key: "close",
    value: function close(event) {
      if (event) event.preventDefault();
      this.dismissed = true;
      this.hideElement(this.dialogTarget);
      if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
      this.hideElement(this.element);
      Hellotext.eventEmitter.dispatch('popup:closed');
    }
  }, {
    key: "next",
    value: function () {
      var _next2 = _asyncToGenerator(function* (event) {
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
        yield this.submit();
      });
      function next(_x) {
        return _next2.apply(this, arguments);
      }
      return next;
    }()
  }, {
    key: "submit",
    value: function () {
      var _submit = _asyncToGenerator(function* (event) {
        if (event) event.preventDefault();
        this.clearCustomValidity();
        if (this.stepIndex < this.stepTargets.length - 1) {
          yield this.next();
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
          var payload = this.submissionPayload();
          var response = yield API.popups.submit(this.idValue, payload, this.idempotencyKeyFor(payload));
          if (response.failed) {
            yield this.handleSubmissionError(response);
            return;
          }
          var submission = yield response.json();
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
      });
      function submit(_x2) {
        return _submit.apply(this, arguments);
      }
      return submit;
    }()
  }, {
    key: "evaluateDisplay",
    value: function evaluateDisplay() {
      if (this.dismissed || !this.matchesDevice()) {
        return;
      }
      this.showInitialState();
    }
  }, {
    key: "showInitialState",
    value: function showInitialState() {
      this.showElement(this.element);
      if (this.hasBubbleValue && this.hasBubbleTarget) {
        this.showElement(this.bubbleTarget);
        this.hideElement(this.dialogTarget);
        return;
      }
      this.showElement(this.dialogTarget);
      Hellotext.eventEmitter.dispatch('popup:opened');
    }
  }, {
    key: "showStep",
    value: function showStep(index) {
      this.stepIndex = index;
      this.stepTargets.forEach((step, stepIndex) => {
        this.toggleElement(step, stepIndex !== index);
      });
      this.hideElement(this.completedTarget);
    }
  }, {
    key: "showCompleted",
    value: function showCompleted() {
      this.stepTargets.forEach(step => this.hideElement(step));
      this.interpolateCompletionCopy();
      this.configureCompletionActions();
      this.showElement(this.completedTarget);
    }
  }, {
    key: "interpolateCompletionCopy",
    value: function interpolateCompletionCopy() {
      var identity = this.completedIdentity;
      if (!identity) return;
      var replacements = {
        destination: identity.value,
        channel: this.submissionDeliveryChannel || identity.kind
      };
      this.completionTextTemplates.forEach(_ref => {
        var node = _ref.node,
          template = _ref.template;
        node.nodeValue = template.replace(/\{(destination|channel)\}/g, (placeholder, key) => replacements[key] || placeholder);
      });
    }
  }, {
    key: "identityValue",
    value: function identityValue(input) {
      var value = this.inputValue(input).trim();
      if (input.dataset.popupFieldKind !== 'phone' || value.startsWith('+')) return value;
      var prefix = input.dataset.popupPhonePrefix;
      return prefix ? "".concat(prefix).concat(value.replace(/^0+/, '')) : value;
    }
  }, {
    key: "configureCompletionActions",
    value: function configureCompletionActions() {
      if (this.submissionDeliveryStatus === 'not_required') {
        var _this$completedTarget;
        this.renderNoDeliveryCopy();
        (_this$completedTarget = this.completedTarget.querySelector('[data-delivery-actions]')) === null || _this$completedTarget === void 0 || _this$completedTarget.setAttribute('hidden', '');
        return;
      }
      var identity = this.completedIdentity;
      if (!identity) return;
      if (this.hasChangeDestinationButtonTarget) {
        this.changeDestinationButtonTarget.textContent = this.changeDestinationButtonTarget.dataset["".concat(identity.kind, "Label")];
        this.showElement(this.changeDestinationButtonTarget);
      }
      if (this.submissionId && this.submissionActionToken && this.submissionDeliveryStatus === 'queued' && this.submissionVerificationState === 'unverified' && this.hasResendButtonTarget) {
        this.showElement(this.resendButtonTarget);
        this.startResendCooldown(60);
      }
    }
  }, {
    key: "resend",
    value: function () {
      var _resend = _asyncToGenerator(function* (event) {
        if (event) event.preventDefault();
        if (!this.submissionId || !this.submissionActionToken || this.resendPending || this.resendCooldownActive) return;
        var identity = this.completedIdentity;
        if (!identity) return;
        this.resendPending = true;
        this.resendButtonTarget.disabled = true;
        try {
          var _response$data$header;
          var response = yield API.popups.resend(this.idValue, this.submissionId, this.submissionActionToken);
          var retryAfter = Number((_response$data$header = response.data.headers) === null || _response$data$header === void 0 ? void 0 : _response$data$header.get('Retry-After')) || 60;
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
      });
      function resend(_x3) {
        return _resend.apply(this, arguments);
      }
      return resend;
    }()
  }, {
    key: "changeDestination",
    value: function () {
      var _changeDestination = _asyncToGenerator(function* (event) {
        var _this$completedIdenti;
        if (event) event.preventDefault();
        if (!this.submissionId || !this.submissionActionToken || this.changeDestinationPending) return;
        var input = (_this$completedIdenti = this.completedIdentity) === null || _this$completedIdenti === void 0 ? void 0 : _this$completedIdenti.input;
        if (!input) return;
        var stepIndex = this.stepTargets.findIndex(step => step.dataset.stepId === input.dataset.popupStepId);
        if (stepIndex < 0) return;
        this.changeDestinationPending = true;
        this.changeDestinationButtonTarget.disabled = true;
        try {
          var response = yield API.popups.cancel(this.idValue, this.submissionId, this.submissionActionToken);
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
      });
      function changeDestination(_x4) {
        return _changeDestination.apply(this, arguments);
      }
      return changeDestination;
    }()
  }, {
    key: "startResendCooldown",
    value: function startResendCooldown(seconds) {
      this.stopResendCooldown();
      this.resendCooldownEndsAt = Date.now() + Math.max(seconds, 1) * 1000;
      this.updateResendCountdown();
      this.resendTimer = window.setInterval(() => this.updateResendCountdown(), 1000);
    }
  }, {
    key: "stopResendCooldown",
    value: function stopResendCooldown() {
      if (this.resendTimer) window.clearInterval(this.resendTimer);
      this.resendTimer = null;
      this.resendCooldownEndsAt = null;
    }
  }, {
    key: "updateResendCountdown",
    value: function updateResendCountdown() {
      var seconds = Math.max(0, Math.ceil((this.resendCooldownEndsAt - Date.now()) / 1000));
      if (seconds === 0) {
        this.stopResendCooldown();
        this.resendButtonTarget.textContent = this.resendLabel;
        this.resendButtonTarget.disabled = false;
        return;
      }
      var time = "".concat(Math.floor(seconds / 60), ":").concat(String(seconds % 60).padStart(2, '0'));
      var template = this.resendButtonTarget.dataset.countdownLabel || "".concat(this.resendLabel, " %{time}");
      this.resendButtonTarget.textContent = template.replace('%{time}', time);
      this.resendButtonTarget.disabled = true;
    }
  }, {
    key: "resendCooldownActive",
    get: function get() {
      return this.resendCooldownEndsAt > Date.now();
    }
  }, {
    key: "completionIdentity",
    get: function get() {
      return this.identityInputs.map(input => ({
        input,
        kind: input.dataset.popupFieldKind,
        value: this.identityValue(input)
      })).find(_ref2 => {
        var value = _ref2.value;
        return value;
      });
    }
  }, {
    key: "completedIdentity",
    get: function get() {
      if (this.submissionDestination && this.submissionDeliveryChannel) {
        var kind = this.submissionDeliveryChannel === 'email' ? 'email' : 'phone';
        var input = this.identityInputs.find(candidate => candidate.dataset.popupFieldKind === kind);
        return {
          input,
          kind,
          value: this.submissionDestination
        };
      }
      return this.completionIdentity;
    }
  }, {
    key: "renderNoDeliveryCopy",
    value: function renderNoDeliveryCopy() {
      var headline = this.completedTarget.querySelector('.hellotext--popup__completion-headline');
      var description = this.completedTarget.querySelector('.hellotext--popup__completion-description');
      if (headline && this.completedTarget.dataset.notRequiredHeadline) {
        headline.innerHTML = '';
        var title = document.createElement('h4');
        var strong = document.createElement('strong');
        strong.textContent = this.completedTarget.dataset.notRequiredHeadline;
        title.appendChild(strong);
        headline.appendChild(title);
      }
      if (description) description.textContent = this.completedTarget.dataset.notRequiredDescription || '';
    }
  }, {
    key: "currentStepValid",
    value: function currentStepValid() {
      return this.currentStepInputs.every(input => input.checkValidity());
    }
  }, {
    key: "showErrorMessages",
    value: function showErrorMessages(inputs) {
      inputs.forEach(input => {
        var _input$closest;
        var container = (_input$closest = input.closest('.hellotext--popup-field')) === null || _input$closest === void 0 ? void 0 : _input$closest.querySelector('[data-error-container]');
        if (!container) return;
        container.textContent = input.validity.valid ? '' : input.validationMessage;
      });
    }
  }, {
    key: "clearErrorMessages",
    value: function clearErrorMessages() {
      var inputs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.inputTargets;
      inputs.forEach(input => {
        var _input$closest2;
        var container = (_input$closest2 = input.closest('.hellotext--popup-field')) === null || _input$closest2 === void 0 ? void 0 : _input$closest2.querySelector('[data-error-container]');
        if (container) container.textContent = '';
      });
    }
  }, {
    key: "clearCustomValidity",
    value: function clearCustomValidity() {
      this.inputTargets.forEach(input => input.setCustomValidity(''));
    }
  }, {
    key: "clearGlobalError",
    value: function clearGlobalError() {
      if (!this.hasGlobalErrorTarget) return;
      this.globalErrorTarget.textContent = '';
      this.hideElement(this.globalErrorTarget);
    }
  }, {
    key: "showGlobalError",
    value: function showGlobalError() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!this.hasGlobalErrorTarget) return;
      this.globalErrorTarget.textContent = message || this.globalErrorTarget.dataset.submitError || 'Unable to submit. Please try again.';
      this.showElement(this.globalErrorTarget);
    }
  }, {
    key: "handleSubmissionError",
    value: function () {
      var _handleSubmissionError = _asyncToGenerator(function* (response) {
        var data;
        try {
          data = yield response.json();
        } catch (_) {
          this.showGlobalError();
          return;
        }
        var errors = data.errors || [];
        var generalErrors = [];
        errors.forEach(error => {
          var input = this.inputForError(error);
          if (!input) {
            if (error.description) generalErrors.push(error.description);
            return;
          }
          input.setCustomValidity(error.description || input.validationMessage);
          input.reportValidity();
        });
        this.showErrorMessages(this.inputTargets);
        if (generalErrors.length) this.showGlobalError(generalErrors.join(' '));else if (!errors.length) this.showGlobalError();
      });
      function handleSubmissionError(_x5) {
        return _handleSubmissionError.apply(this, arguments);
      }
      return handleSubmissionError;
    }()
  }, {
    key: "inputForError",
    value: function inputForError(error) {
      var parameter = error.parameter;
      if (!parameter) return null;
      return this.inputTargets.find(input => {
        return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter;
      });
    }
  }, {
    key: "submissionPayload",
    value: function submissionPayload() {
      var payload = {
        metadata: {
          capture: this.captureValue || {},
          fields: {},
          steps: []
        }
      };
      this.stepTargets.forEach(step => {
        var stepFields = {};
        var inputs = this.inputsForStep(step);
        inputs.forEach(input => {
          var value = this.inputValue(input);
          var key = input.dataset.popupFieldKey || input.name;
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
  }, {
    key: "idempotencyKeyFor",
    value: function idempotencyKeyFor(payload) {
      var serializedPayload = JSON.stringify(payload);
      if (this.submissionPayloadSnapshot !== serializedPayload) {
        this.submissionPayloadSnapshot = serializedPayload;
        this.submissionIdempotencyKey = API.popups.idempotencyKey();
      }
      return this.submissionIdempotencyKey;
    }
  }, {
    key: "resetSubmissionRequest",
    value: function resetSubmissionRequest() {
      this.submissionPayloadSnapshot = null;
      this.submissionIdempotencyKey = null;
    }
  }, {
    key: "inputValue",
    value: function inputValue(input) {
      if (input.type === 'checkbox') return input.checked;
      return input.value;
    }
  }, {
    key: "inputsForStep",
    value: function inputsForStep(step) {
      return this.inputTargets.filter(input => input.dataset.popupStepId === step.dataset.stepId);
    }
  }, {
    key: "identityInputs",
    get: function get() {
      var inputs = this.inputTargets.filter(input => {
        return ['email', 'phone'].includes(input.dataset.popupFieldKind);
      });
      return inputs.filter(input => input.required).concat(inputs.filter(input => !input.required));
    }
  }, {
    key: "completionTextTemplates",
    get: function get() {
      if (this._completionTextTemplates) return this._completionTextTemplates;
      var walker = document.createTreeWalker(this.completedTarget, NodeFilter.SHOW_TEXT);
      this._completionTextTemplates = [];
      while (walker.nextNode()) {
        this._completionTextTemplates.push({
          node: walker.currentNode,
          template: walker.currentNode.nodeValue
        });
      }
      return this._completionTextTemplates;
    }
  }, {
    key: "matchesDevice",
    value: function matchesDevice() {
      if (this.deviceValue === 'all') return true;
      if (this.deviceValue === 'mobile') return window.innerWidth < 768;
      if (this.deviceValue === 'desktop') return window.innerWidth >= 768;
      return true;
    }
  }, {
    key: "showElement",
    value: function showElement(element) {
      element.hidden = false;
    }
  }, {
    key: "hideElement",
    value: function hideElement(element) {
      element.hidden = true;
    }
  }, {
    key: "toggleElement",
    value: function toggleElement(element, hidden) {
      element.hidden = hidden;
    }
  }, {
    key: "currentStep",
    get: function get() {
      return this.stepTargets[this.stepIndex];
    }
  }, {
    key: "currentStepInputs",
    get: function get() {
      return this.inputsForStep(this.currentStep);
    }
  }]);
}(Controller);
_default.targets = ['bubble', 'dialog', 'step', 'completed', 'input', 'submitButton', 'globalError', 'resendButton', 'changeDestinationButton'];
_default.values = {
  capture: Object,
  device: String,
  hasBubble: Boolean,
  id: String
};
export { _default as default };