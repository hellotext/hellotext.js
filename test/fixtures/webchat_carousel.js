export default `
  <article
    class="hellotext--webchat-message"
    data-controller="hellotext--message"
    data-hellotext--message-id-value="message-123"
    data-hellotext--webchat-target="message"
    data-id="message-123"
  >
    <article data-message-bubble>
      <main data-message-body>
        <div data-body><p><strong>Product recommendations</strong></p></div>
      </main>
    </article>

    <div class="message__carousel message__carousel--webchat">
      <section
        class="message__carousel__container"
        data-hellotext--message-target="carouselContainer"
        data-action="scroll->hellotext--message#onScroll"
      >
        <article
          class="message__carousel_card"
          data-hellotext--message-target="carouselCard"
          data-id="product-123"
          data-reference="sku-123"
          data-source="shopify"
        >
          <a
            class="message__carousel_card--image-wrapper"
            href="https://example.com/products/product-123"
            target="_blank"
          >
            <img src="https://example.com/product-123.jpg" width="220" height="160">
          </a>

          <button
            type="button"
            data-id="button-123"
            data-action="click->hellotext--message#addToCart"
          >
            <hellotext-icon>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g stroke="currentColor" stroke-width="currentStroke" stroke-linecap="round">
                  <path d="M1 4.564L11.815 2l10.192 2.555"></path>
                </g>
              </svg>
            </hellotext-icon>
            <span>Add to cart</span>
          </button>
        </article>
      </section>

      <button
        type="button"
        aria-label="Back"
        data-hellotext--message-target="leftFade"
        data-action="click->hellotext--message#moveToLeft"
      >
        <hellotext-icon>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 16L10 12L14 8" stroke="currentColor" stroke-width="currentStroke"></path>
          </svg>
        </hellotext-icon>
      </button>

      <button
        type="button"
        aria-label="Next"
        data-hellotext--message-target="rightFade"
        data-action="click->hellotext--message#moveToRight"
      >
        <hellotext-icon>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16L14 12L10 8" stroke="currentColor" stroke-width="currentStroke"></path>
          </svg>
        </hellotext-icon>
      </button>
    </div>

    <time data-message-timestamp datetime="2026-07-24T12:00:00Z">12:00 PM</time>
  </article>
`
