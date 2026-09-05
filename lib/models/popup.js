function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Configuration } from '../core';
import API from '../api';
var Popup = /*#__PURE__*/function () {
  function Popup(data) {
    _classCallCheck(this, Popup);
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  _createClass(Popup, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator(function* () {
        if (!this.data.html) return false;
        var container = this.containerToAppendTo;
        if (!container) {
          console.warn("Hellotext popup was not mounted because the container ".concat(Configuration.popup.container, " was not found."));
          return false;
        }
        container.appendChild(this.data.html);
        this.mounted = true;
        return true;
      });
      function render() {
        return _render.apply(this, arguments);
      }
      return render;
    }()
  }, {
    key: "containerToAppendTo",
    get: function get() {
      try {
        return document.querySelector(Configuration.popup.container);
      } catch (_) {
        return null;
      }
    }
  }], [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator(function* (id) {
        var popup = new Popup({
          id,
          html: yield API.popups.get(id)
        });
        popup.rendered = popup.render();
        return popup;
      });
      function load(_x) {
        return _load.apply(this, arguments);
      }
      return load;
    }()
  }]);
  return Popup;
}();
export { Popup };