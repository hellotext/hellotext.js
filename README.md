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

- [Understanding Sessions](/docs/sessions.md)
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
