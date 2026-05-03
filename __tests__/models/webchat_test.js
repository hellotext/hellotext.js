/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { Webchat } from '../../src/models'

describe('Webchat', () => {
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

    Configuration.webchat.container = 'body'
    Configuration.webchat.behaviour = null
    Configuration.webchat.behaviourOverride = false
  })

  it('serializes an explicit camelCase behaviour override onto the Stimulus value', async () => {
    const article = document.createElement('article')
    API.webchats.get.mockResolvedValue(article)

    Configuration.webchat.behaviour = {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: true
    }
    Configuration.webchat.behaviourOverride = true

    await Webchat.load('webchat-id')

    expect(API.webchats.get).toHaveBeenCalledWith('webchat-id')
    expect(document.querySelector('#webchat-container article')).toBe(article)
    expect(JSON.parse(article.getAttribute('data-hellotext--webchat-behaviour-value'))).toEqual({
      trigger: 'on_load',
      delay_seconds: 5,
      first_visit_only: true,
      once_per_session: true
    })
  })

  it('preserves the Rails-rendered behaviour value when no explicit JS override exists', async () => {
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

    await Webchat.load('webchat-id')

    expect(article.getAttribute('data-hellotext--webchat-behaviour-value')).toBe(renderedBehaviour)
  })
})
