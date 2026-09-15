# Locales

The SDK loads branding, form validation messages, and submission confirmations from
the public business response. Translation dictionaries are not bundled with the SDK.

Set a language during initialization:

```javascript
await Hellotext.initialize('HELLOTEXT_BUSINESS_ID', { locale: 'es' })
```

Otherwise, the SDK detects the language from the HTML `lang` attribute, then a
`<meta name="locale">` tag, then the browser language, defaulting to English.
Regional identifiers such as `es-MX` use the Spanish dictionary. Unsupported
languages use the English dictionary returned by the server. Date formatting and
locale detection remain in the SDK.

## Business response

`GET /v1/public/businesses/:id` returns the business's `locale` identifier and a
`locales` object with both `en` and `es` dictionaries. Business metadata embedded
in form and widget responses includes the same object.

Each dictionary contains these string values:

| Group | Keys |
| --- | --- |
| `white_label` | `powered_by` |
| `errors` | `parameter_not_unique`, `blank` |
| `forms` | `phone`, `email`, `phone_and_email`, `none` |

The server fills missing Spanish keys from English. It also invalidates the
business endpoint's ETag when translations change.

`Business.hydrate()` stores the dictionaries and selects the configured or detected
language. If business hydration fails, `FormCollection.add()` can initialize the
business using the embedded metadata and the same language selection. Existing
translation access remains available through `Hellotext.business.locale`, for example
`Hellotext.business.locale.errors.blank`. `Business.setLocale('es')` switches between
the loaded dictionaries without fetching them again.

Deploy the additive backend response from
[hellotext/hellotext#5897](https://github.com/hellotext/hellotext/pull/5897) before
releasing this SDK. Responses without `locales` have no SDK translations available.

## Browser bundle size

Measured with `yarn build` and the same locked dependencies before and after this
change:

| `dist/hellotext.js` | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Minified | 202,821 bytes | 202,203 bytes | 618 bytes |
| Gzip | 57,844 bytes | 57,550 bytes | 294 bytes |
