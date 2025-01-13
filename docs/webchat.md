## Webchat

Hellotext allows you to build webchats via the dashboard and allow Hellotext.js to load a given webchat with 
a specific ID and show it to the user. A webchat can be specified when initializing the library by passing a `webchat` property
to the configuration option.

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
      typography
    },
    behaviour,
  }
})
```

| Property       | Description                                                                                                                              | Type   | Default        |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------|--------|----------------|
| id             | The id of the webchat to load. **required**                                                                                              | String | null           |
| container      | The container to append the webchat to, must be a valid CSS selector. If none specified, the webchat is appended at the end of the body. | String | `body`         |
| placement      | The placement of the webchat, determined according to the parent `container`.                                                            | Enum   | `bottom-right` |
| classes        | An array or comma separated String of additional CSS classes to apply to the webchat popover.                                            | String | null           |
| triggerClasses | An array or comma separated String of additional CSS classes to apply to the webchat trigger.                                            | String | null           |
| style          | Style overrides to the WebChat's style configuration as created on the dashboard.                                                        | Object | null           |
| behaviour      | The behaviour of the webchat when it is open and a click was made outside of it                                                          | Enum   | `popover`      |

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

The secondary color is controlled via a `--webchat-secondary-color` CSS variable.
- `typography` - The font family to use for the webchat.

All properties accept a valid CSS value, for example, `primaryColor: '#EEEEEE'` or `secondaryColor: '#ff0000'`.

### behaviour

Determines how the webchat functions when it is open and a click is made outside of it. The following values are accepted.

- `popover` - Closes the webchat when a click is made outside of it. This is the default behaviour.
- `modal` - Prevents the webchat from closing when a click is made outside of it. The webchat can only be closed by clicking on the trigger.

### Events 

The webchat emits the following events which can be listened to, to add an event listener you can `Hellotext.addEventListener(event, callback)`.

- `webchat:mounted` - Emitted when the webchat is mounted
- `webchat:opened` - Emitted when the webchat is opened
- `webchat:closed` - Emitted when the webchat is closed

- `webchat:message:sent` - Emitted when a message is sent by the user. The message is passed as an argument to the callback, containing the following properties

```javascript
{
  body: 'The message the client sent',
  attachments: [], // An array of File objects that reference the attachments the user sent.
}
```

- `webchat:message:received` - Emitted when a message is received by the webchat from Hellotext. The message is passed as an argument to the callback, containing the following properties

```javascript
{
  body: 'The message the client received from Hellotext',
  attachments: [], // An Array of URLs referencing the attachments the user received.
}
```
