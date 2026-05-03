import { autoUpdate, computePosition } from '@floating-ui/dom';
import { Configuration } from '../../core';
export var usePopover = controller => {
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
    setupFloatingUI(_ref) {
      var {
        trigger,
        popover,
        strategy
      } = _ref;
      this.floatingUICleanup = autoUpdate(trigger, popover, () => {
        computePosition(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares,
          strategy: strategy || Configuration.webchat.strategy
        }).then(_ref2 => {
          var {
            x,
            y,
            strategy
          } = _ref2;
          var newStyle = {
            left: "".concat(x, "px"),
            top: "".concat(y, "px"),
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