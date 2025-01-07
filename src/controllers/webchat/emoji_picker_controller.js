import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, autoPlacement, offset } from '@floating-ui/dom'

import { Picker } from 'emoji-mart'

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
    size: { type: Number, default: 24 },
    perLine: { type: Number, default: 9 }
  }

  initialize() {
    this.onEmojiSelect = this.onEmojiSelect.bind(this)
    super.initialize()
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

    this.popoverTarget.appendChild(this.pickerObject)
    super.connect()
  }

  onEmojiSelect(emoji) {
    this.dispatch('selected', {
      detail: emoji.native,
    })

    this.hide()
  }

  onClickOutside(event) {
    if (this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
      this.openValue = false
    }
  }

  get pickerObject() {
    return new Picker({
      onEmojiSelect: this.onEmojiSelect,
      theme: 'light',
      dynamicWidth: true,
      previewPosition: 'none',
      skinTonePosition: 'none',
      emojiSize: this.sizeValue,
      perLine: this.perLineValue,
      data: async () => {
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@emoji-mart/data',
        )

        return response.json()
      }
    })
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
      autoPlacement({ allowedPlacements: ['top', 'bottom' ]}),
    ]
  }
}
