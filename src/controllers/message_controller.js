import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    id: String,
  }

  static targets = ['carouselContainer', 'leftFade', 'rightFade', 'carouselCard']

  connect() {
    this.updateFades()
  }

  onScroll() {
    this.updateFades()
  }

  quickReply({ currentTarget }) {
    const card = currentTarget.closest('[data-hellotext--message-target="carouselCard"]')

    this.dispatch('quickReply', {
      detail: {
        id: this.idValue,
        cardId: card.dataset.id,
        buttonId: currentTarget.dataset.id,
        body: currentTarget.dataset.text,
      },
    })
  }

  moveToLeft() {
    if (!this.hasCarouselContainerTarget) return

    const scrollAmount = this.getScrollAmount()

    this.carouselContainerTarget.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    })
  }

  moveToRight() {
    if (!this.hasCarouselContainerTarget) return

    const scrollAmount = this.getScrollAmount()

    this.carouselContainerTarget.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }

  getScrollAmount() {
    // Get the actual card width from DOM
    const firstCard = this.containerTarget.querySelector('.message__carousel_card')

    if (!firstCard) {
      return 280 // Fallback to default desktop card width
    }

    const cardWidth = firstCard.offsetWidth
    const gap = 16 // gap-x-4 = 1rem = 16px

    return cardWidth + gap
  }

  updateFades() {
    if (!this.hasCarouselContainerTarget) return

    const scrollLeft = this.carouselContainerTarget.scrollLeft
    const maxScroll =
      this.carouselContainerTarget.scrollWidth - this.carouselContainerTarget.clientWidth

    // Show left fade if scrolled past start
    if (scrollLeft > 0) {
      this.leftFadeTarget.classList.remove('hidden')
    } else {
      this.leftFadeTarget.classList.add('hidden')
    }

    // Show right fade if not at end
    if (scrollLeft < maxScroll - 1) {
      // -1 for rounding errors
      this.rightFadeTarget.classList.remove('hidden')
    } else {
      this.rightFadeTarget.classList.add('hidden')
    }
  }
}
