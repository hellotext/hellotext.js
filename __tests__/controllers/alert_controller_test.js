import { Application } from '@hotwired/stimulus'
import AlertController from '../../src/controllers/alert_controller'
import Hellotext from '../../src/hellotext'
import API from '../../src/api'
import { Alert } from '../../src/models/alert'

const DAY = 24 * 60 * 60 * 1000
const sections = ['homepage', 'product_collection', 'product_details'].map(kind => ({
  kind,
  title: `${kind} title`,
  description: `${kind} description`,
  primary_action: `${kind} subscribe`,
  secondary_action: `${kind} dismiss`,
}))

const alertHTML = (content = sections) => {
  const element = document.createElement('article')
  element.setAttribute('hidden', '')
  element.dataset.controller = 'hellotext--alert'
  element.setAttribute('data-hellotext--alert-sections-value', JSON.stringify(content))
  element.innerHTML = `
    <h4 data-hellotext--alert-target="title"></h4>
    <p data-hellotext--alert-target="description"></p>
    <button data-hellotext--alert-target="primaryAction"
      data-action="click->hellotext--alert#subscribe"></button>
    <button data-hellotext--alert-target="secondaryAction"
      data-action="click->hellotext--alert#hide"></button>
  `
  return element.outerHTML
}

describe('Smart Alert interactions', () => {
  let application
  let alert
  let business
  let push
  let now
  let originalNotification
  let events
  let businessNumber = 0

  const primary = () => alert.element.querySelector('[data-hellotext--alert-target="primaryAction"]')
  const secondary = () => alert.element.querySelector('[data-hellotext--alert-target="secondaryAction"]')
  const saved = () => JSON.parse(localStorage.getItem(`hellotext:alert:${business.id}`))

  beforeEach(async () => {
    jest.spyOn(API.pushAlerts, 'create').mockResolvedValue({ succeeded: true })
    localStorage.clear()
    document.body.innerHTML = ''
    originalNotification = global.Notification
    global.Notification = { permission: 'default', requestPermission: jest.fn() }
    now = Date.UTC(2026, 8, 6)
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    business = { id: `alert-business-${++businessNumber}`, stylesheetLoaded: Promise.resolve(true) }
    push = {
      ready: Promise.resolve(),
      subscribed: false,
      disposed: false,
      subscribe: jest.fn().mockImplementation(async () => {
        push.subscribed = true
        return { succeeded: true }
      }),
    }
    application = Application.start()
    application.register('hellotext--alert', AlertController)
    alert = new Alert({ html: alertHTML() }, business, push)
    await alert.ready

    events = { shown: jest.fn(), dismissed: jest.fn(), accepted: jest.fn() }
    Object.entries(events).forEach(([name, callback]) => Hellotext.on(`alert:${name}`, callback))
  })

  afterEach(async () => {
    alert.dispose()
    await Promise.resolve()
    application.stop()
    jest.restoreAllMocks()
    global.Notification = originalNotification
    document.body.innerHTML = ''
    Object.entries(events).forEach(([name, callback]) => Hellotext.removeEventListener(`alert:${name}`, callback))
  })

  it('starts hidden and switches all four fields without requesting permission', async () => {
    expect(alert.element.hidden).toBe(true)

    for (const section of sections) {
      await expect(alert.show(section.kind)).resolves.toBe(true)
      expect(alert.element.hidden).toBe(false)
      expect(alert.element.querySelector('h4').textContent).toBe(section.title)
      expect(alert.element.querySelector('p').textContent).toBe(section.description)
      expect(primary().textContent).toBe(section.primary_action)
      expect(secondary().textContent).toBe(section.secondary_action)
    }

    expect(push.subscribe).not.toHaveBeenCalled()
    expect(Notification.requestPermission).not.toHaveBeenCalled()
    expect(events.shown.mock.calls).toEqual(sections.map(({ kind }) => [{ kind }]))
    expect(API.pushAlerts.create.mock.calls).toEqual(sections.map(({ kind }) => [{ section: kind, kind: 'shown' }]))
    expect(events.dismissed).not.toHaveBeenCalled()
    expect(events.accepted).not.toHaveBeenCalled()
  })

  it('renders merchant copy as text and hides the previous section for an unknown kind', async () => {
    alert.controller.sectionsValue = [{ ...sections[0], title: '<img src=x onerror=alert(1)>' }]
    await alert.show('homepage')
    expect(alert.element.querySelector('h4').textContent).toBe('<img src=x onerror=alert(1)>')
    expect(alert.element.querySelector('img')).toBeNull()

    await expect(alert.show('product_details')).resolves.toBe(false)
    expect(alert.element.hidden).toBe(true)
    expect(events.shown).toHaveBeenCalledTimes(1)
    expect(events.shown).toHaveBeenCalledWith({ kind: 'homepage' })
  })

  it('renders overrides as text for one call without changing section defaults', async () => {
    const defaults = alert.controller.sectionsValue
    const options = {
      title: '<b data-untrusted>New title</b>',
      description: '<i data-untrusted>New description</i>',
      primaryAction: '<span data-untrusted>Notify me</span>',
      secondaryAction: '<span data-untrusted>Maybe later</span>',
    }

    await expect(alert.show('homepage', options)).resolves.toBe(true)
    expect(alert.element.querySelector('h4').textContent).toBe(options.title)
    expect(alert.element.querySelector('p').textContent).toBe(options.description)
    expect(primary().textContent).toBe(options.primaryAction)
    expect(secondary().textContent).toBe(options.secondaryAction)
    expect(alert.element.querySelector('[data-untrusted]')).toBeNull()
    expect(alert.controller.sectionsValue).toEqual(defaults)

    await alert.show('homepage')
    expect(alert.element.querySelector('h4').textContent).toBe(sections[0].title)
    expect(alert.element.querySelector('p').textContent).toBe(sections[0].description)
    expect(primary().textContent).toBe(sections[0].primary_action)
    expect(secondary().textContent).toBe(sections[0].secondary_action)
  })

  it('permits empty overrides and falls back to defaults for null or undefined', async () => {
    await alert.show('homepage', {
      title: '',
      description: null,
      primaryAction: '',
      secondaryAction: undefined,
    })

    expect(alert.element.querySelector('h4').textContent).toBe('')
    expect(alert.element.querySelector('p').textContent).toBe(sections[0].description)
    expect(primary().textContent).toBe('')
    expect(secondary().textContent).toBe(sections[0].secondary_action)
  })

  it('shares a seven-day first dismissal across sections and later visits', async () => {
    await alert.show('homepage')
    secondary().click()
    expect(saved()).toEqual({ dismissals: 1, dismissedUntil: now + 7 * DAY })
    expect(alert.element.hidden).toBe(true)
    expect(events.dismissed).toHaveBeenCalledTimes(1)
    expect(events.dismissed).toHaveBeenCalledWith({ kind: 'homepage' })
    expect(API.pushAlerts.create).toHaveBeenLastCalledWith({ section: 'homepage', kind: 'dismissed' })

    alert.dispose()
    alert = new Alert({ html: alertHTML() }, business, push)
    now += 7 * DAY - 1
    await expect(alert.show('product_collection')).resolves.toBe(false)
    expect(events.shown).toHaveBeenCalledTimes(1)
    now += 1
    await expect(alert.show('product_details')).resolves.toBe(true)
    expect(events.dismissed).toHaveBeenCalledTimes(1)
  })

  it('forces one display during cooldown without resetting dismissal history', async () => {
    await alert.show('homepage')
    secondary().click()
    const firstDismissal = saved()

    await expect(alert.show('product_details', { force: true })).resolves.toBe(true)
    expect(alert.element.hidden).toBe(false)
    expect(saved()).toEqual(firstDismissal)
    await expect(alert.show('product_collection')).resolves.toBe(false)
    expect(events.shown.mock.calls).toEqual([[{ kind: 'homepage' }], [{ kind: 'product_details' }]])

    await alert.show('product_details', { force: true, secondaryAction: 'Maybe later' })
    expect(secondary().textContent).toBe('Maybe later')
    secondary().click()
    expect(alert.element.hidden).toBe(true)
    expect(saved()).toEqual({ dismissals: 2, dismissedUntil: now + 30 * DAY })
    expect(events.shown).toHaveBeenCalledTimes(3)
    expect(events.dismissed.mock.calls).toEqual([[{ kind: 'homepage' }], [{ kind: 'product_details' }]])
  })

  it.each(['missing section', 'existing subscription', 'denied permission'])(
    'does not bypass %s when forced',
    async reason => {
      await alert.show('product_details')
      if (reason === 'missing section') alert.controller.sectionsValue = [sections[0]]
      if (reason === 'existing subscription') push.subscribed = true
      if (reason === 'denied permission') Notification.permission = 'denied'

      await expect(alert.show('product_details', { force: true })).resolves.toBe(false)
      expect(alert.element.hidden).toBe(true)
      expect(saved()).toBeNull()
      expect(push.subscribe).not.toHaveBeenCalled()
      expect(events.shown).toHaveBeenCalledTimes(1)
    },
  )

  it('uses thirty-day cycles for the second and every subsequent dismissal', async () => {
    await alert.show('homepage')
    secondary().click()
    now += 7 * DAY

    for (let count = 2; count <= 4; count += 1) {
      await expect(alert.show('homepage')).resolves.toBe(true)
      secondary().click()
      expect(saved()).toEqual({ dismissals: count, dismissedUntil: now + 30 * DAY })
      now += 30 * DAY - 1
      await expect(alert.show('product_details')).resolves.toBe(false)
      now += 1
    }
  })

  it('does not share cooldowns between businesses', async () => {
    await alert.show('homepage')
    secondary().click()
    alert.dispose()
    alert = new Alert({ html: alertHTML() }, { ...business, id: 'another-business' }, push)
    await expect(alert.show('homepage')).resolves.toBe(true)
  })

  it('counts a dismissal only once when an already-hidden button is clicked', async () => {
    await alert.show('homepage')
    secondary().click()
    secondary().click()
    expect(saved().dismissals).toBe(1)
    expect(events.dismissed).toHaveBeenCalledTimes(1)
    expect(events.dismissed).toHaveBeenCalledWith({ kind: 'homepage' })
  })

  it('does not announce visitor dismissals when hidden or removed programmatically', async () => {
    await alert.show('homepage')
    alert.hide()

    await alert.show('product_collection')
    alert.controller.close()

    await alert.show('product_details')
    alert.dispose()

    expect(events.dismissed).not.toHaveBeenCalled()
    expect(events.accepted).not.toHaveBeenCalled()
    expect(saved()).toBeNull()
    expect(API.pushAlerts.create.mock.calls.map(([data]) => data.kind)).toEqual(['shown', 'shown', 'shown'])
  })

  it('keeps a page-local cooldown when browser storage is blocked', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })

    await alert.show('homepage')
    secondary().click()
    alert.dispose()
    alert = new Alert({ html: alertHTML() }, business, push)
    await expect(alert.show('product_details')).resolves.toBe(false)
    now += 7 * DAY
    await expect(alert.show('homepage')).resolves.toBe(true)
    secondary().click()
    now += 7 * DAY
    await expect(alert.show('homepage')).resolves.toBe(false)
  })

  it.each(['invalid JSON', '{"dismissals":-1,"dismissedUntil":99999999999999}', 'null'])(
    'ignores malformed dismissal history: %s',
    async value => {
      localStorage.setItem(`hellotext:alert:${business.id}`, value)
      await expect(alert.show('homepage')).resolves.toBe(true)
      secondary().click()
      expect(saved().dismissals).toBe(1)
    },
  )

  it('hides a visible section after dismissal in another tab', async () => {
    await alert.show('homepage')
    const key = `hellotext:alert:${business.id}`
    const value = JSON.stringify({ dismissals: 1, dismissedUntil: now + 7 * DAY })
    localStorage.setItem(key, value)
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))
    expect(alert.element.hidden).toBe(true)
    expect(events.dismissed).not.toHaveBeenCalled()
  })

  it('waits for restoration before showing an already-subscribed visitor', async () => {
    let resolveReady
    push.ready = new Promise(resolve => { resolveReady = resolve })
    const showing = alert.show('homepage')
    await Promise.resolve()
    expect(alert.element.hidden).toBe(true)
    push.subscribed = true
    resolveReady()
    await expect(showing).resolves.toBe(false)
  })

  it('suppresses a restored subscription even when its server sync failed', async () => {
    push.subscribed = true
    push.ready = Promise.reject(new Error('Sync failed'))
    await expect(alert.show('homepage')).resolves.toBe(false)
  })

  it('allows retry when initialization failed before a subscription was restored', async () => {
    push.ready = Promise.reject(new Error('Worker unavailable'))
    await expect(alert.show('homepage')).resolves.toBe(true)
  })

  it('does not confuse granted permission with an existing subscription', async () => {
    Notification.permission = 'granted'
    await expect(alert.show('homepage')).resolves.toBe(true)
  })

  it.each(['denied', undefined])('suppresses alerts when permission is %s', async permission => {
    if (permission) Notification.permission = permission
    else global.Notification = undefined
    await expect(alert.show('homepage')).resolves.toBe(false)
    expect(events.shown).not.toHaveBeenCalled()
    expect(API.pushAlerts.create).not.toHaveBeenCalled()
  })

  it('calls subscribe within the click, disables both actions, and prevents duplicate requests', async () => {
    let complete
    push.subscribe.mockImplementation(() => new Promise(resolve => { complete = resolve }))
    await alert.show('homepage', { primaryAction: 'Notify me', secondaryAction: 'Maybe later' })
    expect(primary().textContent).toBe('Notify me')
    expect(secondary().textContent).toBe('Maybe later')
    primary().click()
    expect(push.subscribe).toHaveBeenCalledTimes(1)
    expect(events.accepted).toHaveBeenCalledTimes(1)
    expect(events.accepted).toHaveBeenCalledWith({ kind: 'homepage' })
    expect(API.pushAlerts.create).toHaveBeenLastCalledWith({ section: 'homepage', kind: 'accepted' })
    expect(primary().disabled).toBe(true)
    expect(secondary().disabled).toBe(true)
    expect(alert.element.getAttribute('aria-busy')).toBe('true')
    primary().click()
    secondary().click()
    expect(push.subscribe).toHaveBeenCalledTimes(1)
    expect(events.accepted).toHaveBeenCalledTimes(1)
    expect(events.dismissed).not.toHaveBeenCalled()
    expect(saved()).toBeNull()

    push.subscribed = true
    complete({ succeeded: true })
    await Promise.resolve()
    expect(alert.element.hidden).toBe(true)
    expect(primary().disabled).toBe(false)
    expect(secondary().disabled).toBe(false)
    expect(saved()).toBeNull()
    expect(events.accepted).toHaveBeenCalledTimes(1)
    expect(events.dismissed).not.toHaveBeenCalled()
  })

  it('does not wait for recording before display, dismissal, or requesting permission', async () => {
    API.pushAlerts.create.mockImplementation(() => new Promise(() => {}))

    await expect(alert.show('homepage')).resolves.toBe(true)
    secondary().click()
    expect(alert.element.hidden).toBe(true)

    await alert.show('product_details', { force: true })
    primary().click()
    expect(push.subscribe).toHaveBeenCalledTimes(1)
    expect(API.pushAlerts.create.mock.calls).toEqual([
      [{ section: 'homepage', kind: 'shown' }],
      [{ section: 'homepage', kind: 'dismissed' }],
      [{ section: 'product_details', kind: 'shown' }],
      [{ section: 'product_details', kind: 'accepted' }],
    ])
    await Promise.resolve()
  })

  it.each(['rejection', 'failed response'])('keeps alert actions working after a recording %s', async failure => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    if (failure === 'rejection') API.pushAlerts.create.mockRejectedValue(new Error('Offline'))
    else API.pushAlerts.create.mockResolvedValue({ failed: true })

    await expect(alert.show('homepage')).resolves.toBe(true)
    secondary().click()
    expect(saved().dismissals).toBe(1)

    await alert.show('product_details', { force: true })
    primary().click()
    expect(push.subscribe).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    expect(warn).toHaveBeenCalled()
  })

  it('suppresses after native denial without adding a dismissal', async () => {
    push.subscribe.mockImplementation(async () => {
      Notification.permission = 'denied'
      throw new Error('Permission denied')
    })
    await alert.show('homepage')
    await alert.controller.subscribe()
    expect(alert.element.hidden).toBe(true)
    expect(saved()).toBeNull()
    await expect(alert.show('homepage')).resolves.toBe(false)
    expect(events.accepted).toHaveBeenCalledTimes(1)
    expect(events.accepted).toHaveBeenCalledWith({ kind: 'homepage' })
    expect(events.dismissed).not.toHaveBeenCalled()
  })

  it('keeps actions available after a subscription failure and emits the error', async () => {
    const error = new Error('Subscription failed')
    const onError = jest.fn()
    push.subscribe.mockRejectedValue(error)
    alert.element.addEventListener('hellotext--alert:error', onError)
    await alert.show('homepage')
    await alert.controller.subscribe()
    expect(alert.element.hidden).toBe(false)
    expect(primary().disabled).toBe(false)
    expect(onError.mock.calls[0][0].detail.error).toBe(error)
    expect(saved()).toBeNull()
    expect(events.accepted).toHaveBeenCalledTimes(1)
    expect(events.accepted).toHaveBeenCalledWith({ kind: 'homepage' })
    expect(events.dismissed).not.toHaveBeenCalled()
  })

  it.each(['response', 'rejection'])('hides when subscribed despite a server sync %s', async failure => {
    push.subscribe.mockImplementation(async () => {
      push.subscribed = true
      if (failure === 'rejection') throw new Error('Sync failed')
      return { failed: true }
    })
    await alert.show('homepage')
    await alert.controller.subscribe()
    expect(alert.element.hidden).toBe(true)
    expect(saved()).toBeNull()
  })
})
