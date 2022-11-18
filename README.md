# Hellotext.js

Track events happening on your site in real-time with this library. 

## Installation 

### Using NPM

```bash
npm install hellotext
```

### Using yarn

```bash
yarn add hellotext
```

### Configure

Import the library into your app.

```javascript
import Hellotext from "hellotext"
```

Initialize the library passing the public `HELLOTEXT_BUSINESS_ID` identifier that represents the business.

You can find it from the Business's settings page.

```javascript
Hellotext.initialize("HELLOTEXT_BUSINESS_ID");
```


## Usage

Tracking the events of visitors coming from campaign *shortlinks* is very easy, typically simply passing the action name is enough.

```javascript
Hellotext.track("product.purchased")
```

It is possible to pass additional data to track.

```javascript
Hellotext.track("product.purchased", {
    title: "Awesome page",
    amount: 29.99,
    currency: "USD",
    metadata: {
        custom_property: "custom value"
    }
})
```

Learn more about the **[list of actions](https://help.hellotext.com/tracking-events)**.



## Understanding sessions

*Shortlinks* clicked on messages attaches a parameter `hellotext_session_id` to the destination url including a session identifier created by Hellotext.

Hellotext.js automatically sets a cookie with the session when the parameter is present and the session is automatically sent to Hellotext any time the `Hellotext.track` method is called. 

### Get session

It is possible to obtain the current session by simply calling `Hellotext.session`.

```javascript
Hellotext.session
// Returns c7a42761-f34d-41a2-b078-6a8172690350
```

