import { autoUpdate, computePosition } from '@floating-ui/dom';
import { Configuration } from '../../core';
export var usePopover = controller => {
  Object.assign(controller, {
    show() {
      var _this$cancelBehaviour;
      (_this$cancelBehaviour = this.cancelBehaviourOpen) === null || _this$cancelBehaviour === void 0 || _this$cancelBehaviour.call(this);
      this.openValue = true;
    },
    hide() {
      this.openValue = false;
    },
    toggle() {
      var _this$cancelBehaviour2;
      (_this$cancelBehaviour2 = this.cancelBehaviourOpen) === null || _this$cancelBehaviour2 === void 0 || _this$cancelBehaviour2.call(this);
      this.openValue = !this.openValue;
    },
    setupFloatingUI(_ref) {
      var trigger = _ref.trigger,
        popover = _ref.popover,
        strategy = _ref.strategy;
      this.floatingUICleanup = autoUpdate(trigger, popover, () => {
        computePosition(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares,
          strategy: strategy || Configuration.webchat.strategy
        }).then(_ref2 => {
          var x = _ref2.x,
            y = _ref2.y,
            strategy = _ref2.strategy;
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
        var _this$preparePopoverO;
        (_this$preparePopoverO = this.preparePopoverOpenAnimation) === null || _this$preparePopoverO === void 0 || _this$preparePopoverO.call(this);
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