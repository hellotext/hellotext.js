"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _dom = require("@floating-ui/dom");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
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
      this.floatingUICleanup = (0, _dom.autoUpdate)(this.triggerTarget, this.popoverTarget, () => {
        (0, _dom.computePosition)(this.triggerTarget, this.popoverTarget, {
          placement: this.placementValue,
          middleware: this.middlewares
        }).then(_ref => {
          var {
            x,
            y
          } = _ref;
          var newStyle = {
            left: "".concat(x, "px"),
            top: "".concat(y, "px")
          };
          Object.assign(this.popoverTarget.style, newStyle);
        });
      });
      _get(_getPrototypeOf(_default.prototype), "connect", this).call(this);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.floatingUICleanup();
      _get(_getPrototypeOf(_default.prototype), "disconnect", this).call(this);
    }
  }, {
    key: "show",
    value: function show() {
      this.openValue = true;
    }
  }, {
    key: "hide",
    value: function hide() {
      this.openValue = false;
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.openValue = !this.openValue;
    }
  }, {
    key: "onClickOutside",
    value: function onClickOutside(event) {
      if (event.target.nodeType && this.element.contains(event.target) === false) {
        this.openValue = false;
        setTimeout(() => this.dispatch("aborted"), 400);
      }
    }
  }, {
    key: "openValueChanged",
    value: function openValueChanged() {
      if (this.disabledValue) return;
      this.dispatch("toggle", {
        detail: this.openValue
      });
      if (this.openValue) {
        this.popoverTarget.showPopover();
        this.popoverTarget.setAttribute("aria-expanded", "true");
        this.dispatch("opened");
      } else {
        this.popoverTarget.hidePopover();
        this.popoverTarget.removeAttribute("aria-expanded");
        this.dispatch("hidden");
      }
    }
  }, {
    key: "middlewares",
    get: function get() {
      return [(0, _dom.offset)(5), (0, _dom.shift)({
        padding: 24
      }), (0, _dom.flip)()];
    }
  }]);
  return _default;
}(_stimulus.Controller);
exports.default = _default;
_default.values = {
  placement: {
    type: String,
    default: "bottom-end"
  },
  open: {
    type: Boolean,
    default: false
  },
  autoPlacement: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
};
_default.targets = ['trigger', 'popover'];