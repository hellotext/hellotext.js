function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
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
import { Controller } from '@hotwired/stimulus';
import Hellotext from '../hellotext';
var _default = /*#__PURE__*/function (_Controller) {
  _inherits(_default, _Controller);
  var _super = _createSuper(_default);
  function _default() {
    _classCallCheck(this, _default);
    return _super.apply(this, arguments);
  }
  _createClass(_default, [{
    key: "connect",
    value: function connect() {
      this.updateFades();
      this.observeContainerSize();
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _this$resizeObserver;
      (_this$resizeObserver = this.resizeObserver) === null || _this$resizeObserver === void 0 ? void 0 : _this$resizeObserver.disconnect();
    }
  }, {
    key: "setId",
    value: function setId(_ref) {
      var {
        detail: id
      } = _ref;
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
    value: function quickReply(_ref2) {
      var {
        currentTarget
      } = _ref2;
      var card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
      var messageElement = currentTarget.closest('[data-controller~="hellotext--message"]');
      var body = currentTarget.dataset.text || currentTarget.textContent.trim();
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
    value: function addToCart(_ref3) {
      var {
        currentTarget
      } = _ref3;
      var card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
      var {
        id,
        reference,
        source
      } = card.dataset;
      var item = {
        product: id,
        quantity: 1
      };
      Hellotext.track('cart.added', {
        object_parameters: {
          items: [item]
        }
      });
      Hellotext.eventEmitter.dispatch('cart.added', {
        object_parameters: {
          items: [_objectSpread(_objectSpread(_objectSpread({}, item), reference && {
            reference
          }), source && {
            source
          })]
        }
      });
    }
  }, {
    key: "moveToLeft",
    value: function moveToLeft() {
      if (!this.hasCarouselContainerTarget) return;
      var nextScrollLeft = this.getPreviousPageScrollLeft();
      var scrollAmount = this.carouselContainerTarget.scrollLeft - nextScrollLeft;
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
      var nextScrollLeft = this.getNextPageScrollLeft();
      var scrollAmount = nextScrollLeft - this.carouselContainerTarget.scrollLeft;
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
      var firstCard = this.carouselContainerTarget.querySelector('.message__carousel_card');
      if (!firstCard) {
        return 280; // Fallback to default desktop card width
      }

      var cardWidth = firstCard.offsetWidth;
      return cardWidth + this.getGap();
    }
  }, {
    key: "getPageScrollAmount",
    value: function getPageScrollAmount() {
      var scrollAmount = this.carouselContainerTarget.clientWidth - this.getGap();
      return scrollAmount > 0 ? scrollAmount : this.getCardScrollAmount();
    }
  }, {
    key: "getNextPageScrollLeft",
    value: function getNextPageScrollLeft() {
      var currentScrollLeft = this.getCurrentScrollLeft();
      var viewportRight = currentScrollLeft + this.carouselContainerTarget.clientWidth;
      var cardMetrics = this.getCardMetrics();
      var nextCard = cardMetrics.find(card => card.end > viewportRight + 1);
      var targetScrollLeft = nextCard ? this.getPageAlignedScrollLeft(nextCard.start) : currentScrollLeft + this.getPageScrollAmount();
      var fallbackScrollLeft = currentScrollLeft + this.getPageScrollAmount();
      return this.clampScrollLeft(targetScrollLeft > currentScrollLeft + 1 ? targetScrollLeft : fallbackScrollLeft);
    }
  }, {
    key: "getPreviousPageScrollLeft",
    value: function getPreviousPageScrollLeft() {
      var _ref4, _previousPageCard$sta;
      var currentScrollLeft = this.getCurrentScrollLeft();
      if (currentScrollLeft <= 1) return 0;
      var targetThreshold = Math.max(currentScrollLeft - this.getPageScrollAmount(), 0);
      if (targetThreshold <= 1) return 0;
      var cardMetrics = this.getCardMetrics();
      var previousPageCard = cardMetrics.find(card => card.start >= targetThreshold - 1 && card.start < currentScrollLeft - 1);
      var previousCard = [...cardMetrics].reverse().find(card => card.start < currentScrollLeft - 1);
      return this.getPageAlignedScrollLeft((_ref4 = (_previousPageCard$sta = previousPageCard === null || previousPageCard === void 0 ? void 0 : previousPageCard.start) !== null && _previousPageCard$sta !== void 0 ? _previousPageCard$sta : previousCard === null || previousCard === void 0 ? void 0 : previousCard.start) !== null && _ref4 !== void 0 ? _ref4 : 0);
    }
  }, {
    key: "getPageAlignedScrollLeft",
    value: function getPageAlignedScrollLeft(cardStart) {
      var pageStartOffset = this.getPageStartOffset();
      if (cardStart <= pageStartOffset + 1) return 0;
      return this.clampScrollLeft(cardStart - pageStartOffset);
    }
  }, {
    key: "getCardMetrics",
    value: function getCardMetrics() {
      return Array.from(this.carouselContainerTarget.querySelectorAll('.message__carousel_card')).map(card => {
        var start = this.getCardScrollLeft(card);
        return {
          start,
          end: start + card.offsetWidth
        };
      });
    }
  }, {
    key: "getCardScrollLeft",
    value: function getCardScrollLeft(card) {
      var cardRect = card.getBoundingClientRect();
      var containerRect = this.carouselContainerTarget.getBoundingClientRect();
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
      var maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
      return Math.min(Math.max(scrollLeft, 0), maxScroll);
    }
  }, {
    key: "getGap",
    value: function getGap() {
      var styles = window.getComputedStyle(this.carouselContainerTarget);
      var gap = Number.parseFloat(styles.columnGap || styles.gap);
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
      var maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
      if (maxScroll <= 1) {
        this.hideFade(this.leftFadeTarget);
        this.hideFade(this.rightFadeTarget);
        return;
      }
      var scrollLeft = Math.min(Math.max(this.carouselContainerTarget.scrollLeft, 0), maxScroll);
      var fadeDistance = this.getFadeDistance();
      this.setFadeOpacity(this.leftFadeTarget, scrollLeft / fadeDistance);
      this.setFadeOpacity(this.rightFadeTarget, (maxScroll - scrollLeft) / fadeDistance);
    }
  }, {
    key: "setFadeOpacity",
    value: function setFadeOpacity(fadeTarget, opacity) {
      var clampedOpacity = Math.min(Math.max(opacity, 0), 1);
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
  return _default;
}(Controller);
_default.values = {
  fadeDistance: {
    type: Number,
    default: 64
  },
  id: String,
  pageStartOffset: {
    type: Number,
    default: 0
  }
};
_default.targets = ['carouselContainer', 'leftFade', 'rightFade', 'carouselCard'];
export { _default as default };