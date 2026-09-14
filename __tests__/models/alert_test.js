import { Application } from '@hotwired/stimulus'
import AlertController from '../../src/controllers/alert_controller'
import { Alert } from '../../src/models/alert'
import API from '../../src/api'
import Hellotext from '../../src/hellotext'
import { Page } from '../../src/models/page'

const sections = [
  {
    kind: 'homepage',
    title: 'Homepage updates',
    description: 'Hear about new arrivals.',
    primary_action: 'Activate alerts',
    secondary_action: 'Not now',
  },
  {
    kind: 'product_details',
    title: 'Product updates',
    description: 'Hear when this product returns.',
    primary_action: 'Notify me',
    secondary_action: 'Later',
  },
]

const html = `
  <article hidden data-controller="hellotext--alert"
    data-hellotext--alert-sections-value='${JSON.stringify(sections)}'>
    <h4 data-hellotext--alert-target="title"></h4>
    <p data-hellotext--alert-target="description"></p>
    <button data-hellotext--alert-target="primaryAction"
      data-action="click->hellotext--alert#subscribe"></button>
    <button data-hellotext--alert-target="secondaryAction"
      data-action="click->hellotext--alert#hide"></button>
  </article>
`

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

describe('Alert', () => {
  let application
  let alert
  let business
  let push
  let notificationDescriptor
  let previousPage

  beforeEach(async () => {
    previousPage = Hellotext.page
    Hellotext.page = new Page()
    document.body.innerHTML = ''
    localStorage.clear()
    jest.spyOn(API.pushAlerts, 'create').mockResolvedValue({ succeeded: true })
    notificationDescriptor = Object.getOwnPropertyDescriptor(window, 'Notification')
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { permission: 'default' },
    })
    business = { id: 'alert-model-business', stylesheetLoaded: Promise.resolve(true) }
    push = { ready: Promise.resolve(), subscribed: false, disposed: false }
    application = new Application(document.documentElement)
    application.register('hellotext--alert', AlertController)
    await application.start()
  })

  afterEach(() => {
    alert?.dispose()
    application.stop()
    jest.restoreAllMocks()
    Hellotext.page = previousPage
    document.body.innerHTML = ''
    if (notificationDescriptor) {
      Object.defineProperty(window, 'Notification', notificationDescriptor)
    } else {
      delete window.Notification
    }
  })

  it('waits for the stylesheet and controller before showing a requested section', async () => {
    const stylesheet = deferred()
    business.stylesheetLoaded = stylesheet.promise
    alert = new Alert({ html }, business, push)

    const shown = alert.show('product_details', { title: 'This product is coming back', primaryAction: 'Notify me about this product' })

    expect(document.querySelector('article')).toBeNull()
    stylesheet.resolve(true)

    await expect(shown).resolves.toBe(true)
    expect(document.querySelector('article')).toBe(alert.element)
    expect(alert.element.hidden).toBe(false)
    expect(alert.element.querySelector('h4').textContent).toBe('This product is coming back')
    expect(alert.element.querySelector('p').textContent).toBe('Hear when this product returns.')
    expect(alert.element.querySelector('button').textContent).toBe('Notify me about this product')
  })

  it('keeps the mounted alert hidden until a section is requested', async () => {
    alert = new Alert({ html }, business, push)

    await expect(alert.ready).resolves.toBe(true)

    expect(document.querySelector('article')).toBe(alert.element)
    expect(alert.element.hidden).toBe(true)
  })

  it('does not mount or show when the stylesheet fails', async () => {
    business.stylesheetLoaded = Promise.resolve(false)
    alert = new Alert({ html }, business, push)

    await expect(alert.ready).resolves.toBe(false)
    await expect(alert.show('homepage')).resolves.toBe(false)
    expect(document.querySelector('article')).toBeNull()
  })

  it('ignores payloads without an alert controller element', async () => {
    alert = new Alert({ html: '<p>No alert configured</p>' }, business, push)

    await expect(alert.ready).resolves.toBe(false)
    await expect(alert.show('homepage')).resolves.toBe(false)
    expect(document.body.innerHTML).toBe('')
  })

  it('uses the latest section requested before mounting finishes', async () => {
    const stylesheet = deferred()
    business.stylesheetLoaded = stylesheet.promise
    alert = new Alert({ html }, business, push)
    const homepage = alert.show('homepage')
    const product = alert.show('product_details')

    stylesheet.resolve(true)

    await expect(homepage).resolves.toBe(false)
    await expect(product).resolves.toBe(true)
    expect(alert.element.querySelector('h4').textContent).toBe('Product updates')
  })

  it('cancels a queued show when hidden before mounting', async () => {
    const stylesheet = deferred()
    business.stylesheetLoaded = stylesheet.promise
    alert = new Alert({ html }, business, push)
    const shown = alert.show('homepage')

    alert.hide()
    stylesheet.resolve(true)

    await expect(shown).resolves.toBe(false)
    expect(alert.element.hidden).toBe(true)
    expect(localStorage.length).toBe(0)
  })

  it('does not mount an alert disposed while waiting for its stylesheet', async () => {
    const stylesheet = deferred()
    business.stylesheetLoaded = stylesheet.promise
    alert = new Alert({ html }, business, push)
    const shown = alert.show('homepage')

    alert.dispose()
    stylesheet.resolve(true)

    await expect(shown).resolves.toBe(false)
    expect(document.querySelector('article')).toBeNull()
  })

  it('removes a mounted alert and cancels showing while Push restores', async () => {
    const restored = deferred()
    push.ready = restored.promise
    alert = new Alert({ html }, business, push)
    await alert.ready
    const shown = alert.show('homepage')
    await Promise.resolve()

    alert.dispose()
    restored.resolve()

    await expect(shown).resolves.toBe(false)
    expect(document.querySelector('article')).toBeNull()
    expect(alert.element.hidden).toBe(true)
  })

  it('hides without recording a dismissal and can be shown again', async () => {
    alert = new Alert({ html }, business, push)
    await alert.show('homepage')

    alert.hide()

    expect(alert.element.hidden).toBe(true)
    expect(localStorage.length).toBe(0)
    await expect(alert.show('product_details')).resolves.toBe(true)
  })
})
