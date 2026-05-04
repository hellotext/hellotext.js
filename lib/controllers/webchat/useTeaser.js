// The teaser markup is already present in the document; this mixin only manages
// the runtime around it. Keeping the teaser policy here gives the controller one
// place to delegate click-to-open, message cycling, and timer cleanup without
// rebuilding teaser markup from JSON. Message sending stays on the controller
// because it owns the API flow and optimistic customer bubble insertion.
export var useTeaser = controller => {
  Object.assign(controller, {
    // Called from `connect` after `usePopover` has given the controller `show`.
    // The teaser is optional, so setup first prepares reusable lifecycle state
    // and then exits quietly when the page does not include a target.
    setupTeaser() {
      this.teaserCycleTimeout = null;
      this.boundOnTeaserClick = this.boundOnTeaserClick || this.onTeaserClick.bind(this);
      if (!this.hasTeaserTarget) return;
      this.teaserTarget.addEventListener('click', this.boundOnTeaserClick);
      this.startTeaserCycle();
    },
    // This is the shared teardown path for Stimulus disconnect. Cycling timers
    // and DOM listeners both outlive the current call stack, so they need to be
    // cancelled explicitly when the rendered widget leaves the page.
    teardownTeaser() {
      this.stopTeaserCycle();
      if (this.hasTeaserTarget && this.boundOnTeaserClick) {
        this.teaserTarget.removeEventListener('click', this.boundOnTeaserClick);
      }
    },
    // The current DOM is the source of truth. Every cycle pass rereads the
    // current Stimulus targets so an incoming teaser can replace the previous
    // message stack without carrying stale nodes or timers forward.
    startTeaserCycle() {
      this.stopTeaserCycle();
      this.teaserMessages = Array.from(this.teaserMessageTargets || []);
      if (!this.teaserCanRender()) return;
      this.showTeaserMessage(0);
      var totalDelay = this.teaserMessages.reduce((sum, message) => {
        return sum + this.teaserMessageDelay(message);
      }, 0);
      if (this.teaserMessages.length < 2 || totalDelay <= 0) return;
      this.scheduleNextTeaserMessage(0);
    },
    // Delays belong to the message being shown next. That lets the first message
    // appear immediately while each later message controls how long we wait
    // before revealing it, then the same rule applies when looping back.
    scheduleNextTeaserMessage(currentIndex) {
      var nextIndex = (currentIndex + 1) % this.teaserMessages.length;
      var nextMessage = this.teaserMessages[nextIndex];
      var delay = this.teaserMessageDelay(nextMessage) * 1000;
      this.teaserCycleTimeout = window.setTimeout(() => {
        this.showTeaserMessage(nextIndex);
        this.scheduleNextTeaserMessage(nextIndex);
      }, delay);
    },
    // Visibility is managed with the existing `hidden` class for initially
    // concealed teaser messages. This keeps JS from restructuring teaser markup.
    showTeaserMessage(index) {
      this.teaserMessages.forEach((message, messageIndex) => {
        message.classList.toggle('hidden', messageIndex !== index);
      });
    },
    // Safe to call even when no timer exists. Lifecycle hooks call this before
    // starting, hiding, or tearing down the teaser so only one cycle can be alive.
    stopTeaserCycle() {
      if (this.teaserCycleTimeout === null || this.teaserCycleTimeout === undefined) return;
      window.clearTimeout(this.teaserCycleTimeout);
      this.teaserCycleTimeout = null;
    },
    // Invalid or missing delay values should not break teaser rendering. Treat
    // them as zero so a single bad message cannot block the rest of the widget.
    teaserMessageDelay(message) {
      var delay = Number(message.dataset.delaySeconds || 0);
      return Number.isFinite(delay) ? delay : 0;
    },
    // Rendering eligibility is intentionally strict: the markup decides whether
    // the teaser is enabled and whether there is content worth showing. JS only
    // honors the DOM flags and keeps disabled or empty teasers quiet.
    teaserCanRender() {
      return this.hasTeaserTarget && !this.teaserTarget.classList.contains('invisible') && this.teaserTarget.dataset.enabled === 'true' && this.teaserMessages.length > 0;
    },
    // Opening the webchat makes the teaser redundant. Stopping the cycle here
    // prevents hidden teaser messages from continuing to flip in the background.
    hideTeaser() {
      this.stopTeaserCycle();
      if (this.hasTeaserTarget) {
        this.teaserTarget.classList.add('invisible');
      }
    },
    // Closing the webchat restores only enabled teaser content already present in
    // the markup. The old JSON teaser value is intentionally ignored so this
    // client only resumes runtime behavior.
    restoreTeaser() {
      if (!this.hasTeaserTarget || this.teaserTarget.dataset.enabled !== 'true' || this.teaserMessageTargets.length === 0) {
        return;
      }
      this.teaserTarget.classList.remove('invisible');
      this.startTeaserCycle();
    },
    // A teaser surface click is a user request to open chat, but links inside the
    // teaser already have native browser behavior. Leaving anchors alone keeps
    // external URLs and `tel:` actions working without extra JS.
    onTeaserClick(event) {
      if (event.target.closest('a')) return;
      this.show();
    }
  });
};