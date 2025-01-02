import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, flip, offset } from '@floating-ui/dom'
import { createConsumer } from "@rails/actioncable"

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
    'attachmentContainer',
    'attachment',
    'messageTemplate',
    'messagesContainer',
  ]

  initialize() {
    this.messagesAPI = new WebChatMessagesAPI(this.idValue)
    this.files = []

    this.consumer = createConsumer('ws://localhost:3000/cable')

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

    this.consumer.subscriptions.create({
      channel: "WebChatChannel",
      web_chat_id: this.idValue,
      another: 'value',
      session: Hellotext.session
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

    this.files.forEach(file => {
      formData.append('message[attachments][]', file)
    })

    formData.append('session', Hellotext.session)

    const response = await this.messagesAPI.create(formData)

    if(response.succeeded) {
      const element = this.messageTemplateTarget.cloneNode(true)
      element.style.display = 'flex'

      element.innerText = this.inputTarget.value

      this.messagesContainerTarget.appendChild(element)

      this.inputTarget.value = ""
      this.files = []
      this.attachmentContainerTarget.innerHTML = ""
      this.attachmentContainerTarget.classList.add("hidden")

      this.inputTarget.focus()
    }
    console.log(response)
  }

  openAttachment() {
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
    this.inputTarget.focus()
  }

  createAttachmentElement(file) {
    const element = this.attachmentElement()

    this.attachmentContainerTarget.classList.remove('hidden')

    element.setAttribute('data-name', file.name)

    if(file.type.startsWith("image/")) {
      const thumbnail = element.querySelector('img')
      thumbnail.src = URL.createObjectURL(file)

      element.appendChild(thumbnail)

      this.attachmentContainerTarget.appendChild(element)
      this.attachmentContainerTarget.style.display = 'flex'
    } else {
      element.querySelector("main").classList.add(...this.widthClasses, "h-20", "rounded-md", "bg-gray-200", "p-1")
      element.querySelector("p[data-attachment-name]").innerText = file.name
    }
  }

  removeAttachment({ currentTarget }) {
    const attachment = currentTarget.closest("[data-hellotext--webchat-target='attachment']")

    this.files = this.files.filter(file => file.name !== attachment.dataset.name)

    attachment.remove()
    this.inputTarget.focus()
  }

  attachmentTargetDisconnected() {
    if(this.attachmentTargets.length === 0) {
      this.attachmentContainerTarget.innerHTML = ""
      this.attachmentContainerTarget.classList.add("hidden")
    }
  }

  attachmentElement() {
    const element = this.attachmentTemplateTarget.cloneNode(true)
    element.removeAttribute("hidden")
    element.style.display = 'flex'

    element.setAttribute("data-hellotext--webchat-target", "attachment")

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
