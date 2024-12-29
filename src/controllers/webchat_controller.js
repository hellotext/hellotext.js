import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, flip, offset } from '@floating-ui/dom'

export default class extends Controller {
  static values = {
    placement: { type: String, default: "bottom-end" },
    open: { type: Boolean, default: false },
    autoPlacement: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  }

  static targets = [
    'trigger',
    'popover',
    'input',
    'attachmentInput',
    'attachmentButton',
  ]

  connect() {
    this.floatingUICleanup = autoUpdate(this.triggerTarget, this.popoverTarget, () => {
      computePosition(this.triggerTarget, this.popoverTarget, {
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

  disconnect() {
    this.floatingUICleanup()
    super.disconnect()
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

  onClickOutside(event) {
    if (event.target.nodeType && this.element.contains(event.target) === false) {
      this.openValue = false
      setTimeout(() => this.dispatch("aborted"), 400)
    }
  }

  openValueChanged() {
    if(this.disabledValue) return

    this.dispatch("toggle", {
      detail: this.openValue
    })

    if(this.openValue) {
      this.popoverTarget.showPopover()
      this.popoverTarget.setAttribute("aria-expanded", "true")

      this.dispatch("opened")
    } else {
      this.popoverTarget.hidePopover()
      this.popoverTarget.removeAttribute("aria-expanded")

      this.dispatch("hidden")
    }
  }

  sendMessage() {
    // send message here
  }

  openAttachment() {
    this.attachmentInputTarget.click()
  }

  get middlewares() {
    return [
      offset(5),
      shift({ padding: 24 }),
      flip(),
    ]
  }
}
