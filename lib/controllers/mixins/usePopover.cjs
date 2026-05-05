"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePopover = void 0;
var _dom = require("@floating-ui/dom");
var _core = require("../../core");
const usePopover = controller => {
  Object.assign(controller, {
    show() {
      var _this$cancelBehaviour;
      (_this$cancelBehaviour = this.cancelBehaviourOpen) === null || _this$cancelBehaviour === void 0 ? void 0 : _this$cancelBehaviour.call(this);
      this.openValue = true;
    },
    hide() {
      this.openValue = false;
    },
    toggle() {
      var _this$cancelBehaviour2;
      (_this$cancelBehaviour2 = this.cancelBehaviourOpen) === null || _this$cancelBehaviour2 === void 0 ? void 0 : _this$cancelBehaviour2.call(this);
      this.openValue = !this.openValue;
    },
    setupFloatingUI({
      trigger,
      popover,
      strategy
    }) {
      this.floatingUICleanup = (0, _dom.autoUpdate)(trigger, popover, () => {
        (0, _dom.computePosition)(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares,
          strategy: strategy || _core.Configuration.webchat.strategy
        }).then(({
          x,
          y,
          strategy
        }) => {
          const newStyle = {
            left: `${x}px`,
            top: `${y}px`,
            position: strategy
          };
          Object.assign(popover.style, newStyle);
        });
      });
    },
    openValueChanged() {
      if (this.disabledValue) return;
      if (this.openValue) {
        this.popoverTarget.showPopover();
        this.popoverTarget.setAttribute('aria-expanded', 'true');
        if (this['onPopoverOpened']) {
          this.onPopoverOpened();
        }
      } else {
        this.popoverTarget.hidePopover();
        this.popoverTarget.removeAttribute('aria-expanded');
        if (this['onPopoverClosed']) {
          this.onPopoverClosed();
        }
      }
    }
  });
};
exports.usePopover = usePopover;