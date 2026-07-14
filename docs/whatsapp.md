# WhatsApp Widget

Hellotext can load a configured WhatsApp widget from the dashboard:

```javascript
Hellotext.initialize('PUBLIC_BUSINESS_ID')
```

Install-level configuration can override dashboard settings. Passing `whatsappWidget: false` disables the automatic WhatsApp widget mount.

```javascript
Hellotext.initialize('PUBLIC_BUSINESS_ID', { whatsappWidget: false })
```

You can also load a specific widget:

```javascript
Hellotext.initialize('PUBLIC_BUSINESS_ID', {
  whatsappWidget: {
    id: 'WHATSAPP_WIDGET_ID',
    number: '+15551234567',
    body: 'Hello, I need help'
  }
})
```

## Options

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| id | The id of the WhatsApp widget to load. Overrides the dashboard widget id when provided. | String | Dashboard id |
| container | The container to append the widget to. | String | `body` |
| placement | The placement of the widget. | Enum | `bottom-right` |
| number | The WhatsApp number used for the `wa.me` link. Overrides the dashboard handoff number. | String | Dashboard |
| body | The prefilled WhatsApp compose text. Overrides the dashboard Message component body. | String | Dashboard |
| appearance | Appearance overrides for the configured widget. | Object | Dashboard |

The widget opens WhatsApp directly through `wa.me`.
