"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePopover = void 0;
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
    }
  });
};
exports.usePopover = usePopover;