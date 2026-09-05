/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { Webchat } from '../../src/models'

describe('Webchat', () => {
  const createStylesheet = ({ loaded = true } = {}) => {
    const linkTag = document.createElement('link')
    linkTag.rel = 'stylesheet'
    linkTag.href = 'https://example.com/hellotext.css'
    linkTag.setAttribute('data-hellotext-stylesheet', 'true')

    if (loaded) {
      linkTag.dataset.hellotextStylesheetLoaded = 'true'
    }

    document.head.appendChild(linkTag)

    return linkTag
  }

  const markStylesheetLoaded = linkTag => {
    Object.defineProperty(linkTag, 'sheet', {
      value: {},
      configurable: true
    })
    linkTag.dispatchEvent(new Event('load'))
  }

  beforeEach(() => {
    document.body.innerHTML = '<main id="webchat-container"></main>'

    Configuration.webchat.container = '#webchat-container'
    Configuration.webchat.behaviour = null
    Configuration.webchat.behaviourOverride = false

    jest.spyOn(API.webchats, 'get')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      link.dispatchEvent(new Event('error'))
      link.remove()
    })

    Configuration.webchat.container = 'body'
    Configuration.webchat.behaviour = null
    Configuration.webchat.behaviourOverride = false
  })

  it('serializes an explicit camelCase behaviour override onto the Stimulus value', async () => {
    createStylesheet()

    const article = document.createElement('article')
    API.webchats.get.mockResolvedValue(article)

    Configuration.webchat.behaviour = {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: true
    }
    Configuration.webchat.behaviourOverride = true

    const webchat = await Webchat.load('webchat-id')
    await webchat.rendered

    expect(API.webchats.get).toHaveBeenCalledWith('webchat-id')
    expect(document.querySelector('#webchat-container article')).toBe(article)
    expect(JSON.parse(article.getAttribute('data-hellotext--webchat-behaviour-value'))).toEqual({
      trigger: 'on_load',
      delay_seconds: 5,
      first_visit_only: true,
      once_per_session: true
    })
  })

  it('preserves the rendered behaviour value when no explicit JS override exists', async () => {
    createStylesheet()

    const article = document.createElement('article')
    const renderedBehaviour = JSON.stringify({
      trigger: 'on_load',
      delay_seconds: 10,
      first_visit_only: false,
      once_per_session: true
    })
    article.setAttribute('data-hellotext--webchat-behaviour-value', renderedBehaviour)
    API.webchats.get.mockResolvedValue(article)

    Configuration.webchat.behaviour = {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: true
    }
    Configuration.webchat.behaviourOverride = false

    const webchat = await Webchat.load('webchat-id')
    await webchat.rendered

    expect(article.getAttribute('data-hellotext--webchat-behaviour-value')).toBe(renderedBehaviour)
  })

  it('waits for the stylesheet before appending the webchat HTML', async () => {
    const linkTag = createStylesheet({ loaded: false })
    const article = document.createElement('article')
    API.webchats.get.mockResolvedValue(article)

    const webchat = await Webchat.load('webchat-id')
    expect(document.querySelector('#webchat-container article')).toBeNull()

    markStylesheetLoaded(linkTag)
    await webchat.rendered

    expect(document.querySelector('#webchat-container article')).toBe(article)
    expect(webchat.mounted).toBe(true)
  })

  it('does not append the webchat HTML when the stylesheet fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const linkTag = createStylesheet({ loaded: false })
    const article = document.createElement('article')
    API.webchats.get.mockResolvedValue(article)

    const webchat = await Webchat.load('webchat-id')
    linkTag.dispatchEvent(new Event('error'))
    await webchat.rendered

    expect(document.querySelector('#webchat-container article')).toBeNull()
    expect(webchat.mounted).toBe(false)
    expect(warn).toHaveBeenCalledWith(
      'Hellotext webchat was not mounted because its stylesheet failed to load.'
    )
  })
})
