import { autoUpdate, computePosition } from '@floating-ui/dom'

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
    }
  })
}
