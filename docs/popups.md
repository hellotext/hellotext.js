## Popups

Hellotext allows you to build popups via the dashboard and have Hellotext.js load the configured popup automatically.
When a business has an active popup installed through the dashboard, this is enough:

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID')
```

The popup uses the steps, fields, layout, bubble, and appearance configured in the dashboard. Hellotext.js selects one popup per initialization. If no popup is configured, no popup is loaded.

Passing `popup: false` disables automatic popup mounting for this installation:

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', { popup: false })
```

### Configuration

You can load a specific popup by passing its public id. This replaces the dashboard popup selection for this installation and does not change the dashboard settings.

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  popup: {
    id: 'POPUP_ID',
    container: 'body',
    device: 'auto',
  },
})
```

| Property  | Description                                                                                 | Type   | Default      |
| --------- | ------------------------------------------------------------------------------------------- | ------ | ------------ |
| id        | The public id of the popup to load. Overrides the dashboard popup id when provided.         | String | Dashboard id |
| container | The container to append the popup to. Must be a valid CSS selector for an existing element. | String | `body`       |
| device    | The device layout to request from Hellotext: `auto`, `mobile`, or `desktop`.                | Enum   | `auto`       |

You can omit `id` when overriding options for the dashboard-configured popup:

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  popup: {
    container: '#hellotext-popups',
  },
})
```

### Container

By default, the popup is appended to the end of `body`. To use a custom container, create it before initializing Hellotext:

```html
<div id="hellotext-popups"></div>
```

The `container` option controls where the markup is inserted. Popup placement and layout remain controlled by the dashboard configuration. A missing container or invalid selector prevents the popup from mounting.

### Device

The following `device` values are accepted:

- `auto` - Requests the mobile layout for viewport widths below 768 pixels and the desktop layout otherwise.
- `mobile` - Requests the mobile layout explicitly.
- `desktop` - Requests the desktop layout explicitly.

```js
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  popup: {
    device: 'mobile',
  },
})
```

The requested layout and the dashboard's device targeting are separate settings. The popup still checks the actual viewport against its dashboard target before displaying. For example, requesting the mobile layout does not make a mobile-only popup appear on a desktop viewport.

Device targeting is evaluated when the popup controller connects. Resizing the window does not automatically reload the layout or reevaluate whether the popup should appear.

### Appearance and styles

Configure the popup's layout, colors, typography, content, and bubble in the dashboard. The JavaScript configuration accepts `id`, `container`, and `device`.

Hellotext.js automatically loads the popup stylesheet supplied with the public business configuration. This applies to both package imports and the script-tag bundle; no separate popup CSS import is needed. The `styles/index.css` file documented in the main README provides generic form styles.

### Behaviour

The server renders the bubble and dialog hidden. Once the popup is mounted and its device target matches, Hellotext.js selects the opening state:

- With bubble mode enabled, the launcher appears first. Clicking it opens the dialog and hides the bubble.
- Without bubble mode, the dialog opens immediately.

Closing the popup hides both the dialog and the launcher. Dismissal is remembered for that controller instance and is not persisted across page reloads.

The popup configuration does not provide the Webchat `behaviour` options. This runtime does not implement delayed opening, first-visit rules, or once-per-session display rules.

### Validation and submission

Each step is validated using the browser's native input constraints, including required fields and email format. Invalid fields display their validation messages before the visitor can continue.

Submitting the form before the last step advances to the next step after validation. The final step validates its inputs and submits the collected flow, including email, phone, custom fields, checkbox choices, and capture metadata.

Submission buttons are disabled while the request is pending. Field-specific errors appear beside their inputs, and other failures appear in the form's error message. The visitor can correct values or retry without reentering the whole form.

Retrying an unchanged submission reuses its idempotency key so Hellotext can recognize an earlier attempt whose response was lost. Changing the submitted data creates a new key. Requests are retried when the visitor submits again.

### Completion and verification

The completion screen appears when Hellotext accepts the submission. Verification or message delivery may still be pending at that point.

Completion text can contain `{destination}` and `{channel}` placeholders. The runtime fills these using the delivery destination and channel returned by Hellotext, including any fallback route selected by the backend.

For a queued delivery awaiting verification, the completion screen supports:

- **Resend:** Available after an initial 60-second countdown. Subsequent cooldowns follow the server's retry interval.
- **Change email or phone:** Cancels the previous submission before returning to the relevant field. If cancellation fails, the completion screen remains visible so a replacement submission cannot start while the previous one may still deliver.

When delivery is unnecessary, the completion screen shows saved-details copy and hides delivery actions. The runtime does not poll for verification updates or emit a completion/verification event.

### Mounting

Listen for `popup:mounted` to react when the popup is mounted. Register the listener before initializing Hellotext:

```js
Hellotext.on('popup:mounted', () => {
  console.log('Popup mounted')
})

Hellotext.initialize('PUBLIC_BUSINESS_ID')
```

The event fires when the popup controller connects to its markup, before the initial display state is evaluated. It also fires if the same controller reconnects. No mounting event is emitted when no popup is mounted, including when popup loading is disabled or no popup is selected.

Mounting does not guarantee that the dialog is visible: the popup may be waiting for a bubble click or excluded by device targeting. Use `popup:opened` to react to dialog visibility.

### Events

Use `Hellotext.on(event, callback)` to listen for popup events. Register listeners before initialization to receive mounting and automatic opening events.

- `popup:mounted` - Emitted when the popup is mounted, before any automatic `popup:opened` event. The dialog may remain hidden because of device targeting or bubble mode.
- `popup:opened` - Emitted when the dialog becomes visible, either automatically or after a bubble click. Showing the bubble alone does not emit this event.
- `popup:closed` - Emitted when the visitor dismisses the popup.

These events do not include a payload.

```js
const onPopupOpened = () => {
  console.log('Popup opened')
}

Hellotext.on('popup:opened', onPopupOpened)
Hellotext.on('popup:closed', () => {
  console.log('Popup closed')
})

Hellotext.initialize('PUBLIC_BUSINESS_ID')
```

Remove a listener by passing the same callback:

```js
Hellotext.removeEventListener('popup:opened', onPopupOpened)
```
