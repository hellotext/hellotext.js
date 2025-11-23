import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['container', 'leftFade', 'rightFade']

  connect() {
    this.updateFades()
  }

  onScroll() {
    this.updateFades()
  }

  moveToLeft() {
    const scrollAmount = this.getScrollAmount()

    this.containerTarget.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    })
  }

  moveToRight() {
    const scrollAmount = this.getScrollAmount()

    this.containerTarget.scrollBy({
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
    const scrollLeft = this.containerTarget.scrollLeft
    const maxScroll = this.containerTarget.scrollWidth - this.containerTarget.clientWidth

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
