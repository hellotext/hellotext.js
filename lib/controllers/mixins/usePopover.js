import { autoUpdate, computePosition } from '@floating-ui/dom';
import { Configuration } from '../../core';
export var usePopover = controller => {
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
      var strategy = Configuration.webchat.strategy;
      if (!strategy) {
        strategy = Configuration.webchat.container == 'body' ? 'fixed' : 'absolute';
      }
      this.floatingUICleanup = autoUpdate(trigger, popover, () => {
        computePosition(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares,
          strategy
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