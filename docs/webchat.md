## Webchat

Hellotext allows you to build webchats via the dashboard and have Hellotext.js load the configured webchat automatically.
When a business has a webchat configured through the dashboard, this is enough:

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID')
```

Install-level configuration can override dashboard settings. Passing `webchat: false` disables the automatic webchat mount.

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', { webchat: false })
```

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    id,
    container,
    placement,
    classes,
    triggerClasses,
    style: {
      primaryColor,
      secondaryColor,
      typography,
    },
    mode,
    behaviour,
    strategy,
  },
})
```

| Property       | Description                                                                                                                              | Type   | Default        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- |
| id             | The id of the webchat to load. Overrides the dashboard webchat id when provided.                                                         | String | Dashboard id   |
| container      | The container to append the webchat to, must be a valid CSS selector. If none specified, the webchat is appended at the end of the body. | String | `body`         |
| placement      | The placement of the webchat, determined according to the parent `container`.                                                            | Enum   | `bottom-right` |
| classes        | An array or comma separated String of additional CSS classes to apply to the webchat popover.                                            | String | null           |
| triggerClasses | An array or comma separated String of additional CSS classes to apply to the webchat trigger.                                            | String | null           |
| style          | Style overrides to the WebChat's style configuration as created on the dashboard.                                                        | Object | null           |
| mode           | The mode of the webchat when it is open and a click was made outside of it                                                               | Enum   | `popover`      |
| behaviour      | The runtime opening behaviour of the webchat                                                                                             | Object | Dashboard      |
| strategy       | The positioning strategy for the webchat when it is open and the ancestor is scrolled                                                    | Enum   | `absolute`     |

**Migration note:** `webchat.behaviour: 'modal' | 'popover'` is now `webchat.mode`. The `behaviour` key now accepts the auto-open behaviour object described below.

### Position

The default position for a webchat is `bottom-right`, but you can specify any of the following values

- `bottom-left`
- `bottom-right`
- `top-left`
- `top-right`

### Style

The following properties are accepted for the `style` object.

- `primaryColor` - The primary color of the Webchat. Must be either in hex or rgb/a formats. Affects the following elements:
  - Trigger background
  - Popover header background
  - Agent icon color
  - Toolbar button hover
  - Incoming message background

The primary color is controlled via a `--webchat-primary-color` CSS variable.

- `secondaryColor` - The secondary color of the webchat. Must be either in hex or rgb/a formats. Affects the following elements:
  - Trigger icon color
  - Popover header text color
  - Agent icon background
  - Incoming message text color

The secondary color is controlled via a `--webchat-secondary-color` CSS variable.

- `typography` - The font family to use for the webchat.

All properties accept a valid CSS value, for example, `primaryColor: '#EEEEEE'` or `secondaryColor: '#ff0000'`.

### Mode

Determines how the webchat functions when it is open and a click is made outside of it. The following values are accepted.

- `popover` - Closes the webchat when a click is made outside of it. This is the default behaviour.
- `modal` - Prevents the webchat from closing when a click is made outside of it. The webchat can only be closed by clicking on the trigger.

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    mode: 'popover',
  },
})
```

### Behaviour

Determines what opens the webchat at runtime. The public JavaScript configuration uses camelCase.

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    behaviour: {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: true,
    },
  },
})
```

The following properties are accepted.

| Property       | Description                                                                                         | Type    |
| -------------- | --------------------------------------------------------------------------------------------------- | ------- |
| trigger        | `onClick` keeps the current click-only behaviour. `onLoad` opens the webchat after `delaySeconds`. | Enum    |
| delaySeconds   | Delay before opening on load. Accepted values are `0`, `5`, `10`, and `30`.                         | Number  |
| firstVisitOnly | When true, the automatic open only happens once for the visitor.                                    | Boolean |
| oncePerSession | When true, the automatic open only happens once per browser session.                                | Boolean |

Examples:

```js
// Click-only, no automatic open.
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    behaviour: {
      trigger: 'onClick',
      delaySeconds: 0,
      firstVisitOnly: false,
      oncePerSession: false,
    },
  },
})
```

```js
// Open immediately after mount.
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    behaviour: {
      trigger: 'onLoad',
      delaySeconds: 0,
      firstVisitOnly: false,
      oncePerSession: false,
    },
  },
})
```

```js
// Open after five seconds, once per browser session.
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    behaviour: {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: false,
      oncePerSession: true,
    },
  },
})
```

```js
// Open only on the first visit.
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  webchat: {
    behaviour: {
      trigger: 'onLoad',
      delaySeconds: 5,
      firstVisitOnly: true,
      oncePerSession: false,
    },
  },
})
```

When Hellotext.js writes the behaviour to the Stimulus controller, it serializes the value to the Rails-rendered shape:

```json
{
  "trigger": "on_load",
  "delay_seconds": 5,
  "first_visit_only": true,
  "once_per_session": true
}
```

### Strategy

Determines the positioning strategy for the webchat when the page is scrolled.

- `absolute` - Popover scrolls with its container. Use when webchat is inside a scrollable element.
- `fixed` - Popover stays fixed to viewport. Use when webchat is directly in the body.

**Smart defaults:** If the webchat container is a direct descendant of `body`, the strategy defaults to `fixed` for better scroll performance. Otherwise, it defaults to `absolute`.

### Events

The webchat emits the following events which can be listened to, to add an event listener you can `Hellotext.addEventListener(event, callback)`.

- `webchat:mounted` - Emitted when the webchat is mounted
- `webchat:opened` - Emitted when the webchat is opened
- `webchat:closed` - Emitted when the webchat is closed

- `webchat:message:sent` - Emitted when a message is sent by the user. The message is passed as an argument to the callback, containing the following properties

```javascript
{
  id: 'xxxxxx'
  body: 'The message the client sent',
  attachments: [], // An array of File objects that reference the attachments the user sent.
}
```

The payload may contain additional information about the product card clicked from a carousel message, the following
is an example of a payload of a card click

```javascript
{
  id: 'xxxxxx'
  body: 'The message the client sent',
  attachments: [], // An array of File objects associated with the card
  replied_to: 'xxxx', // The ID of the message that was replied to by the button click.
  product: 'xxxx', // The ID of the product associated with the cart. You can fetch information about the product in https://www.hellotext.com/api#products
  button: 'xxxx' // The ID of the button that was clicked.
}
```

- `webchat:message:received` - Emitted when a message is received by the webchat from Hellotext. The message is passed as an argument to the callback, containing the following properties

```javascript
{
  id: 'xxxxxx',
  body: 'The message the client received from Hellotext',
  attachments: [], // An Array of URLs referencing the attachments the user received.
}
```
