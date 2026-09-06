/**
 * @jest-environment jsdom
 */

import API, { Response } from '../../src/api'
import { Configuration } from '../../src/core'
import { Push } from '../../src/models/push'

const deferred = () => {
  let resolve
  const promise = new Promise(fulfill => {
    resolve = fulfill
  })

  return { promise, resolve }
}

describe('Push', () => {
  const applicationServerKey = Uint8Array.from([4, ...Array(64).fill(1)])
  const publicKey = btoa(String.fromCharCode(...applicationServerKey))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const subscriptionData = {
    endpoint: 'https://push.example.com/subscription',
    expirationTime: null,
    keys: { p256dh: 'encryption-key', auth: 'authentication-secret' },
  }
  const browserProperties = [
    [navigator, 'serviceWorker'],
    [window, 'Notification'],
    [window, 'PushManager'],
    [window, 'isSecureContext'],
  ].map(([target, name]) => [target, name, Object.getOwnPropertyDescriptor(target, name)])
  const responseFor = (succeeded, data = { id: 'identity-id' }) =>
    new Response(succeeded, { json: jest.fn().mockResolvedValue(data) })

  let push
  let subscription
  let storedSubscription
  let registration

  beforeEach(() => {
    Configuration.push.assign({})

    storedSubscription = null
    subscription = {
      endpoint: subscriptionData.endpoint,
      options: { applicationServerKey: applicationServerKey.buffer },
      toJSON: jest.fn().mockReturnValue(subscriptionData),
      unsubscribe: jest.fn().mockImplementation(async () => {
        storedSubscription = null
        return true
      }),
    }
    registration = {
      active: {},
      unregister: jest.fn(),
      pushManager: {
        getSubscription: jest.fn().mockImplementation(async () => storedSubscription),
        subscribe: jest.fn().mockImplementation(async () => {
          storedSubscription = subscription
          return subscription
        }),
      },
    }

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve(registration),
        register: jest.fn().mockResolvedValue(registration),
      },
    })
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { permission: 'granted', requestPermission: jest.fn().mockResolvedValue('granted') },
    })
    Object.defineProperty(window, 'PushManager', { configurable: true, value: jest.fn() })
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })

    jest.spyOn(API.pushIdentities, 'create').mockResolvedValue(responseFor(true))
    jest.spyOn(API.pushIdentities, 'destroy').mockResolvedValue(responseFor(true))

    push = new Push({ public_key: publicKey })
  })

  afterEach(() => {
    push.dispose()
    jest.useRealTimers()
    jest.restoreAllMocks()
    Configuration.push.assign({})

    browserProperties.forEach(([target, name, descriptor]) => {
      if (descriptor) {
        Object.defineProperty(target, name, descriptor)
      } else {
        delete target[name]
      }
    })
  })

  it('restores an existing subscription without prompting or creating another one', async () => {
    storedSubscription = subscription

    await push.initialize()

    expect(push.subscribed).toBe(true)
    expect(Notification.requestPermission).not.toHaveBeenCalled()
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled()
    expect(API.pushIdentities.create).toHaveBeenCalledWith({ subscription: subscriptionData })
  })

  it('does not prompt or register an identity when there is no existing subscription', async () => {
    await push.initialize()

    expect(push.subscribed).toBe(false)
    expect(Notification.requestPermission).not.toHaveBeenCalled()
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled()
    expect(API.pushIdentities.create).not.toHaveBeenCalled()
  })

  it('coalesces simultaneous subscribe calls and reuses the subscription on later calls', async () => {
    Notification.permission = 'default'
    const workerReady = deferred()
    navigator.serviceWorker.ready = workerReady.promise

    const first = push.subscribe()
    const second = push.subscribe()

    expect(second).toBe(first)
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1)

    workerReady.resolve(registration)
    await expect(first).resolves.toEqual(expect.objectContaining({ succeeded: true }))

    Notification.permission = 'granted'
    await push.subscribe()

    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1)
    expect(registration.pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey,
    })
    expect(API.pushIdentities.create).toHaveBeenLastCalledWith({ subscription: subscriptionData })
  })

  it('returns the server response without consuming its body', async () => {
    const serverResponse = responseFor(true)
    API.pushIdentities.create.mockResolvedValueOnce(serverResponse)

    const response = await push.subscribe()

    expect(response).toBe(serverResponse)
    expect(response.data.json).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({ id: 'identity-id' })
  })

  it.each(['http', 'network'])('retries a failed %s request using the same browser subscription', async failure => {
    jest.useFakeTimers()
    if (failure === 'http') {
      API.pushIdentities.create.mockResolvedValueOnce(responseFor(false))
    } else {
      API.pushIdentities.create.mockRejectedValueOnce(new Error('Connection failed'))
    }

    if (failure === 'http') {
      await expect(push.subscribe()).resolves.toEqual(expect.objectContaining({ failed: true }))
    } else {
      await expect(push.subscribe()).rejects.toThrow('Connection failed')
    }

    jest.advanceTimersByTime(1000)
    await Promise.resolve()
    await Promise.resolve()

    expect(API.pushIdentities.create).toHaveBeenCalledTimes(2)
    expect(API.pushIdentities.create).toHaveBeenLastCalledWith({ subscription: subscriptionData })
    expect(registration.pushManager.subscribe).toHaveBeenCalledTimes(1)
    expect(push.subscribed).toBe(true)
  })

  it('leaves another application subscription untouched', async () => {
    subscription.options.applicationServerKey = new Uint8Array([9, 8, 7]).buffer
    storedSubscription = subscription

    await push.initialize()
    await expect(push.subscribe()).rejects.toThrow('different application')

    expect(API.pushIdentities.create).not.toHaveBeenCalled()
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled()
    expect(subscription.unsubscribe).not.toHaveBeenCalled()
    expect(registration.unregister).not.toHaveBeenCalled()
  })

  it('disables the server identity before unsubscribing without unregistering the worker', async () => {
    storedSubscription = subscription
    await push.initialize()

    const first = push.unsubscribe()
    const second = push.unsubscribe()

    expect(second).toBe(first)
    await expect(first).resolves.toEqual(expect.objectContaining({ succeeded: true }))

    expect(API.pushIdentities.destroy).toHaveBeenCalledWith({ subscription: subscriptionData })
    expect(API.pushIdentities.destroy.mock.invocationCallOrder[0]).toBeLessThan(
      subscription.unsubscribe.mock.invocationCallOrder[0],
    )
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
    expect(registration.unregister).not.toHaveBeenCalled()
    expect(push.subscribed).toBe(false)
  })

  it('unsubscribes after restoration fails without registering the identity again', async () => {
    jest.useFakeTimers()
    storedSubscription = subscription
    API.pushIdentities.create.mockResolvedValue(responseFor(false))
    await push.initialize()

    await expect(push.unsubscribe()).resolves.toEqual(expect.objectContaining({ succeeded: true }))
    jest.advanceTimersByTime(10000)
    await Promise.resolve()

    expect(API.pushIdentities.create).toHaveBeenCalledTimes(1)
    expect(API.pushIdentities.destroy).toHaveBeenCalledWith({ subscription: subscriptionData })
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
    expect(push.subscribed).toBe(false)
  })

  it('preserves the browser subscription when disabling the server identity fails', async () => {
    storedSubscription = subscription
    await push.initialize()
    API.pushIdentities.destroy.mockResolvedValueOnce(responseFor(false))

    await expect(push.unsubscribe()).resolves.toEqual(expect.objectContaining({ failed: true }))

    expect(subscription.unsubscribe).not.toHaveBeenCalled()
    expect(push.subscribed).toBe(true)
  })

  it('waits for the configured service worker to activate before subscribing', async () => {
    Configuration.push.assign({ serviceWorkerUrl: '/hellotext-worker.js', channelId: 'channel-id' })
    push = new Push({ public_key: publicKey })
    const worker = new EventTarget()
    worker.state = 'installing'
    registration.active = null
    registration.installing = worker

    const subscribing = push.subscribe()
    await Promise.resolve()
    await Promise.resolve()

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/hellotext-worker.js')
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled()

    worker.state = 'activated'
    registration.active = worker
    worker.dispatchEvent(new Event('statechange'))
    await subscribing

    expect(API.pushIdentities.create).toHaveBeenCalledWith({
      subscription: subscriptionData,
      channel_id: 'channel-id',
    })
  })

  it('cancels pending registration retries when disposed', async () => {
    jest.useFakeTimers()
    API.pushIdentities.create.mockResolvedValueOnce(responseFor(false))
    await push.subscribe()

    push.dispose()
    jest.advanceTimersByTime(10000)
    await Promise.resolve()

    expect(API.pushIdentities.create).toHaveBeenCalledTimes(1)
    await expect(push.subscribe()).resolves.toBeUndefined()
    await expect(push.unsubscribe()).resolves.toBeUndefined()
  })

  it('does not restore a subscription after disposal while its lookup was pending', async () => {
    const lookup = deferred()
    const lookupStarted = deferred()
    registration.pushManager.getSubscription.mockImplementation(() => {
      lookupStarted.resolve()
      return lookup.promise
    })

    const initializing = push.initialize()
    await lookupStarted.promise
    push.dispose()
    lookup.resolve(subscription)
    await initializing

    expect(API.pushIdentities.create).not.toHaveBeenCalled()
    expect(push.subscribed).toBe(false)
  })

  it('does not create a browser subscription after disposal while its lookup was pending', async () => {
    const lookup = deferred()
    const lookupStarted = deferred()
    registration.pushManager.getSubscription.mockImplementation(() => {
      lookupStarted.resolve()
      return lookup.promise
    })

    const subscribing = push.subscribe()
    await lookupStarted.promise
    push.dispose()
    lookup.resolve(null)

    await expect(subscribing).resolves.toBeUndefined()
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled()
    expect(API.pushIdentities.create).not.toHaveBeenCalled()
  })

  it('does not unsubscribe after disposal while its lookup was pending', async () => {
    const lookup = deferred()
    const lookupStarted = deferred()
    registration.pushManager.getSubscription.mockImplementation(() => {
      lookupStarted.resolve()
      return lookup.promise
    })

    const unsubscribing = push.unsubscribe()
    await lookupStarted.promise
    push.dispose()
    lookup.resolve(subscription)

    await expect(unsubscribing).resolves.toBeUndefined()
    expect(API.pushIdentities.destroy).not.toHaveBeenCalled()
    expect(subscription.unsubscribe).not.toHaveBeenCalled()
  })
})
