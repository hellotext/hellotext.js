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

Hellotext.js automatically loads the popup stylesheet supplied with the public business configuration. This applies to both package imports and the script-tag bundle; no separate popup CSS import is needed.

### Behaviour

The server renders the bubble and dialog hidden. Once the popup is mounted and its device target matches, Hellotext.js selects the opening state:

- With bubble mode enabled, the launcher appears first. Clicking it opens the dialog and hides the bubble.
- Without bubble mode, the dialog opens immediately.

Closing the popup hides both the dialog and the launcher.

Once the visitor opens the dialog, the [Smart Alert](/docs/push.md#show-a-smart-alert) does not show on that page. It can show on the next page load, unless the visitor allowed notifications in the popup.

Once the visitor closes the popup, with the close button or the Escape key, or Hellotext accepts their submission, the browser remembers that popup and does not load it again, on any page or later visit. Verification is not required. The mark is kept in a `hello_popup_submitted_POPUP_ID` cookie on the store's root domain and in `localStorage`. Each one restores the other, and every visit renews the cookie. The mark covers only that popup, so another popup still shows. A popup opened from a link still opens.

If the same popup is open in another tab, or on a page the browser restores with the back button, it closes when the visitor sends or closes it. A tab that sent it keeps its completion screen. Changing the email or phone from the completion screen cancels the submission and forgets the mark until the visitor sends or closes the popup again.

The mark lives in that browser only. A different browser or device, a private window, or clearing the site's data shows the popup again. Browsers also limit how long script cookies and storage last: Chrome keeps the cookie for up to about 400 days, and Safari may clear both after 7 days without a visit.

The popup configuration does not provide the Webchat `behaviour` options. This runtime does not implement delayed opening, first-visit rules, or once-per-session display rules.

### Opening a popup from a link

A short link can open a specific popup on the page it leads to. The redirect adds the popup's public id to the destination URL as the `hello_popup` query parameter, next to `hello_session`:

```
https://store.com/collections/summer?hello_session=SESSION&hello_popup=POPUP_ID
```

Hellotext.js reads the parameter when it initializes and loads that popup instead of the dashboard popup or a `popup.id` passed in the configuration. The `container` and `device` options still apply. Passing `popup: false` keeps the installation free of popups, links included.

Because the visitor asked for it, a popup opened from a link skips the bubble and opens its dialog immediately, on any device, whatever its device targeting.

The parameter counts only when the visitor follows the link. The popup does not open again when:

- the visitor reloads the page or comes back to it with the browser's back or forward buttons;
- the visitor moves to another page of the store whose links kept the query, such as pagination or filters.

A link opened from inside the store, for example from the webchat, still opens its popup. A value that is not a public popup id is ignored.

### Validation and submission

Each step is validated using the browser's native input constraints, including required fields and email format. Invalid fields display their validation messages before the visitor can continue.

A required Push field keeps its step's button disabled until the visitor checks it, and the popup's reward waits for Push:

- If the browser does not grant permission, the popup is still sent, so the contact is saved without the reward, and the visitor sees the server-rendered `pushRequired` step with how to allow notifications in their browser (`Popup.browser()`: Chrome, Edge, Firefox, Safari, Android, or a generic fallback).
- Its button (`retryPush`) asks for permission again; once granted, the popup is sent again with the subscription and the completion step appears. Sending a popup that still waits for Push does not remember it, so a visitor who leaves the page can get it again on a later visit; closing it is remembered as usual.
- Where Push cannot work (the server marks it unavailable, or the browser cannot use it, such as an iPhone tab without a Home Screen installation), a popup with a required Push field is not shown.

Submitting the form before the last step advances to the next step after validation. The final step validates its inputs and submits the collected flow, including email, phone, custom fields, checkbox choices, and capture metadata.

A phone field shows a country selector. A number typed without a leading `+` is submitted in international form with the selected country's prefix, for example `+54` followed by the digits, instead of assuming the business country. The SDK keeps any leading zero the visitor typed; the server decides per country whether it is part of the number. The field only accepts digits, spaces and `+ ( ) . -`; anything else typed or pasted is dropped.

A birthday is asked as Day / Month / Year selects. The SDK joins them into the ISO date it submits (`1999-03-07`) once all three are chosen, and disables the days the chosen month does not have. A required birthday blocks the step until the date is complete.

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
- `popup:closed` - Emitted when the visitor dismisses the popup, with the close button or the Escape key.

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
