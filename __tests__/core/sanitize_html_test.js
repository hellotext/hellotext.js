/**
 * @jest-environment jsdom
 */

import {
  sanitizedRichTextFragment,
  sanitizedWebchatComponentFragment,
  setSanitizedRichText,
} from '../../src/core/sanitize_html'

describe('sanitizedRichTextFragment', () => {
  it('preserves rich text while removing executable markup', () => {
    const fragment = sanitizedRichTextFragment(`
      <p class="copy" style="color: red"><strong>Safe content</strong></p>
      <a href="https://example.com" target="_blank">Safe link</a>
      <a href="javascript:alert(1)">Unsafe link</a>
      <figure><img src="https://example.com/image.jpg" onerror="alert(1)"><figcaption>Image</figcaption></figure>
      <script>alert(1)</script>
    `)

    expect(fragment.querySelector('p').className).toBe('copy')
    expect(fragment.querySelector('p').style.color).toBe('red')
    expect(fragment.querySelector('strong').textContent).toBe('Safe content')
    expect(fragment.querySelector('a').getAttribute('href')).toBe('https://example.com')
    expect(fragment.querySelector('a').getAttribute('target')).toBe('_blank')
    expect(fragment.querySelector('a').getAttribute('rel')).toBe('noopener noreferrer')
    expect(fragment.querySelectorAll('a')[1].hasAttribute('href')).toBe(false)
    expect(fragment.querySelector('figure figcaption').textContent).toBe('Image')
    expect(fragment.querySelector('img').hasAttribute('onerror')).toBe(false)
    expect(fragment.querySelector('script')).toBeNull()
  })
})

describe('sanitizedWebchatComponentFragment', () => {
  it('preserves Webchat SVG and custom elements while removing executable markup', () => {
    const fragment = sanitizedWebchatComponentFragment(`
      <article data-controller="hellotext--message">
        <hellotext-icon>
          <svg viewBox="0 0 24 24">
            <path d="M1 1h2v2z"></path>
            <script>alert(1)</script>
            <foreignObject><iframe src="https://example.com"></iframe></foreignObject>
          </svg>
        </hellotext-icon>
        <button data-action="click->hellotext--message#quickReply" onclick="alert(1)">Reply</button>
        <a href="javascript:alert(1)">Unsafe link</a>
      </article>
    `)

    expect(fragment.querySelector('article').dataset.controller).toBe('hellotext--message')
    expect(fragment.querySelector('hellotext-icon svg path').getAttribute('d')).toBe('M1 1h2v2z')
    expect(fragment.querySelector('button').dataset.action).toBe(
      'click->hellotext--message#quickReply',
    )
    expect(fragment.querySelector('button').hasAttribute('onclick')).toBe(false)
    expect(fragment.querySelector('a').hasAttribute('href')).toBe(false)
    expect(fragment.querySelector('script')).toBeNull()
    expect(fragment.querySelector('foreignObject')).toBeNull()
    expect(fragment.querySelector('iframe')).toBeNull()
  })
})

describe('setSanitizedRichText', () => {
  it('replaces existing content with sanitized HTML', () => {
    const element = document.createElement('div')
    element.textContent = 'Old content'

    setSanitizedRichText(element, '<em>New content</em><script>alert(1)</script>')

    expect(element.innerHTML).toBe('<em>New content</em>')
  })
})
