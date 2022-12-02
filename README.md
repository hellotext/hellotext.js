# Hellotext.js

Track the events happening on your site to [Hellotext](https://www.hellotext.com) in real-time with this library. 

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
import Hellotext from "hellotext";
```

Initialize the library passing the public `HELLOTEXT_BUSINESS_ID` identifier that represents the business.

You can find it from the business's settings page.

```javascript
Hellotext.initialize("HELLOTEXT_BUSINESS_ID");
```


## Usage

Tracking events is straightforward and perhaps the simplest example is tracking a page view:

```javascript
Hellotext.track("page.visited");
```

In the example above only the name of the action is required. The library takes care of handling the `url` parameter with the current URL automatically and is not required to specify it explicitly.

Generally, most actions also require an associated object. These can be of type [`app`](https://www.hellotext.com/api#apps), [`coupon`](https://www.hellotext.com/api#coupons), [`form`](https://www.hellotext.com/api#forms), [`order`](https://www.hellotext.com/api#orders), [`product`](https://www.hellotext.com/api#products) and [`refund`](https://www.hellotext.com/api#refunds).

You can create the associated object directly by defining its attributes in a hash:

```javascript
Hellotext.track("order.placed", {
    amount: 395.00, 
    currency: "USD",
    order: {
        "amount": "395.00"
        "reference": "654321",
    }
});
```

If you want to reuse existing objects, you must pass the identifier of an existing associated object. For example, to track an item added to a cart you must pass the identifier of an previously created product object as the `product_id`.

```javascript
Hellotext.track("cart.added", {
    amount: 395.00, 
    currency: "USD",
    product_id: "erA2RAXE"
});
```

## List of actions

The following is a complete list of built-in actions and their required associated objects. 

| Action | Description | Required Parameter |
| --- | --- | --- |
| **app.install** | An app was installed. | `app_id` or [app object](https://www.hellotext.com/api#app)
| **app.remove** | An app was removed. | `app_id` or [app object](https://www.hellotext.com/api#app)
| **app.spent** | A customer spent on an app. | `app_id` or [app object](https://www.hellotext.com/api#app)
| **cart.removed** | Removed an item from the cart. | `product_id` or [product object](https://www.hellotext.com/api#products)
| **coupon.redeemed** | A coupon was redeem by a customer. | `coupon_id` or [coupon object](https://www.hellotext.com/api#coupons)
| **form.completed** | A form was completed by the customer. | `form_id` or [form object](https://www.hellotext.com/api#forms)
| **order.placed** | Order has been placed. | `order_id` or [order object](https://www.hellotext.com/api#orders)
| **order.confirmed** | Order has been confirmed by you. | `order_id` or [order object](https://www.hellotext.com/api#orders)
| **order.cancelled** | Order has been cancelled either by you or your customer. | `order_id` or [order object](https://www.hellotext.com/api#orders)
| **order.shipped** | Order has been shipped to your customer. | `order_id` or [order object](https://www.hellotext.com/api#orders)
| **page.viewed** |  A page was viewed by a customer. | `url`
| **product.purchased** | A product has been purchased. | `product_id` or [product object](https://www.hellotext.com/api#products)
| **product.viewed** | A product page has been viewed. | `product_id` or [product object](https://www.hellotext.com/api#products)
| **refund.requested** | A customer requested a refund. | `refund_id` or [refund object](https://www.hellotext.com/api#refunds)
| **refund.received** | A refund was issued by you to your customer. | `refund_id` or [refund object](https://www.hellotext.com/api#refunds)

You can also create your **[own defined actions](https://www.hellotext.com/api#actions)**.

## Additional Properties

You can include additional attributes to the tracked event:

```javascript
Hellotext.track("page.visited", {
    amount: 0.20, 
    currency: "USD",
    metadata: {
        myProperty: "custom"
    },
    tracked_at: 1665684173
});
```

### List of additional attributes

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| **amount** | Monetary amount that represents the revenue associated to this tracked event. | float | `null`
| **currency** | Currency for the `amount` given in ISO 4217 format.  | currency | `USD`
| **metadata** | Set of key-value pairs that you can attach to an event. This can be useful for storing additional information about the object in a structured format. | hash | `{}`
| **tracked_at** | Original date when the event happened. This is useful if you want to record an event that happened in the past. If no value is provided its value will be the same from `created_at`. | epoch | `null`


## Understanding Sessions

The library looks for a session identifier present on the `hellotext_session_id` parameter. If the session is not present as a cookie neither it will create a new random session identifier. The session is automatically sent to Hellotext any time the `Hellotext.track` method is called. 

Short links redirections attaches a session identifier to the destination url as `hellotext_session_id` parameter. This will identify all the events back to the customer who opened the link.

### Get session

It is possible to obtain the current session by simply calling `Hellotext.session`. 

```javascript
Hellotext.session
// Returns c7a42761-f34d-41a2-b078-6a8172690350
```

You may want to store the session on your backend when customers are unidentified so you can later [attach it to a profile](https://www.hellotext.com/api#attach_session) when it becomes known.