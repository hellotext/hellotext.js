import { flip, offset, shift } from '@floating-ui/dom'
import { Controller } from '@hotwired/stimulus'

import WebchatMessagesAPI from '../api/webchat/messages'
import WebchatChannel from '../channels/webchat_channel'
import Hellotext from '../hellotext'

import { Webchat as WebchatConfiguration, behaviors } from '../core/configuration/webchat'

import { LogoBuilder } from '../builders/logo_builder'
import { usePopover } from './mixins/usePopover'

export default class extends Controller {
  static values = {
    id: String,
    conversationId: String,
    media: Object,
    fileSizeErrorMessage: String,
    placement: { type: String, default: 'bottom-end' },
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
    'footer',
    'toolbar',
    'message',
    'unreadCounter',
  ]

  initialize() {
    this.messagesAPI = new WebchatMessagesAPI(this.idValue)

    this.webChatChannel = new WebchatChannel(
      this.idValue,
      Hellotext.session,
      this.conversationIdValue,
    )

    this.files = []

    this.onMessageReceived = this.onMessageReceived.bind(this)
    this.onConversationAssignment = this.onConversationAssignment.bind(this)
    this.onAgentOnline = this.onAgentOnline.bind(this)
    this.onMessageReaction = this.onMessageReaction.bind(this)

    this.onScroll = this.onScroll.bind(this)

    this.onOutboundMessageSent = this.onOutboundMessageSent.bind(this)
    this.broadcastChannel = new BroadcastChannel(`hellotext--webchat--${this.idValue}`)

    super.initialize()
  }

  connect() {
    usePopover(this)

    this.popoverTarget.classList.add(...WebchatConfiguration.classes)
    this.triggerTarget.classList.add(...WebchatConfiguration.triggerClasses)

    this.setupFloatingUI({ trigger: this.triggerTarget, popover: this.popoverTarget })

    this.webChatChannel.onMessage(this.onMessageReceived)
    this.webChatChannel.onConversationAssignment(this.onConversationAssignment)

    this.webChatChannel.onAgentOnline(this.onAgentOnline)
    this.webChatChannel.onReaction(this.onMessageReaction)

    this.messagesContainerTarget.addEventListener('scroll', this.onScroll)

    if (!Hellotext.business.features.white_label) {
      this.toolbarTarget.appendChild(LogoBuilder.build())
    }

    if (localStorage.getItem(`hellotext--webchat--${this.idValue}`) === 'opened') {
      this.openValue = true
    }

    Hellotext.eventEmitter.dispatch('webchat:mounted')
    this.broadcastChannel.addEventListener('message', this.onOutboundMessageSent)

    super.connect()
  }

  disconnect() {
    this.messagesContainerTarget.removeEventListener('scroll', this.onScroll)
    this.floatingUICleanup()

    super.disconnect()
  }

  onOutboundMessageSent(event) {
    const { data } = event

    const callbacks = {
      'message:sent': data => {
        const element = new DOMParser().parseFromString(data.element, 'text/html').body
          .firstElementChild

        this.messagesContainerTarget.appendChild(element)
        element.scrollIntoView({ behavior: 'instant' })
      },
      'message:failed': data => {
        this.messagesContainerTarget.querySelector(`#${data.id}`)?.classList.add('failed')
      },
    }

    if (callbacks[data.type]) {
      callbacks[data.type](data)
    } else {
      console.log(`Unhandled message event: ${data.type}`)
    }
  }

  async onScroll() {
    if (
      this.messagesContainerTarget.scrollTop > 300 ||
      !this.nextPageValue ||
      this.fetchingNextPage
    )
      return

    this.fetchingNextPage = true
    const response = await this.messagesAPI.index({
      page: this.nextPageValue,
      session: Hellotext.session,
    })

    const { next: nextPage, messages } = await response.json()

    this.nextPageValue = nextPage
    this.oldScrollHeight = this.messagesContainerTarget.scrollHeight

    messages.forEach(message => {
      const { body, attachments } = message

      const div = document.createElement('div')
      div.innerHTML = body

      const element = this.messageTemplateTarget.cloneNode(true)

      element.setAttribute('data-hellotext--webchat-target', 'message')
      element.style.removeProperty('display')

      element.querySelector('[data-body]').innerHTML = div.innerHTML

      if (message.state === 'received') {
        element.classList.add('received')
      } else {
        element.classList.remove('received')
      }

      if (attachments) {
        attachments.forEach(attachmentUrl => {
          const image = this.attachmentImageTarget.cloneNode(true)

          image.removeAttribute('data-hellotext--webchat-target')

          image.src = attachmentUrl
          image.style.display = 'block'

          element.querySelector('[data-attachment-container]').appendChild(image)
        })
      }

      element.setAttribute('data-body', body)
      this.messagesContainerTarget.prepend(element)
    })

    this.messagesContainerTarget.scroll({
      top: this.messagesContainerTarget.scrollHeight - this.oldScrollHeight,
      behavior: 'instant',
    })

    this.fetchingNextPage = false
  }

  onClickOutside(event) {
    if (
      WebchatConfiguration.behaviour === behaviors.POPOVER &&
      this.openValue &&
      event.target.nodeType &&
      this.element.contains(event.target) === false
    ) {
      this.openValue = false
    }
  }

  onPopoverOpened() {
    this.inputTarget.focus()

    if (!this.scrolled) {
      this.messagesContainerTarget.scroll({
        top: this.messagesContainerTarget.scrollHeight,
        behavior: 'instant',
      })

      this.scrolled = true
    }

    Hellotext.eventEmitter.dispatch('webchat:opened')

    localStorage.setItem(`hellotext--webchat--${this.idValue}`, 'opened')

    if (this.unreadCounterTarget.style.display === 'none') return

    this.unreadCounterTarget.style.display = 'none'
    this.unreadCounterTarget.innerText = '0'

    this.messagesAPI.markAsSeen()
  }

  onPopoverClosed() {
    Hellotext.eventEmitter.dispatch('webchat:closed')

    setTimeout(() => {
      this.inputTarget.value = ''
    })

    localStorage.setItem(`hellotext--webchat--${this.idValue}`, 'closed')
  }

  onMessageReaction(message) {
    const { message: messageId, reaction, type } = message
    const messageElement = this.messageTargets.find(element => element.dataset.id === messageId)

    const reactionsContainer = messageElement.querySelector('[data-reactions]')

    if (type === 'reaction.destroy') {
      const reactionElement = reactionsContainer.querySelector(`[data-id="${reaction.id}"]`)
      return reactionElement.remove()
    }

    if (reactionsContainer.querySelector(`[data-id="${reaction.id}"]`)) {
      const reactionElement = reactionsContainer.querySelector(`[data-id="${reaction.id}"]`)
      reactionElement.innerText = reaction.emoji
    } else {
      const reactionElement = document.createElement('span')

      reactionElement.innerText = reaction.emoji
      reactionElement.setAttribute('data-id', reaction.id)

      reactionsContainer.appendChild(reactionElement)
    }
  }

  onMessageReceived(message) {
    const { body, attachments } = message

    const div = document.createElement('div')
    div.innerHTML = body

    const element = this.messageTemplateTarget.cloneNode(true)
    element.style.display = 'flex'

    element.querySelector('[data-body]').innerHTML = div.innerHTML
    element.setAttribute('data-hellotext--webchat-target', 'message')

    if (attachments) {
      attachments.forEach(attachmentUrl => {
        const image = this.attachmentImageTarget.cloneNode(true)
        image.src = attachmentUrl
        image.style.display = 'block'

        element.querySelector('[data-attachment-container]').appendChild(image)
      })
    }

    this.messagesContainerTarget.appendChild(element)

    Hellotext.eventEmitter.dispatch('webchat:message:received', {
      ...message,
      body: element.querySelector('[data-body]').innerText,
    })

    element.scrollIntoView({ behavior: 'smooth' })
    this.setOfflineTimeout()

    if (this.openValue) return

    this.unreadCounterTarget.style.display = 'flex'

    const unreadCount = (parseInt(this.unreadCounterTarget.innerText) || 0) + 1
    this.unreadCounterTarget.innerText = unreadCount > 99 ? '99+' : unreadCount
  }

  onConversationAssignment(conversation) {
    const { to: user } = conversation

    this.titleTarget.innerText = user.name

    if (user.online) {
      this.onlineStatusTarget.style.display = 'flex'
    } else {
      this.onlineStatusTarget.style.display = 'none'
    }
  }

  onAgentOnline() {
    this.onlineStatusTarget.style.display = 'flex'
    this.setOfflineTimeout()
  }

  async sendMessage() {
    const formData = new FormData()

    const message = {
      body: this.inputTarget.value,
      attachments: this.files,
    }

    formData.append('message[body]', this.inputTarget.value)

    this.files.forEach(file => {
      formData.append('message[attachments][]', file)
    })

    formData.append('session', Hellotext.session)

    const element = this.messageTemplateTarget.cloneNode(true)

    element.id = `hellotext--webchat--${this.idValue}--message--${Date.now()}`

    element.classList.add('received')
    element.style.removeProperty('display')

    element.setAttribute('data-hellotext--webchat-target', 'message')
    element.querySelector('[data-body]').innerText = this.inputTarget.value

    const attachments = this.attachmentContainerTarget.querySelectorAll('img')

    if (attachments.length > 0) {
      attachments.forEach(attachment => {
        element.querySelector('[data-attachment-container]').appendChild(attachment)
      })
    }

    this.messagesContainerTarget.appendChild(element)
    element.scrollIntoView({ behavior: 'smooth' })

    this.broadcastChannel.postMessage({
      type: 'message:sent',
      element: element.outerHTML,
    })

    this.inputTarget.value = ''
    this.files = []
    this.attachmentContainerTarget.style.display = 'none'
    this.errorMessageContainerTarget.style.display = 'none'

    this.inputTarget.focus()

    const response = await this.messagesAPI.create(formData)

    if (response.failed) {
      this.broadcastChannel.postMessage({
        type: 'message:failed',
        id: element.id,
      })

      return element.classList.add('failed')
    }

    const data = await response.json()
    element.setAttribute('data-id', data.id)
    message.id = data.id

    Hellotext.eventEmitter.dispatch('webchat:message:sent', message)

    if (data.conversation !== this.conversationIdValue) {
      this.conversationIdValue = data.conversation
      this.webChatChannel.updateSubscriptionWith(this.conversationIdValue)
    }

    this.attachmentContainerTarget.style.display = ''
  }

  openAttachment() {
    this.attachmentInputTarget.click()
  }

  onFileInputChange() {
    this.errorMessageContainerTarget.style.display = 'none'

    this.files = Array.from(this.attachmentInputTarget.files)

    const fileMaxSizeTooMuch = this.files.find(file => {
      const type = file.type.split('/')[0]

      if (['image', 'video', 'audio'].includes(type)) {
        return this.mediaValue[type].max_size < file.size
      } else {
        return this.mediaValue.document.max_size < file.size
      }
    })

    if (fileMaxSizeTooMuch) {
      const type = fileMaxSizeTooMuch.type.split('/')[0]
      const mediaType = ['image', 'audio', 'video'].includes(type) ? type : 'document'

      this.errorMessageContainerTarget.innerText = this.fileSizeErrorMessageValue.replace(
        '%{limit}',
        this.byteToMegabyte(this.mediaValue[mediaType].max_size),
      )
      return
    }

    this.errorMessageContainerTarget.innerText = ''
    this.files.forEach(file => this.createAttachmentElement(file))
    this.inputTarget.focus()
  }

  createAttachmentElement(file) {
    const element = this.attachmentElement()

    this.attachmentContainerTarget.style.display = ''

    element.setAttribute('data-name', file.name)

    if (file.type.startsWith('image/')) {
      const thumbnail = this.attachmentImageTarget.cloneNode(true)

      thumbnail.src = URL.createObjectURL(file)
      thumbnail.style.display = 'block'

      element.appendChild(thumbnail)

      this.attachmentContainerTarget.appendChild(element)
      this.attachmentContainerTarget.style.display = 'flex'
    } else {
      const main = element.querySelector('main')
      main.style.height = '5rem'
      main.style.borderRadius = '0.375rem'
      main.style.backgroundColor = '#e5e7eb'
      main.style.padding = '0.25rem'

      element.querySelector('p[data-attachment-name]').innerText = file.name
    }
  }

  removeAttachment({ currentTarget }) {
    const attachment = currentTarget.closest("[data-hellotext--webchat-target='attachment']")

    this.files = this.files.filter(file => file.name !== attachment.dataset.name)

    attachment.remove()
    this.inputTarget.focus()
  }

  attachmentTargetDisconnected() {
    if (this.attachmentTargets.length === 0) {
      this.attachmentContainerTarget.innerHTML = ''
      this.attachmentContainerTarget.style.display = 'none'
    }
  }

  attachmentElement() {
    const element = this.attachmentTemplateTarget.cloneNode(true)
    element.removeAttribute('hidden')
    element.style.display = 'flex'

    element.setAttribute('data-hellotext--webchat-target', 'attachment')

    return element
  }

  onEmojiSelect({ detail: emoji }) {
    const value = this.inputTarget.value
    const start = this.inputTarget.selectionStart
    const end = this.inputTarget.selectionEnd

    this.inputTarget.value = value.slice(0, start) + emoji + value.slice(end)

    this.inputTarget.selectionStart = this.inputTarget.selectionEnd = start + emoji.length
    this.inputTarget.focus()
  }

  setOfflineTimeout() {
    clearTimeout(this.offlineTimeout)

    this.offlineTimeout = setTimeout(() => {
      this.onlineStatusTarget.style.display = 'none'
    }, this.fiveMinutes)
  }

  byteToMegabyte(bytes) {
    return Math.ceil(bytes / 1024 / 1024)
  }

  get fiveMinutes() {
    return 300000
  }

  get middlewares() {
    return [offset(5), shift({ padding: 24 }), flip()]
  }
}
