## Understanding Sessions

The library looks for a session identifier present on the `hello_session` query parameter. If the session is not present as a cookie neither it will create a new random session identifier, you can disable this default behaviour via the configuration, see [Configuration Options](#configuration-options) for more information.
The session is automatically sent to Hellotext any time the `Hellotext.track` method is called.

Short links redirections attaches a session identifier to the destination url as `hello_session` query parameter. This will identify all the events back to the customer who opened the link.

## Identity Management

By default, Hellotext tracks visitors as anonymous sessions. To link these sessions to known customers, you can use either a Server-to-Server (S2S) approach or the client-side `identify` method.

### Identifying a User

Whenever possible, we recommend using the [S2S approach](https://www.hellotext.com/api#attach_session) to attach a session to a profile when a customer becomes known (e.g., during a backend authentication process). This is the most secure method as it happens entirely on your private infrastructure.

**When it's not possible to use S2S**, you can use the JS `identify` method to link the session directly from the browser. This is particularly useful for platforms where you only have access to the user ID on the frontend.

```javascript
// externalId is your platform's User ID (e.g. from Shopify, Fenicio, etc.)
Hellotext.identify('user_123', {
  source: 'shopify',
  email: 'john@example.com',
  name: 'John Doe',
})
```

Once identified, the SDK persists the identity in a cookie. **You do not need to call identify on every page load.** All subsequent calls to `Hellotext.track` will automatically include the user's identity in the payload.

### Forgetting a User

When a user logs out of your application, call `forget` to clear the persistent identity. This prevents a subsequent user on the same device from being misidentified.

```javascript
Hellotext.forget()
```

This method clears the `user_id` and `source` cookies but keeps the `hello_session` active, allowing the user to continue browsing as an anonymous visitor.

### Get session

It is possible to obtain the current session by simply calling `Hellotext.session`. When the session is present in the cookies,
the value stored in the cookies is returned. Otherwise, a new session is generated via [crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID).
The session is kept in the client and not sent to Hellotext's servers until an event is tracked.

An event is tracked in the following cases

- Explicitly calling `Hellotext.track` method.
- When a form is submitted and the form data is sent to Hellotext.

```javascript
Hellotext.session
// Returns da834c54-97fa-44ef-bafd-2bd4fec60636
```

If the session has not been set yet, the result returned will be `undefined`.
You can check whether the session has been set or not by calling `Hellotext.isInitialized`.

```javascript
if (Hellotext.isInitialized) {
  console.log('session is present')
} else {
  console.log('session has not been set')
}
```

Moreover, you can hook in and listen for the session being set, such that when it's set, you're notified about the change, like so

```javascript
Hellotext.on('session-set', session => {
  console.log('session is: ', session)
})
```

You may want to store the session on your backend when customers are unidentified so you can later [attach it to a profile](https://www.hellotext.com/api#attach_session) when it becomes known.
