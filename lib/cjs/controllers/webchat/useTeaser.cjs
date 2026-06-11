"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTeaser = void 0;
// The teaser markup is already present in the document; this mixin only manages
// the runtime around it. Keeping the teaser policy here gives the controller one
// place to delegate click-to-open, the pre-conversation presentation, and timer
// cleanup. Message sending stays on the controller because it owns the API flow
// and optimistic customer bubble insertion.
const useTeaser = controller => {
  Object.assign(controller, {
    // Called from `connect` after `usePopover` has given the controller `show`.
    // The teaser is optional, so setup first prepares reusable lifecycle state,
    // wires the click surface when present, and then lets eligibility decide
    // whether this session may still show the presentation.
    setupTeaser() {
      this.teaserCycleTimeout = null;
      this.teaserMessages = [];
      this.boundOnTeaserClick = this.boundOnTeaserClick || this.onTeaserClick.bind(this);
      if (!this.hasTeaserTarget) return;
      this.teaserTarget.addEventListener('click', this.boundOnTeaserClick);
      this.startTeaserPresentation();
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
    // The current DOM is the source of truth. Each setup pass collects the
    // rendered teaser messages from the teaser surface itself, which keeps the
    // target list small and avoids carrying stale nodes between presentations.
    collectTeaserMessages() {
      if (!this.hasTeaserTarget) return [];
      return Array.from(this.teaserTarget.querySelectorAll('[data-teaser-message]'));
    },
    // The teaser is a one-time, pre-conversation presentation. It can run while
    // the popover is closed, but any active conversation signal makes the teaser
    // ineligible for the rest of this browser session.
    startTeaserPresentation() {
      this.stopTeaserCycle();
      this.teaserMessages = this.collectTeaserMessages();
      if (!this.hasTeaserTarget) return;
      if (this.teaserMessages.length === 0) {
        this.hideTeaser();
        return;
      }
      if (this.openValue) {
        this.dismissTeaserForSession();
        return;
      }
      if (this.conversationIdValue || this.hasRenderedConversationMessages()) {
        this.dismissTeaserForSession();
        return;
      }
      if (this.teaserSeenForSession()) {
        this.hideTeaser();
        return;
      }
      this.teaserTarget.classList.remove('invisible');
      this.showTeaserMessage(0);
      if (this.teaserMessages.length < 2) return;
      this.scheduleNextTeaserMessage(0);
    },
    // Delays belong to the currently visible message, so each teaser controls
    // how long it remains on screen before the next one replaces it. The
    // presentation stops after the last message instead of looping forever.
    scheduleNextTeaserMessage(currentIndex) {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= this.teaserMessages.length) return;
      const currentMessage = this.teaserMessages[currentIndex];
      const delay = this.teaserPresentationDelay(currentMessage);
      this.teaserCycleTimeout = window.setTimeout(() => {
        this.teaserCycleTimeout = null;
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
    // them as zero, then use a small minimum so zero-delay presentations advance
    // deliberately instead of flashing through every message in one frame.
    teaserMessageDelay(message) {
      const delay = Number(message.dataset.delaySeconds || 0);
      return Number.isFinite(delay) ? delay : 0;
    },
    teaserPresentationDelay(message) {
      return Math.max(this.teaserMessageDelay(message) * 1000, 250);
    },
    // A rendered transcript means the visitor is no longer in the pre-conversation
    // state. The hidden template is deliberately excluded because it is not a live
    // customer-visible message.
    hasRenderedConversationMessages() {
      let messages = [];
      try {
        messages = Array.from(this.messageTargets || []);
      } catch (_error) {
        messages = [];
      }
      return messages.some(message => message !== this.messageTemplateTarget);
    },
    teaserSeenKey() {
      const teaserVersion = this.hasTeaserTarget ? this.teaserTarget.dataset.teaserVersion : '';
      const versionSegment = teaserVersion ? `:${teaserVersion}` : '';
      return `hellotext:webchat:${this.idValue || this.element.id}:teaser-seen${versionSegment}`;
    },
    teaserSeenForSession() {
      try {
        return window.sessionStorage.getItem(this.teaserSeenKey()) === 'true';
      } catch (_error) {
        return false;
      }
    },
    markTeaserSeenForSession() {
      try {
        window.sessionStorage.setItem(this.teaserSeenKey(), 'true');
      } catch (_error) {
        // Storage can be unavailable in locked-down browsers. The in-memory hide
        // still keeps the active controller from showing the teaser again.
      }
    },
    // Opening or sending ends the pre-conversation window for this browser
    // session. Incoming message teasers are separate ephemeral content, so they
    // use `hideTeaser`/`updateMessageTeaser` without writing this session flag.
    dismissTeaserForSession() {
      this.markTeaserSeenForSession();
      this.hideTeaser();
    },
    // Stopping the timer before hiding prevents queued presentation steps from
    // flipping hidden messages after the teaser surface has been dismissed.
    hideTeaser() {
      this.stopTeaserCycle();
      if (this.hasTeaserTarget) {
        this.teaserTarget.classList.add('invisible');
      }
    },
    // A teaser surface click is a user request to open chat, but links inside the
    // teaser already have native browser behavior. Leaving anchors alone keeps
    // external URLs and `tel:` actions working without extra JS.
    onTeaserClick(event) {
      if (event.target.closest('a')) return;
      this.dismissTeaserForSession();
      this.show();
    }
  });
};
exports.useTeaser = useTeaser;