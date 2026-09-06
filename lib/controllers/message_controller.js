import { Controller } from '@hotwired/stimulus';
import Hellotext from '../hellotext';
export default class extends Controller {
  static values = {
    fadeDistance: {
      type: Number,
      default: 64
    },
    id: String,
    kind: String,
    pageStartOffset: {
      type: Number,
      default: 0
    },
    utm: Object
  };
  static targets = ['carouselContainer', 'leftFade', 'rightFade', 'carouselCard'];
  connect() {
    this.updateFades();
    this.observeContainerSize();
  }
  disconnect() {
    this.resizeObserver?.disconnect();
  }
  setId({
    detail: id
  }) {
    this.idValue = id;
    this.element.id = id;
  }
  onScroll() {
    this.updateFades();
  }
  quickReply({
    currentTarget
  }) {
    const card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
    const messageElement = currentTarget.closest('[data-controller~="hellotext--message"]');
    const body = currentTarget.dataset.text || currentTarget.textContent.trim();
    this.dispatch('quickReply', {
      detail: {
        id: this.idValue,
        product: card?.dataset.id,
        buttonId: currentTarget.dataset.id,
        body,
        cardElement: card || messageElement || currentTarget
      }
    });
  }
  addToCart({
    currentTarget
  }) {
    const card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]');
    const {
      id,
      reference,
      source
    } = card.dataset;
    const item = {
      product: id,
      quantity: 1
    };
    if (this.hasUtmValue) Hellotext.page.utm.save(this.utmValue);
    Hellotext.eventEmitter.dispatch('cart.added', {
      object_parameters: {
        items: [{
          ...item,
          ...(reference && {
            reference
          }),
          ...(source && {
            source
          })
        }]
      },
      source: {
        kind: this.kindValue,
        message_id: this.idValue,
        button_id: currentTarget.dataset.id
      }
    });
  }
  moveToLeft() {
    if (!this.hasCarouselContainerTarget) return;
    const nextScrollLeft = this.getPreviousPageScrollLeft();
    const scrollAmount = this.carouselContainerTarget.scrollLeft - nextScrollLeft;
    if (scrollAmount < 1) return;
    this.carouselContainerTarget.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }
  moveToRight() {
    if (!this.hasCarouselContainerTarget) return;
    const nextScrollLeft = this.getNextPageScrollLeft();
    const scrollAmount = nextScrollLeft - this.carouselContainerTarget.scrollLeft;
    if (scrollAmount < 1) return;
    this.carouselContainerTarget.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
  getScrollAmount() {
    return this.getCardScrollAmount();
  }
  getCardScrollAmount() {
    const firstCard = this.carouselContainerTarget.querySelector('.message__carousel_card');
    if (!firstCard) {
      return 280; // Fallback to default desktop card width
    }

    const cardWidth = firstCard.offsetWidth;
    return cardWidth + this.getGap();
  }
  getPageScrollAmount() {
    const scrollAmount = this.carouselContainerTarget.clientWidth - this.getGap();
    return scrollAmount > 0 ? scrollAmount : this.getCardScrollAmount();
  }
  getNextPageScrollLeft() {
    const currentScrollLeft = this.getCurrentScrollLeft();
    const viewportRight = currentScrollLeft + this.carouselContainerTarget.clientWidth;
    const cardMetrics = this.getCardMetrics();
    const nextCard = cardMetrics.find(card => card.end > viewportRight + 1);
    const targetScrollLeft = nextCard ? this.getPageAlignedScrollLeft(nextCard.start) : currentScrollLeft + this.getPageScrollAmount();
    const fallbackScrollLeft = currentScrollLeft + this.getPageScrollAmount();
    return this.clampScrollLeft(targetScrollLeft > currentScrollLeft + 1 ? targetScrollLeft : fallbackScrollLeft);
  }
  getPreviousPageScrollLeft() {
    const currentScrollLeft = this.getCurrentScrollLeft();
    if (currentScrollLeft <= 1) return 0;
    const targetThreshold = Math.max(currentScrollLeft - this.getPageScrollAmount(), 0);
    if (targetThreshold <= 1) return 0;
    const cardMetrics = this.getCardMetrics();
    const previousPageCard = cardMetrics.find(card => card.start >= targetThreshold - 1 && card.start < currentScrollLeft - 1);
    const previousCard = [...cardMetrics].reverse().find(card => card.start < currentScrollLeft - 1);
    return this.getPageAlignedScrollLeft(previousPageCard?.start ?? previousCard?.start ?? 0);
  }
  getPageAlignedScrollLeft(cardStart) {
    const pageStartOffset = this.getPageStartOffset();
    if (cardStart <= pageStartOffset + 1) return 0;
    return this.clampScrollLeft(cardStart - pageStartOffset);
  }
  getCardMetrics() {
    return Array.from(this.carouselContainerTarget.querySelectorAll('.message__carousel_card')).map(card => {
      const start = this.getCardScrollLeft(card);
      return {
        start,
        end: start + card.offsetWidth
      };
    });
  }
  getCardScrollLeft(card) {
    const cardRect = card.getBoundingClientRect();
    const containerRect = this.carouselContainerTarget.getBoundingClientRect();
    if (cardRect.left || cardRect.width || containerRect.left || containerRect.width) {
      return cardRect.left - containerRect.left + this.carouselContainerTarget.scrollLeft;
    }
    return card.offsetLeft || 0;
  }
  getCurrentScrollLeft() {
    return this.clampScrollLeft(this.carouselContainerTarget.scrollLeft);
  }
  clampScrollLeft(scrollLeft) {
    const maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
    return Math.min(Math.max(scrollLeft, 0), maxScroll);
  }
  getGap() {
    const styles = window.getComputedStyle(this.carouselContainerTarget);
    const gap = Number.parseFloat(styles.columnGap || styles.gap);
    return Number.isFinite(gap) ? gap : 16;
  }
  getFadeDistance() {
    return Number.isFinite(this.fadeDistanceValue) ? this.fadeDistanceValue : 64;
  }
  getPageStartOffset() {
    return Number.isFinite(this.pageStartOffsetValue) ? this.pageStartOffsetValue : 0;
  }
  observeContainerSize() {
    if (!this.hasCarouselContainerTarget || !window.ResizeObserver) return;
    this.resizeObserver = new ResizeObserver(() => this.updateFades());
    this.resizeObserver.observe(this.carouselContainerTarget);
  }
  updateFades() {
    if (!this.hasCarouselContainerTarget) return;
    const maxScroll = Math.max(this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth, 0);
    if (maxScroll <= 1) {
      this.hideFade(this.leftFadeTarget);
      this.hideFade(this.rightFadeTarget);
      return;
    }
    const scrollLeft = Math.min(Math.max(this.carouselContainerTarget.scrollLeft, 0), maxScroll);
    const fadeDistance = this.getFadeDistance();
    this.setFadeOpacity(this.leftFadeTarget, scrollLeft / fadeDistance);
    this.setFadeOpacity(this.rightFadeTarget, (maxScroll - scrollLeft) / fadeDistance);
  }
  setFadeOpacity(fadeTarget, opacity) {
    const clampedOpacity = Math.min(Math.max(opacity, 0), 1);
    if (clampedOpacity <= 0.05) {
      this.hideFade(fadeTarget);
      return;
    }
    fadeTarget.classList.remove('hidden');
    fadeTarget.removeAttribute('disabled');
    fadeTarget.removeAttribute('tabindex');
    fadeTarget.setAttribute('aria-hidden', 'false');
    fadeTarget.style.opacity = clampedOpacity.toFixed(3);
    fadeTarget.style.pointerEvents = 'auto';
  }
  hideFade(fadeTarget) {
    fadeTarget.style.opacity = '0';
    fadeTarget.style.pointerEvents = 'none';
    fadeTarget.setAttribute('aria-hidden', 'true');
    fadeTarget.setAttribute('tabindex', '-1');
    if ('disabled' in fadeTarget) fadeTarget.disabled = true;
    fadeTarget.classList.add('hidden');
  }
}