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
  }
})
```

| Property       | Description                                                                                        | Type   | Default        |
|----------------|----------------------------------------------------------------------------------------------------|--------|----------------|
| id             | The id of the webchat to load. **required**                                                        | String | null           |
| container      | The container to append the webchat to, must me an HTML element. Defaults to the `<body>` element. | String | body           |
| placement      | The placement of the webchat, determined according to the parent `container`.                      | Enum   | `bottom-right` |
| classes        | Additional CSS classes to apply to the webchat element                                             | String | null           |
| triggerClasses | Additional CSS classes to apply to the webchat trigger                                             | String | null           |

### Position 

The default position for a webchat is `bottom-right`, but you can specify any of the following values 

- `bottom-left`
- `bottom-right`
- `top-left`
- `top-right`

### Events 

The webchat emits the following events which can be listened to, to add an event listener you can `Hellotext.addEventListener(event, callback)`.

- `webchat:opened` - Emitted when the webchat is opened
- `webchat:closed` - Emitted when the webchat is closed
- `webchat:message:sent` - Emitted when a message is sent by the user.
- `webchat:message:received` - Emitted when a message is received by the webchat from Hellotext.
