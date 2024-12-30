import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, flip, offset } from '@floating-ui/dom'

import WebChatMessagesAPI from '../api/web_chat/messages'

export default class extends Controller {
  static values = {
    id: String,
    media: Object,
    fileSizeErrorMessage: String,
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
    'errorMessageContainer',
    'attachmentTemplate',
  ]

  initialize() {
    this.messagesAPI = new WebChatMessagesAPI(this.idValue)
    super.initialize()
  }

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

      this.inputTarget.focus()
    } else {
      this.popoverTarget.hidePopover()
      this.popoverTarget.removeAttribute("aria-expanded")

      this.dispatch("hidden")

      this.inputTarget.value = ""
    }
  }

  async sendMessage() {
    const formData = new FormData()

    formData.append('message[body]', this.inputTarget.value)
    formData.append('message[attachment]', this.attachmentInputTarget.files[0])

    formData.append('session', Hellotext.session)

    const response = await this.messagesAPI.create(formData)

    console.log(response)
  }

  openAttachment() {
    console.log('opening attachment')
    this.attachmentInputTarget.click()
  }

  onFileInputChange() {
    this.errorMessageContainerTarget.classList.add('hidden')

    this.files = Array.from(this.attachmentInputTarget.files)

    const fileMaxSizeTooMuch = this.files.find(file => {
      const type = file.type.split("/")[0]

      if(['image', 'video', 'audio'].includes(type)) {
        return this.mediaValue[type].max_size < file.size
      } else {
        return this.mediaValue.document.max_size < file.size
      }
    })

    if(fileMaxSizeTooMuch) {
      const type = fileMaxSizeTooMuch.type.split("/")[0]
      const mediaType = ['image', 'audio', 'video'].includes(type) ? type : 'document'

      this.errorMessageContainerTarget.innerText = this.fileSizeErrorMessageValue.replace('%{limit}', this.byteToMegabyte(this.mediaValue[mediaType].max_size))
      this.errorMessageContainerTarget.classList.remove('hidden')

      return
    }

    this.errorMessageContainerTarget.classList.add('hidden')

    this.files.forEach(file => this.createAttachmentElement(file))
  }

  createAttachmentElementFromTemplate(data) {
    const element = this.attachmentElement()

    if(data.content_type.startsWith('image/')) {
      const thumbnail = document.createElement('img')
      thumbnail.src = data.url
      this.addClass(thumbnail, ...this.widthClasses, 'h-28', 'rounded-md', 'object-cover')

      element.querySelector('main').innerHTML = ''
      element.querySelector('main').appendChild(thumbnail)
    } else {
      element.querySelector('main').classList.add(...this.widthClasses, 'h-20', 'rounded-md', 'bg-gray-200', 'p-1')
      element.querySelector('p[data-attachment-name]').innerText = data.filename
    }

    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = `${this.inputNameValue}[signed_id]`
    input.value = data.signed_id

    element.setAttribute("data-editor--attached-media-upload-value", false)

    element.appendChild(input)
    this.appendElement(element)
  }

  attachmentElement() {
    const element = this.attachmentTemplateTarget.cloneNode(true)
    element.removeAttribute("hidden")
    element.setAttribute("data-controller", "editor--attached-media")
    element.setAttribute("data-editor--media-target", "attachment")

    return element
  }

  byteToMegabyte(bytes) {
    return Math.ceil(bytes / 1024 / 1024)
  }

  get middlewares() {
    return [
      offset(5),
      shift({ padding: 24 }),
      flip(),
    ]
  }
}
