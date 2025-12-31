# Hellotext.js

Official [Hellotext](https://www.hellotext.com) JavaScript library.

This library allows you the following,

- Track events happening on your site to [Hellotext](https://www.hellotext.com) in real-time.
- Use Hellotext Forms to dynamically collect data from your customers based on your specific business requirements.
- Use Hellotext Webchat to interact with your customers in real-time.

## Installation

### Using NPM

```bash
npm i @hellotext/hellotext
```

### Using yarn

```bash
yarn add @hellotext/hellotext
```

### Configure

Import the library into your app.

```javascript
import Hellotext from '@hellotext/hellotext'
```

If you're running in a non-browser environment, such as Node.js, you can import the vanilla implementation which only includes
Hellotext.js class without initializing other libraries that rely on the browser environment.

```javascript
import Hellotext from '@hellotext/hellotext/vanilla'
```

Initialize the library passing the public `HELLOTEXT_BUSINESS_ID` identifier that represents the business.

You can find it from the business's settings page.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID')
```

Failing to initialize the class before calling any other method will throw a `NotInitializedError`.

## Documentation

Learn how to leverage the library to track events and collect forms.

- [Tracking Events](/docs/tracking.md)
- [Forms](/docs/forms.md)
- [Webchat](/docs/webchat.md)

## CSS

The library ships with a minimal CSS file that is used for [Forms](/docs/forms.md). It is pre-bundled but you control when to import it.

## For Bundler Users (Vite, Webpack, etc.)

The CSS is not automatically imported to avoid issues with SSR frameworks. Import it separately:

```javascript
// Import the library
import Hellotext from '@hellotext/hellotext'

// Import the CSS separately
import '@hellotext/hellotext/styles/index.css'
```

## For Script Tag Users

The UMD bundle (`dist/hellotext.js`) includes the CSS automatically:

```html
<script src="https://unpkg.com/@hellotext/hellotext"></script>
<!-- CSS is included in the bundle -->
```

## Events

This library emits events that you can listen to and perform specific action when the event happens.
Think of it like `addEventListener` for HTML elements. You can listen for events, and remove events as well.

To listen to an event, you can call the `on` method, like so

```javascript
Hellotext.on(eventName, callback)
```

To remove an event listener, you can call `removeEventListener`

```javascript
Hellotext.removeEventListener(eventName, callback)
```

### List of events

- `session-set`: This event is fired when the session value for `Hellotext.session` is set. Either through an API request, or if the session was found in the cookie.
- `utm-set`: this event is fired when the UTM value is collected, useful to store the UTM on your side.
- `forms:collected` This event is fired when forms are collected. The callback will receive the array of forms collected.
- `form:completed` This event is fired when a form has been completed. A form is completed when the user fills all required inputs and verifies their OTP(One-Time Password). The callback will receive the form object that was completed, alongside the data the user filled in the form.
- View Webchat events [here](/docs/webchat.md#events)

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

### Configuration

When initializing the library, you may pass an optional configuration object as the second argument.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID', configurationOptions)
```

#### Configuration Options

| Property            | Description                                                                                                                                                                                     | Type    | Default                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------- |
| session             | A valid Hellotext session which was stored previously. When not set, Hellotext attempts to retrieve the stored value from `document.cookie` when available, otherwise it creates a new session. | String  | null                                      |
| autoGenerateSession | Whether the library should automatically generate a session when no session is found in the query or the cookies                                                                                | Boolean | true                                      |
| forms               | An object that controls how Hellotext should control the forms on the page. See [Forms](/docs/forms.md) documentation for more information.                                                     | Object  | { autoMount: true, successMessage: true } |
| webchat             | An object that controls how Hellotext should control the webchat on the page. See [Webchat](/docs/webchat.md) documentation for more information.                                               | Object  | {}                                        |
