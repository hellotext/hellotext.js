// This mixin owns automatic opening only. The webchat controller still owns the
// Stimulus lifecycle and `usePopover` still owns the mechanics of opening and
// closing the popover. Keeping this policy here gives the Rails/dashboard
// behaviour value one place to translate into timers, storage gates, and cleanup.
export const useBehaviour = controller => {
  Object.assign(controller, {
    // Called from `connect` after the controller has wired channels, targets,
    // and popover state. Even a zero-second delay goes through a timeout so the
    // automatic open happens after the mount pass rather than during setup.
    scheduleBehaviourOpen() {
      if (!this.shouldAutoOpenFromBehaviour()) return

      const delay = Number(this.behaviourValue.delay_seconds || 0) * 1000

      this.behaviourOpenTimeout = window.setTimeout(() => {
        this.behaviourOpenTimeout = null

        if (this.openValue) return

        this.openValue = true
        this.markBehaviourAutoOpened()
      }, delay)
    },

    // This is the shared escape hatch for lifecycle teardown and manual user
    // intent. `disconnect` calls it to avoid orphaned timers; `usePopover`
    // calls it before show/toggle so a delayed behaviour cannot reopen the chat
    // or consume gates after the user has already acted.
    cancelBehaviourOpen() {
      window.clearTimeout(this.behaviourOpenTimeout)
      this.behaviourOpenTimeout = null
    },

    // Eligibility is deliberately read-only. A visit should only be marked as
    // auto-opened after the timer opens the widget, not when we merely discover
    // that it would be allowed. That keeps blocked, cancelled, and manually
    // opened visits from being counted as behaviour-driven opens.
    shouldAutoOpenFromBehaviour() {
      const behaviour = this.behaviourValue

      if (!behaviour || behaviour.trigger !== 'on_load') return false

      if (behaviour.first_visit_only && localStorage.getItem(this.firstVisitKey())) {
        return false
      }

      if (behaviour.once_per_session && sessionStorage.getItem(this.sessionKey())) {
        return false
      }

      return true
    },

    // The gates are independent because they answer different product
    // questions. `first_visit_only` is a long-lived visitor gate in
    // localStorage; `once_per_session` is intentionally softer and resets with
    // sessionStorage.
    markBehaviourAutoOpened() {
      if (this.behaviourValue.first_visit_only) {
        localStorage.setItem(this.firstVisitKey(), '1')
      }

      if (this.behaviourValue.once_per_session) {
        sessionStorage.setItem(this.sessionKey(), '1')
      }
    },

    // Records that this widget has already used its long-lived first-visit
    // automatic open. This is the durable gate behind `first_visit_only`.
    firstVisitKey() {
      return `hellotext--webchat--${this.idValue}--auto-opened`
    },

    // Records that this widget has already used its automatic open during the
    // current browser session. This is the shorter-lived gate behind
    // `once_per_session`.
    sessionKey() {
      return `hellotext--webchat--${this.idValue}--auto-opened-session`
    },
  })
}
