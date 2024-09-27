## Tracking Events

Track subscriber events as they happen on your website and let Hellotext report them back to your business.

Tracking events is straightforward and perhaps the simplest example is tracking a page view:

```javascript
Hellotext.track('page.viewed')
```

In the example above only the name of the action is required.

### Handling Responses

The `track` method returns a Promise that can be `await`ed using the async/await syntax. Or using `.then` on the returned Promise.

```javascript
const response = await Hellotext.track('page.viewed')
```

The return of the `Hellotext.track` method is an instance of a `Response` object that ships with the package. You can check the status of the response via methods, like:

```javascript
if (response.failed) {
  console.log('failed because', response.data)
}

if (response.succeeded) {
  console.log('success')
  console.log(response.data) // { status: "received" }
}
```

### Parameters

The parameters passed to the action must be a valid set of parameters as described in
[Tracking Actions](https://www.hellotext.com/api#tracking).

#### URL Parameter

The library takes care of handling the `url` parameter with the current URL automatically and is not required to specify it explicitly.
If you want to provide another url, you can pass a `url` key in the params object when tracking an event.

```javascript
Hellotext.track('page.viewed', {
  url: 'www.example.org',
})
```

### Headers 

You can add any custom or additional headers to the request by passing an object as the third argument to the `track` method.
Any duplicate headers will be overwritten by Hellotext's default headers.

```javascript
Hellotext.track('page.viewed', {}, { 'X-Custom-Header': 'value' })
```

### Errors

Failing to provide valid set of parameters will result in an error object being returned, describing the parameters that did not satisfy the rules.

```javascript
const response = await Hellotext.track('app.installed', { app_parameters: { name: 'My App' } })

console.log(response.data)
```

yields

```javascript
{
  errors: [
    {
      type: 'parameter_not_unique',
      parameter: 'name',
      description:
        'The value must be unique and it is already present in another object of the same type.',
    },
  ]
}
```

For a complete list of errors types. See [Error Types](https://www.hellotext.com/api#errors)

### Associated objects

Generally, most actions also require an associated object. These can be of type [`app`](https://www.hellotext.com/api#apps), [`coupon`](https://www.hellotext.com/api#coupons), [`form`](https://www.hellotext.com/api#forms), [`order`](https://www.hellotext.com/api#orders), [`product`](https://www.hellotext.com/api#products) and [`refund`](https://www.hellotext.com/api#refunds).
Aside from [Custom Actions](https://www.hellotext.com/api#create_an_action), which don't require the trackable to be present.

You can create the associated object directly by defining its parameters in a hash:

```javascript
Hellotext.track('order.placed', {
  amount: 395.0,
  currency: 'USD',
  order_parameters: {
    amount: '395.00',
    reference: '654321',
  },
})
```

If you want to reuse existing objects, you must pass the identifier of an existing associated object. For example, to track a product purchase the identifier of a previously created product object as the `product`.
For more information about identifiers, view the [Tracking API](https://www.hellotext.com/api#tracking)

```javascript
Hellotext.track('product.purchased', {
  amount: 395.0,
  currency: 'USD',
  product: 'erA2RAXE',
})
```

## List of actions

The following is a complete list of built-in actions and their required associated objects.

| Action                | Description                                              | Required Parameter                                                        |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| **app.installed**     | An app was installed.                                    | `app` or [app_parameters](https://www.hellotext.com/api#app)              |
| **app.removed**       | An app was removed.                                      | `app` or [app_parameters](https://www.hellotext.com/api#app)              |
| **app.spent**         | A customer spent on an app.                              | `app` or [app_parameters](https://www.hellotext.com/api#app)              |
| **cart.abandoned**    | A cart was abandoned.                                    | `product` or [product_parameters](https://www.hellotext.com/api#products) |
| **cart.added**        | Added an item to the cart.                               | `product` or [product_parameters](https://www.hellotext.com/api#products) |
| **cart.removed**      | Removed an item from the cart.                           | `product` or [product_parameters](https://www.hellotext.com/api#products) |
| **coupon.redeemed**   | A coupon was redeem by a customer.                       | `coupon` or [coupon_parameters](https://www.hellotext.com/api#coupons)    |
| **form.completed**    | A form was completed by the customer.                    | `form` or [form_parameters](https://www.hellotext.com/api#forms)          |
| **order.placed**      | Order has been placed.                                   | `order` or [order_parameters](https://www.hellotext.com/api#orders)       |
| **order.confirmed**   | Order has been confirmed by you.                         | `order` or [order_parameters](https://www.hellotext.com/api#orders)       |
| **order.cancelled**   | Order has been cancelled either by you or your customer. | `order` or [order_parameters](https://www.hellotext.com/api#orders)       |
| **order.shipped**     | Order has been shipped to your customer.                 | `order` or [order_parameters](https://www.hellotext.com/api#orders)       |
| **order.delivered**   | Order has been delivered to your customer.               | `order` or [order_parameters](https://www.hellotext.com/api#orders)       |
| **page.viewed**       | A page was viewed by a customer.                         | `url`                                                                     |
| **product.purchased** | A product has been purchased.                            | `product` or [product_parameters](https://www.hellotext.com/api#products) |
| **product.viewed**    | A product page has been viewed.                          | `product` or [product_parameters](https://www.hellotext.com/api#products) |
| **refund.requested**  | A customer requested a refund.                           | `refund` or [refund_parameters](https://www.hellotext.com/api#refunds)    |
| **refund.received**   | A refund was issued by you to your customer.             | `refund` or [refund_parameters](https://www.hellotext.com/api#refunds)    |

You can also create your **[own defined actions](https://www.hellotext.com/api#actions)**.

## Additional Properties

You can include additional attributes to the tracked event, additional properties must be included inside the `metadata` object:

```javascript
Hellotext.track('product.purchased', {
  amount: 0.2,
  currency: 'USD',
  metadata: {
    myProperty: 'custom',
  },
  tracked_at: 1665684173,
})
```

### List of additional attributes

| Property       | Description                                                                                                                                                                           | Type     | Default |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| **amount**     | Monetary amount that represents the revenue associated to this tracked event.                                                                                                         | float    | `0`     |
| **currency**   | Currency for the `amount` given in ISO 4217 format.                                                                                                                                   | currency | `USD`   |
| **metadata**   | Set of key-value pairs that you can attach to an event. This can be useful for storing additional information about the object in a structured format.                                | hash     | `{}`    |
| **tracked_at** | Original date when the event happened. This is useful if you want to record an event that happened in the past. If no value is provided its value will be the same from `created_at`. | epoch    | `null`  |
