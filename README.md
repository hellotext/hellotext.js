# Hellotext.js

Track the events happening on your site to [Hellotext](https://www.hellotext.com) in real-time with this library. 

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
import Hellotext from "@hellotext/hellotext";
```

Initialize the library passing the public `HELLOTEXT_BUSINESS_ID` identifier that represents the business.

You can find it from the business's settings page.

```javascript
Hellotext.initialize("HELLOTEXT_BUSINESS_ID");
```

Failing to initialize the class before calling any other method will throw a `NotInitializedError`.

## Usage

Tracking events is straightforward and perhaps the simplest example is tracking a page view:

```javascript
Hellotext.track("page.viewed");
```

In the example above only the name of the action is required. 
The library takes care of handling the `url` parameter with the current URL automatically and is not required to specify it explicitly.
You can pass another url as the third argument to the `Hellotext.track` method.


Generally, most actions also require an associated object. These can be of type [`app`](https://www.hellotext.com/api#apps), [`coupon`](https://www.hellotext.com/api#coupons), [`form`](https://www.hellotext.com/api#forms), [`order`](https://www.hellotext.com/api#orders), [`product`](https://www.hellotext.com/api#products) and [`refund`](https://www.hellotext.com/api#refunds).

You can create the associated object directly by defining its attributes in a hash:

```javascript
Hellotext.track("order.placed", {
    amount: 395.00, 
    currency: "USD",
    order_attributes: {
        "amount": "395.00",
        "reference": "654321",
    }
});
```

If you want to reuse existing objects, you must pass the identifier of an existing associated object. For example, to track a product purchase the identifier of a previously created product object as the `product`. 
For more information about identifiers, view the [Tracking API](https://www.hellotext.com/api#tracking)

```javascript
Hellotext.track("product.purchased", {
    amount: 395.00, 
    currency: "USD",
    product: "erA2RAXE"
});
```

## List of actions

The following is a complete list of built-in actions and their required associated objects. 

| Action                | Description | Required Parameter |
|-----------------------| --- | --- |
| **app.installed**     | An app was installed. | `app` or [app_attributes](https://www.hellotext.com/api#app)
| **app.removed**       | An app was removed. | `app` or [app_attributes](https://www.hellotext.com/api#app)
| **app.spent**         | A customer spent on an app. | `app` or [app_attributes](https://www.hellotext.com/api#app)
| **cart.added**        | Added an item to the cart. | `product` or [product_attributes](https://www.hellotext.com/api#products)
| **cart.removed**      | Removed an item from the cart. | `product` or [product_attributes](https://www.hellotext.com/api#products)
| **coupon.redeemed**   | A coupon was redeem by a customer. | `coupon` or [coupon_attributes](https://www.hellotext.com/api#coupons)
| **form.completed**    | A form was completed by the customer. | `form` or [form_attributes](https://www.hellotext.com/api#forms)
| **order.placed**      | Order has been placed. | `order` or [order_attributes](https://www.hellotext.com/api#orders)
| **order.confirmed**   | Order has been confirmed by you. | `order` or [order_attributes](https://www.hellotext.com/api#orders)
| **order.cancelled**   | Order has been cancelled either by you or your customer. | `order` or [order_attributes](https://www.hellotext.com/api#orders)
| **order.shipped**     | Order has been shipped to your customer. | `order` or [order_attributes](https://www.hellotext.com/api#orders)
| **page.viewed**       |  A page was viewed by a customer. | `url`
| **product.purchased** | A product has been purchased. | `product` or [product_attributes](https://www.hellotext.com/api#products)
| **product.viewed**    | A product page has been viewed. | `product` or [product_attributes](https://www.hellotext.com/api#products)
| **refund.requested**  | A customer requested a refund. | `refund` or [refund_attributes](https://www.hellotext.com/api#refunds)
| **refund.received**   | A refund was issued by you to your customer. | `refund` or [refund_attributes](https://www.hellotext.com/api#refunds)

You can also create your **[own defined actions](https://www.hellotext.com/api#actions)**.

## Additional Properties

You can include additional attributes to the tracked event, additional properties must be included inside the `metadata` object:

```javascript
Hellotext.track("product.purchased", {
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

The library looks for a session identifier present on the `hellotext_session` parameter. If the session is not present as a cookie neither it will create a new random session identifier. The session is automatically sent to Hellotext any time the `Hellotext.track` method is called. 

Short links redirections attaches a session identifier to the destination url as `hellotext_session` parameter. This will identify all the events back to the customer who opened the link.

### Get session

It is possible to obtain the current session by simply calling `Hellotext.session`. 

```javascript
Hellotext.session
// Returns bBJn9vR15yPaYkWmR2QK0jopMeNxrA6l
```

You may want to store the session on your backend when customers are unidentified so you can later [attach it to a profile](https://www.hellotext.com/api#attach_session) when it becomes known.
