import { Controller } from '@hotwired/stimulus'
import { computePosition, autoUpdate, shift, flip, offset } from '@floating-ui/dom'

import WebChatMessagesAPI from '../api/web_chat/messages'
import WebChatChannel from '../channels/web_chat_channel'
import Hellotext from "../hellotext";

export default class extends Controller {
  static values = {
    id: String,
    conversationId: String,
    media: Object,
    fileSizeErrorMessage: String,
    placement: { type: String, default: "bottom-end" },
    open: { type: Boolean, default: false },
    autoPlacement: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    nextPage: { type: Number, default: undefined },
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
    'title',
    'onlineStatus',
    'attachmentImage',
  ]

  initialize() {
    this.messagesAPI = new WebChatMessagesAPI(this.idValue)
    this.webChatChannel = new WebChatChannel(this.idValue, Hellotext.session)
    this.files = []

    this.onMessageReceived = this.onMessageReceived.bind(this)
    this.onConversationAssignment = this.onConversationAssignment.bind(this)
    this.onScroll = this.onScroll.bind(this)

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

    this.webChatChannel.onMessage(this.onMessageReceived)
    this.webChatChannel.onConversationAssignment(this.onConversationAssignment)
    this.messagesContainerTarget.addEventListener('scroll', this.onScroll)

    super.connect()
  }

  disconnect() {
    this.messagesContainerTarget.removeEventListener('scroll', this.onScroll)
    this.floatingUICleanup()

    super.disconnect()
  }

  async onScroll() {
    if(this.messagesContainerTarget.scrollTop > 300 || !this.nextPageValue || this.fetchingNextPage) return

    this.fetchingNextPage = true
    const response = await this.messagesAPI.index({ page: this.nextPageValue, session: Hellotext.session })

    const { next: nextPage, messages } = await response.json()

    this.nextPageValue = nextPage

    messages.forEach(message => {
      const { body, attachments } = message

      const div = document.createElement('div')
      div.innerHTML = body

      const element = this.messageTemplateTarget.cloneNode(true)
      element.style.display = 'flex'

      element.querySelector('[data-body]').innerHTML = div.innerHTML

      if(message.state === 'received') {
        element.classList.add('received')
      }

      if(attachments) {
        attachments.forEach(attachmentUrl => {
          const image = this.attachmentImageTarget.cloneNode(true)
          image.src = attachmentUrl
          image.style.display = 'block'

          element.querySelector('[data-attachment-container]').appendChild(image)
        })
      }

      element.setAttribute('data-body', body)
      this.messagesContainerTarget.prepend(element)
    })

    this.fetchingNextPage = false
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

      if(!this.scrolled) {
        this.messagesContainerTarget.scroll({
          top: this.messagesContainerTarget.scrollHeight,
          behavior: 'instant',
        })

        this.scrolled = true
      }
    } else {
      this.popoverTarget.hidePopover()
      this.popoverTarget.removeAttribute("aria-expanded")

      this.dispatch("hidden")

      this.inputTarget.value = ""
    }
  }


  onMessageReceived(message) {
    const { body, attachments } = message

    const div = document.createElement('div')
    div.innerHTML = body

    const element = this.messageTemplateTarget.cloneNode(true)
    element.style.display = 'flex'

    element.querySelector('[data-body]').innerHTML = div.innerHTML

    if(attachments) {
      attachments.forEach(attachmentUrl => {
        const image = this.attachmentImageTarget.cloneNode(true)
        image.src = attachmentUrl
        image.style.display = 'block'

        element.querySelector('[data-attachment-container]').appendChild(image)
      })
    }

    this.messagesContainerTarget.appendChild(element)
  }

  onConversationAssignment(conversation) {
    const { to: user } = conversation

    this.titleTarget.innerText = user.name

    if(user.online) {
      this.onlineStatusTarget.style.display = 'flex'
    } else {
      this.onlineStatusTarget.style.display = 'none'
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

      element.classList.add('received')
      element.style.removeProperty('display')

      element.setAttribute('data-hellotext--webchat-target', 'message')
      element.querySelector('[data-body]').innerText = this.inputTarget.value

      const attachments =  this.attachmentContainerTarget.querySelectorAll('img')

      if(attachments.length > 0) {
        attachments.forEach(attachment => {
          element.querySelector('[data-attachment-container]').appendChild(attachment)
        })
      }

      this.messagesContainerTarget.appendChild(element)

      this.inputTarget.value = ""
      this.files = []
      this.attachmentContainerTarget.innerHTML = ""
      this.attachmentContainerTarget.classList.add("hidden")

      this.inputTarget.focus()
    }
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
      return
    }

    this.errorMessageContainerTarget.innerText = ""
    this.files.forEach(file => this.createAttachmentElement(file))
    this.inputTarget.focus()
  }

  createAttachmentElement(file) {
    const element = this.attachmentElement()

    this.attachmentContainerTarget.classList.remove('hidden')

    element.setAttribute('data-name', file.name)

    if(file.type.startsWith("image/")) {
      const thumbnail = this.attachmentImageTarget.cloneNode(true)

      thumbnail.src = URL.createObjectURL(file)
      thumbnail.style.display = 'block'

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
      this.attachmentContainerTarget.style.display = 'none'
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
