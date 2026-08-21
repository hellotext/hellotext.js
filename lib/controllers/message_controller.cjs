"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _hellotext = _interopRequireDefault(require("../hellotext"));
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
let _default = exports.default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "connect",
    value: function connect() {
      this.updateFades();
      this.observeContainerSize();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _this$resizeObserver;
      (_this$resizeObserver = this.resizeObserver) === null || _this$resizeObserver === void 0 || _this$resizeObserver.disconnect();
    }
  }, {
    key: "setId",
    value: function setId({
      detail: id
    }) {
      this.idValue = id;
      this.element.id = id;
    }
  }, {
    key: "onScroll",
    value: function onScroll() {
      this.updateFades();
    }
  }, {
    key: "quickReply",
    value: function quickReply({
      currentTarget
    }) {
      const card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
      const messageElement = currentTarget.closest('[data-controller~="hellotext--message"]');
      const body = currentTarget.dataset.text || currentTarget.textContent.trim();
      this.dispatch('quickReply', {
        detail: {
          id: this.idValue,
          product: card === null || card === void 0 ? void 0 : card.dataset.id,
          buttonId: currentTarget.dataset.id,
          body,
          cardElement: card || messageElement || currentTarget
        }
      });
    }
  }, {
    key: "addToCart",
    value: function addToCart({
      currentTarget
    }) {
      const card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
      const {
        id,
        reference,
        source
      } = card.dataset;
      const item = {
        product: id,
        quantity: 1
      };
      if (this.hasUtmValue) _hellotext.default.page.utm.save(this.utmValue);
      _hellotext.default.eventEmitter.dispatch('cart.added', {
        object_parameters: {
          items: [{
            ...item,
            ...(reference && {
              reference
            }),
            ...(source && {
              source
            })
          }]
        },
        source: {
          kind: this.kindValue,
          message_id: this.idValue,
          button_id: currentTarget.dataset.id
        }
      });
    }
  }, {
    key: "moveToLeft",
    value: function moveToLeft() {
      if (!this.hasCarouselContainerTarget) return;
      const nextScrollLeft = this.getPreviousPageScrollLeft();
      const scrollAmount = this.carouselContainerTarget.scrollLeft - nextScrollLeft;
      if (scrollAmount < 1) return;
      this.carouselContainerTarget.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }, {
    key: "moveToRight",
    value: function moveToRight() {
      if (!this.hasCarouselContainerTarget) return;
      const nextScrollLeft = this.getNextPageScrollLeft();
      const scrollAmount = nextScrollLeft - this.carouselContainerTarget.scrollLeft;
      if (scrollAmount < 1) return;
      this.carouselContainerTarget.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, {
    key: "getScrollAmount",
    value: function getScrollAmount() {
      return this.getCardScrollAmount();
    }
  }, {
    key: "getCardScrollAmount",
    value: function getCardScrollAmount() {
      const firstCard = this.carouselContainerTarget.querySelector('.message__carousel_card');
      if (!firstCard) {
        return 280; // Fallback to default desktop card width
      }
      const cardWidth = firstCard.offsetWidth;
      return cardWidth + this.getGap();
    }
  }, {
    key: "getPageScrollAmount",
    value: function getPageScrollAmount() {
      const scrollAmount = this.carouselContainerTarget.clientWidth - this.getGap();
      return scrollAmount > 0 ? scrollAmount : this.getCardScrollAmount();
    }
  }, {
    key: "getNextPageScrollLeft",
    value: function getNextPageScrollLeft() {
      const currentScrollLeft = this.getCurrentScrollLeft();
      const viewportRight = currentScrollLeft + this.carouselContainerTarget.clientWidth;
      const cardMetrics = this.getCardMetrics();
      const nextCard = cardMetrics.find(card => card.end > viewportRight + 1);
      const targetScrollLeft = nextCard ? this.getPageAlignedScrollLeft(nextCard.start) : currentScrollLeft + this.getPageScrollAmount();
      const fallbackScrollLeft = currentScrollLeft + this.getPageScrollAmount();
      return this.clampScrollLeft(targetScrollLeft > currentScrollLeft + 1 ? targetScrollLeft : fallbackScrollLeft);
    }
  }, {
    key: "getPreviousPageScrollLeft",
    value: function getPreviousPageScrollLeft() {
      const currentScrollLeft = this.getCurrentScrollLeft();
      if (currentScrollLeft <= 1) return 0;
      const targetThreshold = Math.max(currentScrollLeft - this.getPageScrollAmount(), 0);
      if (targetThreshold <= 1) return 0;
      const cardMetrics = this.getCardMetrics();
      const previousPageCard = cardMetrics.find(card => card.start >= targetThreshold - 1 && card.start < currentScrollLeft - 1);
      const previousCard = [...cardMetrics].reverse().find(card => card.start < currentScrollLeft - 1);
      return this.getPageAlignedScrollLeft((previousPageCard === null || previousPageCard === void 0 ? void 0 : previousPageCard.start) ?? (previousCard === null || previousCard === void 0 ? void 0 : previousCard.start) ?? 0);
    }
  }, {
    key: "getPageAlignedScrollLeft",
    value: function getPageAlignedScrollLeft(cardStart) {
      const pageStartOffset = this.getPageStartOffset();
      if (cardStart <= pageStartOffset + 1) return 0;
      return this.clampScrollLeft(cardStart - pageStartOffset);
    }
  }, {
    key: "getCardMetrics",
    value: function getCardMetrics() {
      return Array.from(this.carouselContainerTarget.querySelectorAll('.message__carousel_card')).map(card => {
        const start = this.getCardScrollLeft(card);
        return {
          start,
          end: start + card.offsetWidth
        };
      });
    }
  }, {
    key: "getCardScrollLeft",
    value: function getCardScrollLeft(card) {
      const cardRect = card.getBoundingClientRect();
      const containerRect = this.carouselContainerTarget.getBoundingClientRect();
      if (cardRect.left || cardRect.width || containerRect.left || containerRect.width) {
        return cardRect.left - containerRect.left + this.carouselContainerTarget.scrollLeft;
      }
      return card.offsetLeft || 0;
    }
  }, {
    key: "getCurrentScrollLeft",
    value: function getCurrentScrollLeft() {
      return this.clampScrollLeft(this.carouselContainerTarget.scrollLeft);
    }
  }, {
    key: "clampScrollLeft",
    value: function clampScrollLeft(scrollLeft) {
      const maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
      return Math.min(Math.max(scrollLeft, 0), maxScroll);
    }
  }, {
    key: "getGap",
    value: function getGap() {
      const styles = window.getComputedStyle(this.carouselContainerTarget);
      const gap = Number.parseFloat(styles.columnGap || styles.gap);
      return Number.isFinite(gap) ? gap : 16;
    }
  }, {
    key: "getFadeDistance",
    value: function getFadeDistance() {
      return Number.isFinite(this.fadeDistanceValue) ? this.fadeDistanceValue : 64;
    }
  }, {
    key: "getPageStartOffset",
    value: function getPageStartOffset() {
      return Number.isFinite(this.pageStartOffsetValue) ? this.pageStartOffsetValue : 0;
    }
  }, {
    key: "observeContainerSize",
    value: function observeContainerSize() {
      if (!this.hasCarouselContainerTarget || !window.ResizeObserver) return;
      this.resizeObserver = new ResizeObserver(() => this.updateFades());
      this.resizeObserver.observe(this.carouselContainerTarget);
    }
  }, {
    key: "updateFades",
    value: function updateFades() {
      if (!this.hasCarouselContainerTarget) return;
      const maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
      if (maxScroll <= 1) {
        this.hideFade(this.leftFadeTarget);
        this.hideFade(this.rightFadeTarget);
        return;
      }
      const scrollLeft = Math.min(Math.max(this.carouselContainerTarget.scrollLeft, 0), maxScroll);
      const fadeDistance = this.getFadeDistance();
      this.setFadeOpacity(this.leftFadeTarget, scrollLeft / fadeDistance);
      this.setFadeOpacity(this.rightFadeTarget, (maxScroll - scrollLeft) / fadeDistance);
    }
  }, {
    key: "setFadeOpacity",
    value: function setFadeOpacity(fadeTarget, opacity) {
      const clampedOpacity = Math.min(Math.max(opacity, 0), 1);
      if (clampedOpacity <= 0.05) {
        this.hideFade(fadeTarget);
        return;
      }
      fadeTarget.classList.remove('hidden');
      fadeTarget.removeAttribute('disabled');
      fadeTarget.removeAttribute('tabindex');
      fadeTarget.setAttribute('aria-hidden', 'false');
      fadeTarget.style.opacity = clampedOpacity.toFixed(3);
      fadeTarget.style.pointerEvents = 'auto';
    }
  }, {
    key: "hideFade",
    value: function hideFade(fadeTarget) {
      fadeTarget.style.opacity = '0';
      fadeTarget.style.pointerEvents = 'none';
      fadeTarget.setAttribute('aria-hidden', 'true');
      fadeTarget.setAttribute('tabindex', '-1');
      if ('disabled' in fadeTarget) fadeTarget.disabled = true;
      fadeTarget.classList.add('hidden');
    }
  }]);
}(_stimulus.Controller);
_default.values = {
  fadeDistance: {
    type: Number,
    default: 64
  },
  id: String,
  kind: String,
  pageStartOffset: {
    type: Number,
    default: 0
  },
  utm: Object
};
_default.targets = ['carouselContainer', 'leftFade', 'rightFade', 'carouselCard'];