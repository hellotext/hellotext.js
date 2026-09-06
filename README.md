# Hellotext.js

Official [Hellotext](https://www.hellotext.com) JavaScript library.

This library allows you the following,

- Track events happening on your site to [Hellotext](https://www.hellotext.com) in real-time.
- Use Hellotext Forms to dynamically collect data from your customers based on your specific business requirements.
- Use Hellotext Webchat to interact with your customers in real-time.
- Let visitors subscribe and unsubscribe to browser notifications with [Push notifications](/docs/push.md).

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

Follow these guides to set up tracking, forms, chat widgets, and Push notifications on your website.

- [Understanding Sessions](/docs/sessions.md)
- [Tracking Events](/docs/tracking.md)
- [Forms](/docs/forms.md)
- [Webchat](/docs/webchat.md)
- [WhatsApp widget](/docs/whatsapp.md)
- [Push notifications](/docs/push.md)

## Events

Use `Hellotext.on` to listen for SDK events. The callback receives the event's payload directly.
Register listeners before `Hellotext.initialize` to receive events emitted during initialization.

```javascript
Hellotext.on(eventName, callback)
```

To unsubscribe, pass the same callback to `Hellotext.removeEventListener`:

```javascript
Hellotext.removeEventListener(eventName, callback)
```

### Sessions and attribution

| Event | When it fires | Callback payload |
| --- | --- | --- |
| `session-set` | The session value is set, including when an existing session is restored during initialization. | The current session value, also available as `Hellotext.session`. |
| `utm-set` | UTM parameters are saved. | A JSON string containing the saved UTM parameters and `observed_at`. Use `JSON.parse` to read it as an object. |

See [Understanding Sessions](/docs/sessions.md) and [Tracking Events](/docs/tracking.md).

### Forms

| Event | When it fires | Callback payload |
| --- | --- | --- |
| `forms:collected` | Forms found on the page have finished loading, before automatic mounting. | The `FormCollection` instance, with methods such as `getById`, `getByIndex`, and `forEach`. |
| `form:completed` | A form completes, or a previously completed form is restored from local storage during mounting. | `{ id, state, data, completedAt }`, where `data` contains the submitted values and `completedAt` is a timestamp in milliseconds. |

See [Forms](/docs/forms.md) for collection, mounting, and completion details.

### Smart Alerts

Each alert event receives `{ kind }`, where `kind` identifies the section: `homepage`,
`product_collection`, or `product_details`.

| Event | When it fires | Callback payload |
| --- | --- | --- |
| `alert:shown` | A section is displayed by a successful `show` call, including forced calls. | `{ kind }` |
| `alert:dismissed` | The visitor clicks the secondary action, hiding the alert and starting its dismissal cooldown. | `{ kind }` |
| `alert:accepted` | The visitor clicks the primary action, before the browser permission result or subscription completion. | `{ kind }` |

`alert:accepted` does not confirm that the visitor granted permission or subscribed.
Programmatic hiding, cleanup, and dismissals received from another tab do not emit `alert:dismissed`.

```javascript
Hellotext.on('alert:accepted', ({ kind }) => {
  console.log('Alert accepted in', kind)
})
```

See [Smart Alerts](/docs/push.md#show-a-smart-alert) for display options and dismissal behavior.

### Webchat

| Event | When it fires | Callback payload |
| --- | --- | --- |
| `webchat:mounted` | The Webchat widget is mounted. | None. |
| `webchat:opened` | The Webchat conversation opens. | None. |
| `webchat:closed` | The Webchat conversation closes. | None. |
| `webchat:message:sent` | A visitor's message or quick reply is successfully sent. | The message object, including `id`, `body`, and `attachments`, with additional context for quick replies and product cards. |
| `webchat:message:received` | An incoming message is added to the Webchat conversation. | The message object, with `body` containing its displayed text. |

See [Webchat events](/docs/webchat.md#events) for message payload examples.

### Cart

| Event | When it fires | Callback payload |
| --- | --- | --- |
| `cart.added` | The visitor clicks an add-to-cart button in a Webchat product card. | `{ object_parameters: { items }, source }`. Each item contains `product`, `quantity`, and optional `reference` and `source`; the outer `source` contains `kind`, `message_id`, and `button_id`. |

Handle `cart.added` in your storefront integration to update the cart. This event records the button
click; it does not confirm that your storefront added the item successfully.

## Configuration

When initializing the library, you may pass an optional configuration object as the second argument.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID', configurationOptions)
```

### Configuration Options

| Property            | Description                                                                                                                                                                                     | Type    | Default                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------- |
| session             | A valid Hellotext session which was stored previously. When not set, Hellotext attempts to retrieve the stored value from `document.cookie` when available, otherwise it creates a new session. | String  | null                                      |
| autoGenerateSession | Whether the library should automatically generate a session when no session is found in the query or the cookies                                                                                | Boolean | true                                      |
| forms               | An object that controls how Hellotext should control the forms on the page. See [Forms](/docs/forms.md) documentation for more information.                                                     | Object  | { autoMount: true, successMessage: true } |
| webchat             | An object that overrides the dashboard webchat configuration, or `false` to disable automatic webchat mounting. See [Webchat](/docs/webchat.md).                                                   | Object \| false | Dashboard webchat when configured        |
| whatsappWidget      | An object that overrides the dashboard WhatsApp widget configuration, or `false` to disable automatic WhatsApp widget mounting.                                                                  | Object \| false | Dashboard WhatsApp widget when configured |
| push | Configure browser Push with a notification worker URL and an optional channel ID, or pass `false` to disable it. See the [Push setup guide](/docs/push.md) for the worker file and button examples. | Object \| false | Enabled when available |
