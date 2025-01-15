"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePopover = void 0;
var _dom = require("@floating-ui/dom");
var _hellotext = _interopRequireDefault(require("../../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var usePopover = controller => {
  Object.assign(controller, {
    show() {
      this.openValue = true;
    },
    hide() {
      this.openValue = false;
    },
    toggle() {
      this.openValue = !this.openValue;
    },
    setupFloatingUI(_ref) {
      var {
        trigger,
        popover
      } = _ref;
      this.floatingUICleanup = (0, _dom.autoUpdate)(trigger, popover, () => {
        (0, _dom.computePosition)(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares
        }).then(_ref2 => {
          var {
            x,
            y
          } = _ref2;
          var newStyle = {
            left: "".concat(x, "px"),
            top: "".concat(y, "px")
          };
          Object.assign(popover.style, newStyle);
        });
      });
    },
    openValueChanged() {
      if (this.disabledValue) return;
      if (this.openValue) {
        this.popoverTarget.showPopover();
        this.popoverTarget.setAttribute("aria-expanded", "true");
        if (this['onPopoverOpened']) {
          this.onPopoverOpened();
        }
      } else {
        this.popoverTarget.hidePopover();
        this.popoverTarget.removeAttribute("aria-expanded");
        if (this['onPopoverClosed']) {
          this.onPopoverClosed();
        }
      }
    }
  });
};
exports.usePopover = usePopover;