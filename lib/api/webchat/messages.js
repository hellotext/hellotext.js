function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration } from '../../core';
import Hellotext from '../../hellotext';
import { Response } from '../response';
var WebchatMessagesAPI = /*#__PURE__*/function () {
  function WebchatMessagesAPI(webchatId) {
    _classCallCheck(this, WebchatMessagesAPI);
    this.webchatId = webchatId;
  }
  return _createClass(WebchatMessagesAPI, [{
    key: "index",
    value: function () {
      var _index = _asyncToGenerator(function* (params) {
        var url = new URL(this.url);
        Object.entries(params).forEach(_ref => {
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
          url.searchParams.append(key, value);
        });
        return yield fetch(url, {
          method: 'GET',
          headers: Hellotext.headers
        });
      });
      function index(_x) {
        return _index.apply(this, arguments);
      }
      return index;
    }()
  }, {
    key: "catchUp",
    value: function catchUp(afterId) {
      return this.index({
        after_id: afterId,
        session: Hellotext.session
      });
    }
  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator(function* (formData) {
        var response = yield fetch(this.url, {
          method: 'POST',
          headers: {
            Authorization: "Bearer ".concat(Hellotext.business.id)
          },
          body: formData
        });
        return new Response(response.ok, response);
      });
      function create(_x2) {
        return _create.apply(this, arguments);
      }
      return create;
    }()
  }, {
    key: "markAsSeen",
    value: function markAsSeen() {
      var messageId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var url = messageId ? this.url + "/".concat(messageId) : this.url + '/seen';
      fetch(url, {
        method: 'PATCH',
        headers: Hellotext.headers,
        body: JSON.stringify({
          session: Hellotext.session
        })
      });
    }
  }, {
    key: "url",
    get: function get() {
      return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId);
    }
  }], [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint("public/webchats/:id/messages");
    }
  }]);
}();
export default WebchatMessagesAPI;