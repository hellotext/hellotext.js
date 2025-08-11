import { autoUpdate, computePosition } from '@floating-ui/dom'
import { Configuration } from '../../core'

export const usePopover = controller => {
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
          strategy: Configuration.webchat.strategy,
        }).then(({ x, y, strategy }) => {
          const newStyle = {
            left: `${x}px`,
            top: `${y}px`,
            position: strategy,
          }

          Object.assign(popover.style, newStyle)
        })
      })
    },
    openValueChanged() {
      if (this.disabledValue) return

      if (this.openValue) {
        this.popoverTarget.showPopover()
        this.popoverTarget.setAttribute('aria-expanded', 'true')

        if (this['onPopoverOpened']) {
          this.onPopoverOpened()
        }
      } else {
        this.popoverTarget.hidePopover()
        this.popoverTarget.removeAttribute('aria-expanded')

        if (this['onPopoverClosed']) {
          this.onPopoverClosed()
        }
      }
    },
  })
}
