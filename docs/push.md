# Set up Push notifications

## 1. Publish your service worker

Serve your notification service worker from your HTTPS website, for example at `/hellotext-sw.js`.

## 2. Initialize Hellotext

Replace `BUSINESS_ID` with your Hellotext business ID and `serviceWorkerUrl` with your worker's path:

```js
await Hellotext.initialize('BUSINESS_ID', {
  push: {
    serviceWorkerUrl: '/hellotext-sw.js',
  },
})
```

If your website already registers this worker, omit `serviceWorkerUrl`.

To select a specific Push channel, also pass `channelId: 'PUSH_CHANNEL_ID'` inside `push`. Otherwise, leave it out.

## 3. Connect your subscribe button

Call this from your subscribe button's click handler:

```js
if (Hellotext.push) {
  const response = await Hellotext.push.subscribe()
  if (response?.succeeded) {
    // Show your subscribed confirmation.
  }
}
```

## 4. Connect your unsubscribe button

Call this from your unsubscribe button's click handler:

```js
if (Hellotext.push) {
  const response = await Hellotext.push.unsubscribe()
  if (!response || response.succeeded) {
    // Show your unsubscribed confirmation.
  }
}
```

Hide or disable both buttons when `Hellotext.push` is unavailable. In each click handler, catch rejected calls and show an error when the call rejects or `response.failed` is true.

To turn off Push on a page, initialize with `push: false`:

```js
await Hellotext.initialize('BUSINESS_ID', { push: false })
```
