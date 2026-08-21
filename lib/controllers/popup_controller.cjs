"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
let _default = exports.default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "connect",
    value: function connect() {
      this.stepIndex = 0;
      this.onScroll = this.evaluateDisplay.bind(this);
      this.hideElement(this.element);
      this.hideElement(this.dialogTarget);
      if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
      this.evaluateDisplay();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      window.removeEventListener('scroll', this.onScroll);
    }
  }, {
    key: "open",
    value: function open(event) {
      if (event) event.preventDefault();
      if (this.hasBubbleTarget) this.hideElement(this.bubbleTarget);
      this.showElement(this.dialogTarget);
      this.markViewed();
    }
  }, {
    key: "close",
    value: function close(event) {
      if (event) event.preventDefault();
      this.hideElement(this.dialogTarget);
      if (this.hasBubbleValue && this.hasBubbleTarget) {
        this.showElement(this.element);
        this.showElement(this.bubbleTarget);
      } else {
        this.hideElement(this.element);
      }
    }
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
      this.submitButtonTargets.forEach(button => {
        button.disabled = true;
      });
      const response = await _api.default.popups.submit(this.idValue, this.submissionPayload());
      this.submitButtonTargets.forEach(button => {
        button.disabled = false;
      });
      if (response.failed) {
        await this.handleSubmissionError(response);
        return;
      }
      this.showCompleted();
    }
  }, {
    key: "evaluateDisplay",
    value: function evaluateDisplay() {
      if (!this.matchesDevice() || !this.rulesWithoutScrollPass()) return;
      if (this.scrollRule && !this.scrollRulePasses()) {
        window.addEventListener('scroll', this.onScroll, {
          passive: true
        });
        return;
      }
      window.removeEventListener('scroll', this.onScroll);
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
      this.markViewed();
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
      this.showElement(this.completedTarget);
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
        const container = (_input$closest = input.closest('.hellotext--popup-field')) === null || _input$closest === void 0 ? void 0 : _input$closest.querySelector('[data-error-container]');
        if (!container) return;
        container.textContent = input.validity.valid ? '' : input.validationMessage;
      });
    }
  }, {
    key: "clearErrorMessages",
    value: function clearErrorMessages(inputs = this.inputTargets) {
      inputs.forEach(input => {
        var _input$closest2;
        const container = (_input$closest2 = input.closest('.hellotext--popup-field')) === null || _input$closest2 === void 0 ? void 0 : _input$closest2.querySelector('[data-error-container]');
        if (container) container.textContent = '';
      });
    }
  }, {
    key: "clearCustomValidity",
    value: function clearCustomValidity() {
      this.inputTargets.forEach(input => input.setCustomValidity(''));
    }
  }, {
    key: "handleSubmissionError",
    value: async function handleSubmissionError(response) {
      let data;
      try {
        data = await response.json();
      } catch (_) {
        return;
      }
      const errors = data.errors || [];
      errors.forEach(error => {
        const input = this.inputForError(error);
        if (!input) return;
        input.setCustomValidity(error.description || input.validationMessage);
        input.reportValidity();
      });
      this.showErrorMessages(this.inputTargets);
    }
  }, {
    key: "inputForError",
    value: function inputForError(error) {
      const parameter = error.parameter;
      if (!parameter) return null;
      return this.inputTargets.find(input => {
        return input.dataset.popupFieldKind === parameter || input.dataset.popupFieldKey === parameter;
      });
    }
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
    key: "rulesWithoutScrollPass",
    value: function rulesWithoutScrollPass() {
      return this.conditions.filter(condition => condition.type !== 'scroll_depth').every(condition => this.conditionPasses(condition));
    }
  }, {
    key: "conditionPasses",
    value: function conditionPasses(condition) {
      if (condition.group === 'properties' && condition.type === 'page_property') {
        return this.pagePropertyRulePasses(condition);
      }
      if (condition.group === 'actions' && condition.type === 'viewed_popup') {
        return this.viewedPopupRulePasses(condition);
      }
      return true;
    }
  }, {
    key: "pagePropertyRulePasses",
    value: function pagePropertyRulePasses(condition) {
      const expected = String(condition.value || '').trim().toLowerCase();
      if (!expected) return true;
      const actual = this.pagePropertyValue(condition.field);
      const includes = actual.includes(expected);
      return condition.query === 'does_not_contain' ? !includes : includes;
    }
  }, {
    key: "pagePropertyValue",
    value: function pagePropertyValue(field) {
      if (field === 'url') return window.location.href.toLowerCase();
      if (field === 'title') return document.title.toLowerCase();
      return window.location.pathname.toLowerCase();
    }
  }, {
    key: "viewedPopupRulePasses",
    value: function viewedPopupRulePasses(condition) {
      const viewed = this.popupWasViewed();
      return condition.inclusion === false ? !viewed : viewed;
    }
  }, {
    key: "scrollRulePasses",
    value: function scrollRulePasses() {
      return this.scrollPercentage >= Number(this.scrollRule.value || 0);
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
    key: "markViewed",
    value: function markViewed() {
      try {
        localStorage.setItem(this.viewedStorageKey, 'true');
      } catch (_) {
        // Some browsers disable storage in private contexts; showing the popup is safer than crashing the page.
      }
    }
  }, {
    key: "popupWasViewed",
    value: function popupWasViewed() {
      try {
        return localStorage.getItem(this.viewedStorageKey) === 'true';
      } catch (_) {
        return false;
      }
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
    get: function () {
      return this.stepTargets[this.stepIndex];
    }
  }, {
    key: "currentStepInputs",
    get: function () {
      return this.inputsForStep(this.currentStep);
    }
  }, {
    key: "conditions",
    get: function () {
      var _this$rulesValue;
      return ((_this$rulesValue = this.rulesValue) === null || _this$rulesValue === void 0 ? void 0 : _this$rulesValue.conditions) || [];
    }
  }, {
    key: "scrollRule",
    get: function () {
      return this.conditions.find(condition => condition.group === 'actions' && condition.type === 'scroll_depth');
    }
  }, {
    key: "scrollPercentage",
    get: function () {
      const documentElement = document.documentElement;
      const scrollableHeight = documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return 100;
      return Math.round(window.scrollY / scrollableHeight * 100);
    }
  }, {
    key: "viewedStorageKey",
    get: function () {
      return `hellotext:popup:${this.idValue}:viewed`;
    }
  }]);
}(_stimulus.Controller);
_default.targets = ['bubble', 'dialog', 'step', 'completed', 'input', 'submitButton'];
_default.values = {
  capture: Object,
  device: String,
  hasBubble: Boolean,
  id: String,
  rules: Object
};