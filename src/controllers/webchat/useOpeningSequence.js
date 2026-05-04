// Opening sequence markup is already present in the document; this mixin only
// manages when those staged messages become visible and which ids should travel
// with the first customer message. It never creates a conversation or posts the
// staged messages by itself.
export const useOpeningSequence = controller => {
  Object.assign(controller, {
    // Called from `connect` to prepare lifecycle state before the webchat opens.
    // The sequence may not exist on every widget, so the rest of the runtime can
    // safely call these helpers even when there are no sequence targets.
    setupOpeningSequence() {
      this.openingSequenceStarted = false
      this.openingSequenceCancelled = false
      this.openingSequenceTimeout = null
      this.openingSequenceMessages = []
      this.revealedOpeningSequenceMessageIds = []
    },

    // Disconnect shares the same cancellation path as a user send. Both cases
    // must stop pending timers so hidden staged messages cannot reveal later.
    teardownOpeningSequence() {
      this.cancelOpeningSequence()
    },

    // The sequence is a first-conversation affordance only. A present
    // conversation id means the transcript already exists, so staged messages
    // should remain untouched.
    startOpeningSequence() {
      this.openingSequenceMessages = Array.from(this.openingSequenceMessageTargets || [])

      if (!this.openingSequenceCanStart()) return

      this.openingSequenceStarted = true
      this.openingSequenceCancelled = false
      this.revealedOpeningSequenceMessageIds = []
      this.playOpeningSequenceMessageAt(0)
    },

    openingSequenceCanStart() {
      return (
        !this.conversationIdValue &&
        this.hasOpeningSequenceTarget &&
        this.openingSequenceMessages.length > 0 &&
        !this.openingSequenceStarted
      )
    },

    // Each staged message owns the delay before it appears. A zero-second delay
    // still uses a timeout so reveal work stays outside the popover-open call
    // stack and cancellation has one consistent path.
    playOpeningSequenceMessageAt(index) {
      const message = this.openingSequenceMessages[index]

      if (!message) return

      const delay = this.openingSequenceMessageDelay(message) * 1000

      this.openingSequenceTimeout = window.setTimeout(() => {
        this.openingSequenceTimeout = null

        if (this.openingSequenceCancelled) return

        this.revealOpeningSequenceMessage(message)
        this.playOpeningSequenceMessageAt(index + 1)
      }, delay)
    },

    // Revealing moves the staged node into the live message list. The message
    // markup itself is preserved; JS only relocates it, unhides it, and remembers
    // the hashed id if the visitor actually saw it.
    revealOpeningSequenceMessage(message) {
      this.messagesContainerTarget.insertBefore(message, this.messageTemplateTarget)
      message.hidden = false
      this.recordOpeningSequenceMessage(message)
      this.scrollOpeningSequenceToBottom()
    },

    recordOpeningSequenceMessage(message) {
      const id = message.dataset.openingSequenceMessageId

      if (!id || this.revealedOpeningSequenceMessageIds.includes(id)) return

      this.revealedOpeningSequenceMessageIds.push(id)
    },

    openingSequenceMessageDelay(message) {
      const delay = Number(message.dataset.delaySeconds || 0)

      return Number.isFinite(delay) ? delay : 0
    },

    scrollOpeningSequenceToBottom() {
      if (!this.messagesContainerTarget.scroll) return

      this.messagesContainerTarget.scroll({
        top: this.messagesContainerTarget.scrollHeight,
        behavior: 'smooth',
      })
    },

    cancelOpeningSequence() {
      this.openingSequenceCancelled = true

      if (this.openingSequenceTimeout === null || this.openingSequenceTimeout === undefined) return

      window.clearTimeout(this.openingSequenceTimeout)
      this.openingSequenceTimeout = null
    },

    // Customer sends promote only what was actually revealed. Calling this also
    // interrupts pending reveals so the payload cannot include later messages.
    appendOpeningSequenceMessageIds(formData) {
      this.cancelOpeningSequence()

      const ids = this.revealedOpeningSequenceMessageIds || []

      ids.forEach(id => {
        formData.append('message[opening_sequence_message_ids][]', id)
      })
    },

    // Clear after a successful customer send. Failed sends keep the ids available
    // so retrying the first message can still promote the revealed sequence.
    clearRevealedOpeningSequenceMessageIds() {
      this.revealedOpeningSequenceMessageIds = []
    },
  })
}
