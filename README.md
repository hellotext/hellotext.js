# Hellotext.js

Official [Hellotext](https://www.hellotext.com) JavaScript library.

This library allows you the following,

- Track events happening on your site to [Hellotext](https://www.hellotext.com) in real-time.
- Use Hellotext Forms to dynamically collect data from your customers based on your specific business requirements.

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
- `forms:collected` This event is fired when forms are collected. The callback will receive the array of forms collected.
- `form:completed` This event is fired when a form has been completed. A form is completed when the user fills all required inputs and verifies their OTP(One-Time Password). The callback will receive the form object that was completed, alongside the data the user filled in the form.

## Understanding Sessions

The library looks for a session identifier present on the `hellotext_session` query parameter. If the session is not present as a cookie neither it will create a new random session identifier, you can disable this default behaviour via the configuration, see [Configuration Options](#configuration-options) for more information.
The session is automatically sent to Hellotext any time the `Hellotext.track` method is called.

Short links redirections attaches a session identifier to the destination url as `hellotext_session` query parameter. This will identify all the events back to the customer who opened the link.

### Get session

It is possible to obtain the current session by simply calling `Hellotext.session`.

```javascript
await Hellotext.session
// Returns bBJn9vR15yPaYkWmR2QK0jopMeNxrA6l
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

| Property            | Description                                                                                                                                                                                     | Type    | Default |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|---------|
| session             | A valid Hellotext session which was stored previously. When not set, Hellotext attempts to retrieve the stored value from `document.cookie` when available, otherwise it creates a new session. | String  | null    |
| autoGenerateSession | Whether the library should automatically generate a session when no session is found in the query or the cookies                                                                                | Boolean | true    |
| autoMountForms      | Whether the library should automatically mount forms collected or not                                                                                                                           | Boolean | true    |
