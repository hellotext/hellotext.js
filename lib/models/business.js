function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import API from '../api/businesses';
import locales from '../locales';
var Business = /*#__PURE__*/function () {
  function Business(id) {
    _classCallCheck(this, Business);
    this.id = id;
    this.data = {};
  }
  _createClass(Business, [{
    key: "subscription",
    get: function get() {
      return this.data.subscription;
    }
  }, {
    key: "country",
    get: function get() {
      return this.data.country;
    }
  }, {
    key: "enabledWhitelist",
    get: function get() {
      return this.data.whitelist !== 'disabled';
    }
  }, {
    key: "locale",
    get: function get() {
      return locales[this.data.locale];
    }
  }, {
    key: "features",
    get: function get() {
      return this.data.features;
    }
  }, {
    key: "fetchPublicData",
    value: function () {
      var _fetchPublicData = _asyncToGenerator(function* () {
        return API.get(this.id).then(response => response.json()).then(data => {
          this.data = data;
          if (typeof document !== 'undefined') {
            var linkTag = document.createElement('link');
            linkTag.rel = 'stylesheet';
            linkTag.href = data.style_url;
            document.head.append(linkTag);
          }
        });
      });
      function fetchPublicData() {
        return _fetchPublicData.apply(this, arguments);
      }
      return fetchPublicData;
    }()
  }]);
  return Business;
}();
export { Business };