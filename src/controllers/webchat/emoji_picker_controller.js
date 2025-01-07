import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, flip, offset } from '@floating-ui/dom'

export default class extends Controller {
  static targets = [
    'button',
    'popover',
  ]

  static values = {
    placement: { type: String, default: "bottom-end" },
    open: { type: Boolean, default: false },
    autoPlacement: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    nextPage: { type: Number, default: undefined },
  }

  connect() {
    this.floatingUICleanup = autoUpdate(this.buttonTarget, this.popoverTarget, () => {
      computePosition(this.buttonTarget, this.popoverTarget, {
        placement: this.placementValue,
        middleware: this.middlewares,
      }).then(({x, y}) => {
        const newStyle = {
          left: `${x}px`,
          top: `${y}px`
        }

        Object.assign(this.popoverTarget.style, newStyle);
      });
    })

    super.connect()
  }

  show() {
    this.openValue = true
  }

  hide() {
    this.openValue = false
  }

  toggle() {
    this.openValue = !this.openValue
  }

  openValueChanged() {
    if(this.disabledValue) return

    if(this.openValue) {
      this.popoverTarget.showPopover()
      this.popoverTarget.setAttribute("aria-expanded", "true")
    } else {
      this.popoverTarget.hidePopover()
      this.popoverTarget.removeAttribute("aria-expanded")
    }
  }

  get middlewares() {
    return [
      offset(5),
      shift({ padding: 24 }),
      flip(),
    ]
  }
}
