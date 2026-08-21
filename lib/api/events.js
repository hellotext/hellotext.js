function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration } from '../core';
import { Query } from '../models';
import { Response } from './response';
var EventsAPI = /*#__PURE__*/function () {
  function EventsAPI() {
    _classCallCheck(this, EventsAPI);
  }
  return _createClass(EventsAPI, null, [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint('track/events');
    }
  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator(function* (_ref) {
        var headers = _ref.headers,
          body = _ref.body,
          _ref$keepalive = _ref.keepalive,
          keepalive = _ref$keepalive === void 0 ? false : _ref$keepalive;
        if (Query.inPreviewMode) {
          return new Response(true, {
            received: true
          });
        }
        var fetchOptions = {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        };

        // Do not send `keepalive: false`. The track caller opts in only for payloads
        // that fit the browser keepalive budget; omitting the key for larger events
        // preserves normal fetch behavior for rich carts/orders instead of asking
        // the browser to use an unload-safe transport it may reject.
        if (keepalive) {
          fetchOptions.keepalive = true;
        }
        var response = yield fetch(this.endpoint, fetchOptions);
        return new Response(response.status === 200, yield response.json());
      });
      function create(_x) {
        return _create.apply(this, arguments);
      }
      return create;
    }()
  }]);
}();
export { EventsAPI as default };