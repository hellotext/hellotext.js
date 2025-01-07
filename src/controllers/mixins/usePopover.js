import { autoUpdate, computePosition } from '@floating-ui/dom'
import Hellotext from "../../hellotext";

export const usePopover = (controller) => {
  Object.assign(controller, {
    show() {
      this.openValue = true
    },
    hide() {
      this.openValue = false
    },
    toggle() {
      this.openValue = !this.openValue
    },
    setupFloatingUI({ trigger, popover }) {
      this.floatingUICleanup = autoUpdate(trigger, popover, () => {
        computePosition(trigger, popover, {
          placement: this.placementValue,
          middleware: this.middlewares,
        }).then(({x, y}) => {
          const newStyle = {
            left: `${x}px`,
            top: `${y}px`
          }

          Object.assign(popover.style, newStyle)
        });
      })
    },
    openValueChanged() {
      if(this.disabledValue) return

      if(this.openValue) {
        this.popoverTarget.showPopover()
        this.popoverTarget.setAttribute("aria-expanded", "true")

        this.onPopoverOpened()
      } else {
        this.popoverTarget.hidePopover()
        this.popoverTarget.removeAttribute("aria-expanded")

        this.onPopoverClosed()
      }
    }
  })
}
