# Set up Push notifications

> **Using VTEX or Shopify?** Connecting either integration to Hellotext automatically sets up Push notifications for your store. You can skip the manual service-worker setup and initialization below (steps 1 and 2).

> **Collect subscriptions on any plan.** Your website can initialize Push and collect, refresh, and manage browser subscriptions regardless of your business's plan. You can complete setup and start building your Push audience before upgrading.
>
> **Sending notifications requires Pro or Enterprise.** Delivery is provided through the Hellotext platform, and Hellotext controls whether a business can send based on its current plan and platform usage. Completing the technical setup does not by itself enable delivery.
>
> If your business moves to a plan that does not include sending, subscription collection and management continue while delivery stops. Existing subscriptions are retained, so valid subscriptions are ready to receive notifications when your business upgrades to an eligible plan. Plan restrictions on sending do not disable `Hellotext.push` for subscription management.

Use this guide to add Subscribe and Unsubscribe actions to your website. You will publish a notification service worker, pass its URL when initializing Hellotext, and connect your own buttons to the Push methods.

## 1. Publish your service worker

Create a JavaScript file on the same HTTPS website as your pages. For example, if your website is `https://store.example.com`, publish the file at `https://store.example.com/hellotext-sw.js`.

Copy the following code into that file. It displays Hellotext notifications, opens the notification's destination when clicked, and allows updated versions of the worker to activate while visitors still have your website open.

If you already maintain a service worker for your website, add these handlers to that file and use its URL in the next step.

```js
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('push', event => {
  if (!event.data) return

  let payload

  try {
    payload = event.data.json()
  } catch (error) {
    return
  }

  if (
    !payload ||
    payload.source !== 'hellotext' ||
    typeof payload.title !== 'string' ||
    !payload.title
  ) {
    return
  }

  const options = payload.options || {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      ...options,
      data: { ...options.data, source: 'hellotext' },
    }),
  )
})

self.addEventListener('notificationclick', event => {
  const { data } = event.notification

  if (!data || data.source !== 'hellotext') return

  event.notification.close()

  let url

  try {
    url = new URL(data.actions?.[event.action] || data.url || '/', self.location.origin)
  } catch (error) {
    return
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const client = clients.find(windowClient => windowClient.url === url.href)

      return client ? client.focus() : self.clients.openWindow(url.href)
    }),
  )
})
```

Make sure the URL serves the JavaScript file with a JavaScript content type, such as `text/javascript`. Opening `/hellotext-sw.js` directly should show the script, rather than your website's HTML page or a not-found page.

### Why the installation handler matters

A returning visitor may already have an older version of your service worker installed. Replacing the file on your website does not immediately replace the worker in that visitor's browser. Normally, an updated worker waits until the older worker is no longer controlling any open pages before it takes over.

The `install` handler above calls `self.skipWaiting()` to allow the updated worker to take over without asking the visitor to close their tabs. Keep that handler when you customize the example. It is especially useful when you add notification handling to a worker that visitors already have installed.

When you provide `serviceWorkerUrl`, Hellotext checks for an update and waits for the replacement worker to activate before completing the subscription setup. This also applies when you change the contents of the worker file but keep its URL the same. `skipWaiting()` allows that activation to happen during the current visit; it does not skip downloading or installing the worker.

## 2. Initialize Hellotext with your worker's URL

Initialize Hellotext before connecting your subscription buttons. Replace `BUSINESS_ID` with your Hellotext business ID and `/hellotext-sw.js` with the path of the file you published:

```js
await Hellotext.initialize('BUSINESS_ID', {
  push: {
    serviceWorkerUrl: '/hellotext-sw.js',
  },
})
```

Pass the URL of the worker file itself. You can use a path beginning with `/`, as shown above, or an absolute URL on the same origin as your page.

### If your website already registers the worker

You can omit `serviceWorkerUrl` if your website already registers and activates a service worker containing the notification handlers above for the current page:

```js
await Hellotext.initialize('BUSINESS_ID')
```

In that setup, your existing registration code is responsible for updating and activating the worker. Keep the `install` handler in the worker so an older version can be replaced while the website remains open.

### Optional channel selection

If you need to choose a specific Push channel, pass its ID as `channelId` alongside the worker URL:

```js
await Hellotext.initialize('BUSINESS_ID', {
  push: {
    serviceWorkerUrl: '/hellotext-sw.js',
    channelId: 'PUSH_CHANNEL_ID',
  },
})
```

Leave `channelId` out to use the default channel selection.

| Option                  | What to pass                                                                       | When to omit it                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `push.serviceWorkerUrl` | The URL of your published notification service worker, such as `/hellotext-sw.js`. | Your website already registers and activates the worker for the current page. |
| `push.channelId`        | The ID of the Push channel you want to use.                                        | You do not need to choose a specific channel.                                 |

## 3. Connect your Subscribe button

After initialization, check whether `Hellotext.push` is available before showing or enabling your Push controls. If it is unavailable, hide or disable those controls.

Run the following code from your Subscribe button's click handler. The call may wait for the worker to become ready, so show the subscribed confirmation only after `response.succeeded` is true:

```js
if (Hellotext.push) {
  try {
    const response = await Hellotext.push.subscribe()

    if (response?.succeeded) {
      // Show your subscribed confirmation.
    } else if (response?.failed) {
      // Show an error and let the visitor try again.
    }
  } catch (error) {
    // Show an error and let the visitor try again.
  }
}
```

The same method can be called when the visitor already has a Hellotext subscription; you do not need a separate "subscribe again" implementation.

## 4. Connect your Unsubscribe button

Run the following code from your Unsubscribe button's click handler. Wait for the result before showing confirmation. A `null` result means there was no subscription to remove and can be treated as already unsubscribed:

```js
if (Hellotext.push) {
  try {
    const response = await Hellotext.push.unsubscribe()

    if (response === null || response?.succeeded) {
      // Show your unsubscribed confirmation.
    } else if (response?.failed) {
      // Show an error and let the visitor try again.
    }
  } catch (error) {
    // Show an error and let the visitor try again.
  }
}
```

## Disable Push on a page

If you do not want to enable Push for a particular page, pass `push: false` when initializing Hellotext:

```js
await Hellotext.initialize('BUSINESS_ID', { push: false })
```

In this configuration, `Hellotext.push` is unavailable. Disabling Push in the page configuration does not unsubscribe a visitor who previously subscribed; use `Hellotext.push.unsubscribe()` while Push is enabled if you want to remove that subscription.
