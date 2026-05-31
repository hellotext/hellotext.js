import { flip, offset, shift } from '@floating-ui/dom'
import { Controller } from '@hotwired/stimulus'

import WebchatMessagesAPI from '../api/webchat/messages'
import WebchatChannel from '../channels/webchat_channel'
import Hellotext from '../hellotext'

import { Locale } from '../core'
import { Webchat as WebchatConfiguration, modes } from '../core/configuration/webchat'

import { usePopover } from './mixins/usePopover'
import { useBehaviour } from './webchat/useBehaviour'
import { useOpeningSequence } from './webchat/useOpeningSequence'
import { useTeaser } from './webchat/useTeaser'

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
    fullScreenThreshold: { type: Number, default: 1024 },
    typingIndicatorKeepAlive: { type: Number, default: 30000 }, // 30 seconds
    offset: { type: Number, default: 24 },
    padding: { type: Number, default: 24 },
    optimisticTypingIndicatorWait: { type: Number, default: 1000 }, // 1 second,
    teaser: Object,
    messageTeaser: String,
    behaviour: Object,
  }

  static classes = ['fadeOut']

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
    'attachmentImage',
    'footer',
    'toolbar',
    'message',
    'unreadCounter',
    'typingIndicator',
    'typingIndicatorTemplate',
    'teaser',
    'teaserMessage',
    'inboundMessageTeaser',
    'inboundMessageTeaserBody',
    'openingSequence',
    'openingSequenceMessage',
  ]

  initialize() {
    this.messagesAPI = new WebchatMessagesAPI(this.idValue)

    this.webChatChannel = new WebchatChannel(
      this.idValue,
      Hellotext.session,
      this.conversationIdValue,
    )

    this.files = []
    this.messageIds = new Set()

    this.onMessageReceived = this.onMessageReceived.bind(this)
    this.onMessageReaction = this.onMessageReaction.bind(this)
    this.onTypingStart = this.onTypingStart.bind(this)

    this.onScroll = this.onScroll.bind(this)

    this.onOutboundMessageSent = this.onOutboundMessageSent.bind(this)
    this.broadcastChannel = new BroadcastChannel(`hellotext--webchat--${this.idValue}`)

    super.initialize()
  }

  connect() {
    useBehaviour(this)
    usePopover(this)
    useOpeningSequence(this)
    useTeaser(this)

    this.setupFloatingUI({ trigger: this.triggerTarget, popover: this.popoverTarget })

    if (this.hasTeaserTarget) {
      this.setupFloatingUI({
        trigger: this.triggerTarget,
        popover: this.teaserTarget,
        strategy: 'absolute',
      })
    }

    this.setupTeaser()
    this.setupOpeningSequence()

    this.webChatChannel.onMessage(this.onMessageReceived)
    this.webChatChannel.onTypingStart(this.onTypingStart)

    this.webChatChannel.onReaction(this.onMessageReaction)

    this.messagesContainerTarget.addEventListener('scroll', this.onScroll)

    if (this.shouldOpenOnMount) {
      this.openValue = true
    }

    Hellotext.eventEmitter.dispatch('webchat:mounted')
    this.broadcastChannel.addEventListener('message', this.onOutboundMessageSent)
    this.scheduleBehaviourOpen()

    super.connect()
  }

  disconnect() {
    this.cancelBehaviourOpen()
    this.teardownTeaser()
    this.teardownOpeningSequence()

    this.broadcastChannel.removeEventListener('message', this.onOutboundMessageSent)
    this.messagesContainerTarget.removeEventListener('scroll', this.onScroll)

    // Clean up typing indicator timeouts
    this.clearTypingIndicator()

    this.broadcastChannel.close()
    this.floatingUICleanup()

    super.disconnect()
  }

  onTypingStart() {
    if (this.typingIndicatorVisible) {
      return this.resetTypingIndicatorTimer()
    }

    this.showTypingIndicator()
  }

  showOptimisticTypingIndicator() {
    if (this.typingIndicatorVisible) return

    this.showTypingIndicator()
  }

  showTypingIndicator() {
    this.clearTypingIndicator()

    this.typingIndicatorVisible = true
    const indicator = this.typingIndicatorTemplateTarget.cloneNode(true)

    indicator.setAttribute('data-hellotext--webchat-target', 'typingIndicator')
    indicator.style.display = 'flex'

    this.messagesContainerTarget.appendChild(indicator)

    requestAnimationFrame(() => {
      this.messagesContainerTarget.scroll({
        top: this.messagesContainerTarget.scrollHeight,
        behavior: 'instant',
      })
    })

    const timeout = this.typingIndicatorKeepAliveValue

    this.incomingTypingIndicatorTimeout = setTimeout(() => {
      this.clearTypingIndicator()
    }, timeout)
  }

  resetTypingIndicatorTimer() {
    if (!this.typingIndicatorVisible) return

    // Clear existing timeout
    clearTimeout(this.incomingTypingIndicatorTimeout)
    clearTimeout(this.optimisticTypingTimeout)

    // Use unified timeout for all typing indicators
    const timeout = this.typingIndicatorKeepAliveValue

    this.incomingTypingIndicatorTimeout = setTimeout(() => {
      this.clearTypingIndicator()
    }, timeout)
  }

  clearTypingIndicator() {
    if (this.hasTypingIndicatorTarget) {
      this.typingIndicatorTarget.remove()
    }

    this.typingIndicatorVisible = false

    clearTimeout(this.incomingTypingIndicatorTimeout)
    clearTimeout(this.optimisticTypingTimeout)
  }

  onMessageInputChange() {
    this.resizeInput()
    clearTimeout(this.typingIndicatorTimeout)

    if (!this.hasSentTypingIndicator) {
      this.webChatChannel.startTypingIndicator()
      this.hasSentTypingIndicator = true
    }

    this.typingIndicatorTimeout = setTimeout(() => {
      this.hasSentTypingIndicator = false
    }, 3000)
  }

  onOutboundMessageSent(event) {
    const { data } = event

    const callbacks = {
      'message:sent': data => {
        const element = new DOMParser().parseFromString(data.element, 'text/html').body
          .firstElementChild

        // Insert message before typing indicator if one exists
        if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
          this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget)
        } else {
          this.messagesContainerTarget.appendChild(element)
        }

        element.scrollIntoView({ behavior: 'instant' })
      },
      'message:failed': data => {
        const element = this.messagesContainerTarget.querySelector(`#${data.id}`)

        this.markMessageFailed(element, data.reason)
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

          this.messageAttachmentsContainer(element)?.appendChild(image)
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
      WebchatConfiguration.mode === modes.POPOVER &&
      this.openValue &&
      event.target.nodeType &&
      this.element.contains(event.target) === false
    ) {
      this.openValue = false
    }
  }

  closePopover() {
    this.popoverTarget.classList.add(...this.fadeOutClasses)

    setTimeout(() => {
      this.openValue = false
    }, 250)
  }

  onPopoverOpened() {
    this.popoverTarget.classList.remove(...this.fadeOutClasses)
    this.dismissTeaserForSession?.()

    if (!this.onMobile) {
      this.inputTarget.focus()
    }

    if (!this.scrolled) {
      requestAnimationFrame(() => {
        this.messagesContainerTarget.scroll({
          top: this.messagesContainerTarget.scrollHeight,
          behavior: 'instant',
        })
      })

      this.scrolled = true
    }

    Hellotext.eventEmitter.dispatch('webchat:opened')
    localStorage.setItem(`hellotext--webchat--${this.idValue}`, 'opened')

    if (this.messageTeaserValue) {
      this.messageTeaserValue = null
    }

    this.startOpeningSequence()

    if (this.unreadCounterTarget.style.display === 'none') return

    this.unreadCounterTarget.style.display = 'none'
    this.unreadCounterTarget.innerText = '0'

    this.messagesAPI.markAsSeen()
  }

  onPopoverClosed() {
    Hellotext.eventEmitter.dispatch('webchat:closed')
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
    const { id, body, attachments, teaser } = message

    if (!this.claimMessageId(id)) return

    this.hideTeaser?.()

    if (message.carousel) {
      return this.insertCarouselMessage(message)
    }

    const div = document.createElement('div')
    div.innerHTML = body

    const element = this.messageTemplateTarget.cloneNode(true)
    element.style.display = 'flex'

    element.querySelector('[data-body]').innerHTML = div.innerHTML

    element.setAttribute('data-id', id)
    element.setAttribute('data-hellotext--webchat-target', 'message')

    if (attachments) {
      attachments.forEach(attachmentUrl => {
        const image = this.attachmentImageTarget.cloneNode(true)
        image.src = attachmentUrl
        image.style.display = 'block'

        this.messageAttachmentsContainer(element)?.appendChild(image)
      })
    }

    this.clearTypingIndicator()
    this.messagesContainerTarget.appendChild(element)

    Hellotext.eventEmitter.dispatch('webchat:message:received', {
      ...message,
      body: element.querySelector('[data-body]').innerText,
    })

    element.scrollIntoView({ behavior: 'smooth' })

    this.updateMessageTeaser(teaser)

    if (this.openValue) {
      this.messagesAPI.markAsSeen(id)
      return
    }

    this.incrementUnreadCounter()
  }

  // TCP broadcasts may deliver the same incoming message twice before Stimulus
  // has connected the appended message target. Claiming the id in memory closes
  // that window, while the target check still drops messages rendered earlier.
  claimMessageId(id) {
    const messageTargets = this.messageTargets || []

    if (this.messageIds.has(id)) return false

    this.messageIds.add(id)

    return !messageTargets.some(element => element.dataset.id === id)
  }

  updateMessageTeaser(teaser) {
    this.messageTeaserValue = teaser

    if (
      !this.messageTeaserValue ||
      !this.hasTeaserTarget ||
      !this.hasInboundMessageTeaserTarget ||
      !this.hasInboundMessageTeaserBodyTarget
    ) {
      return
    }

    this.teaserMessageTargets.forEach(teaserMessage => teaserMessage.classList.add('hidden'))
    this.inboundMessageTeaserBodyTarget.innerHTML = this.messageTeaserValue
    this.inboundMessageTeaserTarget.classList.remove('hidden')

    this.teaserTarget.classList.toggle('invisible', this.openValue)
  }

  insertCarouselMessage(message) {
    const html = message.html
    const element = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild

    element.setAttribute('data-id', message.id)
    element.setAttribute('data-hellotext--webchat-target', 'message')

    this.clearTypingIndicator()
    this.messagesContainerTarget.appendChild(element)

    element.scrollIntoView({ behavior: 'smooth' })

    Hellotext.eventEmitter.dispatch('webchat:message:received', {
      ...message,
      body: element.querySelector('[data-body]')?.innerText || '',
    })

    this.updateMessageTeaser(message.teaser)

    if (this.openValue) {
      this.messagesAPI.markAsSeen(message.id)
      return
    }

    this.incrementUnreadCounter()
  }

  resizeInput() {
    const maxHeight = 96

    // Temporarily reset height to its natural content size
    this.inputTarget.style.height = 'auto'

    // Set the height to the scrollHeight, which is the minimum height
    // the element needs to fit its content without a scrollbar.
    const scrollHeight = this.inputTarget.scrollHeight

    this.inputTarget.style.height = `${Math.min(scrollHeight, maxHeight)}px`
  }

  async sendQuickReplyMessage({ detail: { id, product, buttonId, body, cardElement } }) {
    this.dismissTeaserForSession?.()

    const formData = new FormData()

    formData.append('message[body]', body)
    formData.append('message[replied_to]', id)
    formData.append('message[product]', product)
    formData.append('message[button]', buttonId)

    formData.append('session', Hellotext.session)
    formData.append('locale', Locale.toString())
    this.appendOpeningSequenceMessageIds(formData)

    const element = this.buildMessageElement()
    const attachment = cardElement.querySelector('img')?.cloneNode(true)

    element.querySelector('[data-body]').innerText = body

    if (attachment) {
      attachment.removeAttribute('width')
      attachment.removeAttribute('height')

      this.messageAttachmentsContainer(element)?.appendChild(attachment)
    }

    if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
      this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget)
    } else {
      this.messagesContainerTarget.appendChild(element)
    }

    element.scrollIntoView({ behavior: 'smooth' })

    this.broadcastChannel.postMessage({
      type: 'message:sent',
      element: element.outerHTML,
    })

    const response = await this.messagesAPI.create(formData)

    if (response.failed) {
      // Clear the optimistic typing indicator on failure
      clearTimeout(this.optimisticTypingTimeout)

      return this.markMessageFailedFromResponse(response, element)
    }

    const data = await response.json()

    this.dispatch('set:id', { target: element, detail: data.id })
    this.clearRevealedOpeningSequenceMessageIds()

    const message = {
      id: data.id,
      body: body,
      attachments: attachment ? [attachment.src] : [],
      replied_to: id,
      product: product,
      button: buttonId,
      type: 'quick_reply',
    }

    Hellotext.eventEmitter.dispatch('webchat:message:sent', message)
  }

  async sendTeaserQuickReply(event) {
    event.preventDefault()
    event.stopPropagation()

    const button = event.currentTarget
    const value = (button.dataset.value || '').trim()
    const label = [button.dataset.text, button.textContent]
      .map(text => (text || '').trim())
      .find(text => text.length > 0)
    const text = value || label

    if (!text) return

    this.dismissTeaserForSession?.()
    this.show()

    const buttonType = (button.dataset.type || '').trim() || 'quick_reply'
    const formData = new FormData()

    formData.append('message[body]', text)
    formData.append('session', Hellotext.session)
    formData.append('locale', Locale.toString())
    this.appendOpeningSequenceMessageIds(formData)

    const element = this.buildMessageElement()

    element.querySelector('[data-body]').innerText = text

    if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
      this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget)
    } else {
      this.messagesContainerTarget.appendChild(element)
    }

    element.scrollIntoView({ behavior: 'smooth' })

    this.broadcastChannel.postMessage({
      type: 'message:sent',
      element: element.outerHTML,
    })

    if (!this.typingIndicatorVisible) {
      clearTimeout(this.optimisticTypingTimeout)
      this.optimisticTypingTimeout = setTimeout(() => {
        this.showOptimisticTypingIndicator()
      }, this.optimisticTypingIndicatorWaitValue)
    }

    const response = await this.messagesAPI.create(formData)

    if (response.failed) {
      clearTimeout(this.optimisticTypingTimeout)

      return this.markMessageFailedFromResponse(response, element)
    }

    const data = await response.json()
    element.setAttribute('data-id', data.id)
    this.clearRevealedOpeningSequenceMessageIds()

    Hellotext.eventEmitter.dispatch('webchat:message:sent', {
      id: data.id,
      body: text,
      attachments: [],
      type: 'quick_reply',
      teaser: {
        text: label || text,
        value: value || text,
        type: buttonType,
      },
    })

    if (data.conversation && data.conversation !== this.conversationIdValue) {
      this.conversationIdValue = data.conversation
      this.webChatChannel.updateSubscriptionWith(this.conversationIdValue)
    }

    if (this.typingIndicatorVisible) {
      this.resetTypingIndicatorTimer()
    }
  }

  async sendMessage(e) {
    const message = {
      body: this.inputTarget.value,
      attachments: this.files,
    }

    if (this.inputTarget.value.trim().length === 0 && this.files.length === 0) {
      if (e && e.target) {
        e.preventDefault()
      }

      return
    }

    this.dismissTeaserForSession?.()

    const formData = new FormData()

    if (this.inputTarget.value.trim().length > 0) {
      formData.append('message[body]', this.inputTarget.value)
    } else {
      delete message.body
    }

    this.files.forEach(file => {
      formData.append('message[attachments][]', file)
    })

    formData.append('session', Hellotext.session)
    formData.append('locale', Locale.toString())
    this.appendOpeningSequenceMessageIds(formData)

    const element = this.buildMessageElement()

    if (this.inputTarget.value.trim().length > 0) {
      element.querySelector('[data-body]').innerText = this.inputTarget.value
    } else {
      element.querySelector('[data-message-bubble]').remove()
    }

    const attachments = this.attachmentContainerTarget.querySelectorAll('img')

    if (attachments.length > 0) {
      attachments.forEach(attachment => {
        this.messageAttachmentsContainer(element)?.appendChild(attachment.cloneNode(true))
      })
    }

    // Insert message before typing indicator if one exists
    if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
      this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget)
    } else {
      this.messagesContainerTarget.appendChild(element)
    }

    element.scrollIntoView({ behavior: 'smooth' })

    this.broadcastChannel.postMessage({
      type: 'message:sent',
      element: element.outerHTML,
    })

    this.inputTarget.value = ''
    this.resizeInput()
    this.files = []

    this.attachmentInputTarget.value = ''
    this.attachmentContainerTarget.innerHTML = ''

    this.attachmentContainerTarget.style.display = 'none'
    this.errorMessageContainerTarget.style.display = 'none'

    this.inputTarget.focus()

    // Set up optimistic typing indicator BEFORE making the API call
    // This prevents race conditions with server responses
    if (!this.typingIndicatorVisible) {
      clearTimeout(this.optimisticTypingTimeout)
      this.optimisticTypingTimeout = setTimeout(() => {
        this.showOptimisticTypingIndicator()
      }, this.optimisticTypingIndicatorWaitValue)
    }

    const response = await this.messagesAPI.create(formData)

    if (response.failed) {
      // Clear the optimistic typing indicator on failure
      clearTimeout(this.optimisticTypingTimeout)

      return this.markMessageFailedFromResponse(response, element)
    }

    const data = await response.json()
    element.setAttribute('data-id', data.id)
    message.id = data.id
    this.clearRevealedOpeningSequenceMessageIds()

    Hellotext.eventEmitter.dispatch('webchat:message:sent', message)

    if (data.conversation !== this.conversationIdValue) {
      this.conversationIdValue = data.conversation
      this.webChatChannel.updateSubscriptionWith(this.conversationIdValue)
    }

    // If there's already a typing indicator visible, reset its timer
    if (this.typingIndicatorVisible) {
      this.resetTypingIndicatorTimer()
    }

    this.attachmentContainerTarget.style.display = ''
  }

  buildMessageElement() {
    const element = this.messageTemplateTarget.cloneNode(true)

    element.id = `hellotext--webchat--${this.idValue}--message--${Date.now()}`

    element.classList.add('received')
    element.style.removeProperty('display')

    element.setAttribute('data-controller', 'hellotext--message')
    element.setAttribute('data-hellotext--webchat-target', 'message')

    return element
  }

  focusCompose(event) {
    const { target } = event
    const ignoredSelector = [
      'button',
      'a',
      'input',
      'textarea',
      'select',
      'label',
      '[role="button"]',
      'em-emoji-picker',
      '[data-hellotext--webchat--emoji-target~="popover"]',
      '[data-controller~="hellotext--webchat--emoji"]',
    ].join(', ')

    if (!this.hasInputTarget || target.closest(ignoredSelector)) return

    event.preventDefault()
    this.inputTarget.focus()

    if (typeof this.inputTarget.selectionStart === 'number') {
      const position = this.inputTarget.value.length
      this.inputTarget.setSelectionRange(position, position)
    }
  }

  closePopoverFromHeader({ target }) {
    if (target.closest('.hellotext--webchat-header-channel-button, .hellotext--webchat-close-button')) return

    this.closePopover()
  }

  async markMessageFailedFromResponse(response, element) {
    const reason = await this.messageFailureReason(response)

    this.markMessageFailed(element, reason)
    this.broadcastChannel.postMessage({
      type: 'message:failed',
      id: element.id,
      reason,
    })
  }

  markMessageFailed(element, reason) {
    if (!element) return

    element.classList.add('failed')

    if (!reason) return

    const timestamp = element.querySelector('[data-message-timestamp]')

    if (timestamp) {
      timestamp.textContent = reason
    }
  }

  async messageFailureReason(response) {
    const nativeResponse = response?.data || response?.response
    const fallback = nativeResponse?.statusText || 'Message failed'

    try {
      const jsonResponse = nativeResponse?.clone ? nativeResponse.clone() : nativeResponse
      const payload = await jsonResponse?.json?.()
      const reason = this.messageFailureReasonFromPayload(payload)

      if (reason) return reason
    } catch (_) {
      // Fall through to text parsing/fallback. Some stores strip content-type or
      // return non-JSON failures, so the timestamp still needs a useful reason.
    }

    try {
      const textResponse = nativeResponse?.clone ? nativeResponse.clone() : nativeResponse
      const text = await textResponse?.text?.()

      return this.messageFailureReasonFromText(text) || fallback
    } catch (_) {
      return fallback
    }
  }

  messageFailureReasonFromText(text) {
    if (typeof text !== 'string') return null

    const value = text.trim()
    if (!value || value.startsWith('<')) return null

    try {
      return this.messageFailureReasonFromPayload(JSON.parse(value)) || value
    } catch (_) {
      return value
    }
  }

  messageFailureReasonFromPayload(payload) {
    if (!payload) return null

    return [
      payload.error?.message,
      payload.message,
      payload.errors?.message,
      payload.errors?.[0]?.message,
      payload.errors?.[0]?.description,
    ].find(reason => typeof reason === 'string' && reason.trim().length > 0)
  }

  messageAttachmentsContainer(element) {
    return element.querySelector('[data-attachments-container], [data-attachment-container]')
  }

  incrementUnreadCounter() {
    this.unreadCounterTarget.style.display = 'flex'

    const unreadCount = (parseInt(this.unreadCounterTarget.innerText) || 0) + 1
    this.unreadCounterTarget.innerText = Math.min(unreadCount, 9)
  }

  openAttachment() {
    this.attachmentInputTarget.click()
  }

  onFileInputChange() {
    this.errorMessageContainerTarget.style.display = 'none'

    const newFiles = Array.from(this.attachmentInputTarget.files)
    this.attachmentInputTarget.value = ''

    const fileMaxSizeTooMuch = newFiles.find(file => {
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

      return (this.errorMessageContainerTarget.style.display = 'block')
    }

    this.files = [...this.files, ...newFiles]
    this.errorMessageContainerTarget.innerText = ''

    newFiles.forEach(file => this.createAttachmentElement(file))
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

      this.attachmentContainerTarget.appendChild(element)
      this.attachmentContainerTarget.style.display = 'flex'
    }
  }

  removeAttachment({ currentTarget }) {
    const attachment = currentTarget.closest("[data-hellotext--webchat-target='attachment']")

    this.files = this.files.filter(file => file.name !== attachment.dataset.name)
    this.attachmentInputTarget.value = ''

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

  byteToMegabyte(bytes) {
    return Math.ceil(bytes / 1024 / 1024)
  }

  get middlewares() {
    return [offset(this.offsetValue), shift({ padding: this.paddingValue }), flip()]
  }

  get shouldOpenOnMount() {
    return (
      localStorage.getItem(`hellotext--webchat--${this.idValue}`) === 'opened' && !this.onMobile
    )
  }

  get onMobile() {
    return window.matchMedia(`(max-width: ${this.fullScreenThresholdValue}px)`).matches
  }
}
