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

You can add any custom or additional headers to the request by passing a `headers` object in the parameter.

```javascript
Hellotext.track('page.viewed', {
  headers: {
    'X-Custom-Header': 'value',
  },
  // event related parameters
})
```

### Errors

Failing to provide valid set of parameters will result in an error object being returned, describing the parameters that did not satisfy the rules.

```javascript
const response = await Hellotext.track('app.installed', { object_parameters: { name: null } })

console.log(response.data)
```

yields

```javascript
{
  errors: [
    {
      type: 'parameter_invalid_empty',
      parameter: 'name',
      description: 'This required parameter has an empty value. Provide a valid value for the parameter.',
    },
  ]
}
```

For a complete list of errors types. See [Error Types](https://www.hellotext.com/api#errors)

### Event parameters 

Every tracked event has the following parameters which you can pass to the `track` method:


| Property       | Description                                                                                                                                                                           | Type     | Default |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| **amount**     | Monetary amount that represents the revenue associated to this tracked event.                                                                                                         | float    | `0`     |
| **currency**   | Currency for the `amount` given in ISO 4217 format.                                                                                                                                   | currency | `USD`   |
| **metadata**   | Set of key-value pairs that you can attach to an event. This can be useful for storing additional information about the object in a structured format.                                | hash     | `{}`    |
| **tracked_at** | Original date when the event happened. This is useful if you want to record an event that happened in the past. If no value is provided its value will be the same from `created_at`. | epoch    | `null`  |

### Associated object parameters

Generally, most actions also require an associated object. These can be of type [`app`](https://www.hellotext.com/api#apps), [`coupon`](https://www.hellotext.com/api#coupons), [`form`](https://www.hellotext.com/api#forms), [`order`](https://www.hellotext.com/api#orders), [`product`](https://www.hellotext.com/api#products) and [`refund`](https://www.hellotext.com/api#refunds), these events require an existing object to be present 
in order to be tracked aside from [Custom Actions](https://www.hellotext.com/api#create_an_action), which don't require the trackable to be present.

Associated objects are represented by three possible parameters: 

- `object`: An ID of an existing object of the same type. For example, when tracking app events, the `object` must be a previously created app object.
- `object_parameters`: A set of parameters for creating a new object of the same type. For example, when tracking app events, the `object_parameters` must be a set of parameters for creating a new app object.
- `object_type`: An ID or `name` of an existing custom object. Only required when tracking custom objects. Lets Hellotext know which type of object is being tracked.

You can create the associated object directly by defining its parameters in a hash:

```javascript
Hellotext.track('order.placed', {
  amount: 395.0,
  currency: 'USD',
  object_parameters: {
    reference: '654321',
    source: 'myshop',
    items: [
      {
        product: 'erA2RAXE',
        quantity: 2,
      }
    ]
  },
})
```

If you want to reuse existing objects, you must pass the identifier of an existing associated object. For example, to track a product purchase the identifier of a previously created product object as the `product`.
For more information about identifiers, view the [Tracking API](https://www.hellotext.com/api#tracking)

```javascript
Hellotext.track('product.purchased', {
  amount: 395.0,
  currency: 'USD',
  object: 'erA2RAXE',
})
```

## List of actions

The following is a complete list of built-in actions and their required associated objects. Each associated action accepts a possible set of two parameters 



| Action                | Description                                              | Required Parameter                                                        |
| --------------------- | -------------------------------------------------------- |---------------------------------------------------------------------------|
| **app.installed**     | An app was installed.                                    | `object` or [object_parameters](https://www.hellotext.com/api#app)        |
| **app.removed**       | An app was removed.                                      | `object` or [object_parameters](https://www.hellotext.com/api#app)              |
| **app.spent**         | A customer spent on an app.                              | `object` or [object_parameters](https://www.hellotext.com/api#app)              |
| **cart.abandoned**    | A cart was abandoned.                                    | `object` or [object_parameters](https://www.hellotext.com/api#products) |
| **cart.added**        | Added an item to the cart.                               | `object` or [object_parameters](https://www.hellotext.com/api#products) |
| **cart.removed**      | Removed an item from the cart.                           | `object` or [object_parameters](https://www.hellotext.com/api#products) |
| **coupon.redeemed**   | A coupon was redeem by a customer.                       | `object` or [object_parameters](https://www.hellotext.com/api#coupons)    |
| **form.completed**    | A form was completed by the customer.                    | `object` or [object_parameters](https://www.hellotext.com/api#forms)          |
| **order.placed**      | Order has been placed.                                   | `object` or [object_parameters](https://www.hellotext.com/api#orders)       |
| **order.confirmed**   | Order has been confirmed by you.                         | `object` or [object_parameters](https://www.hellotext.com/api#orders)       |
| **order.cancelled**   | Order has been cancelled either by you or your customer. | `object` or [object_parameters](https://www.hellotext.com/api#orders)       |
| **order.shipped**     | Order has been shipped to your customer.                 | `object` or [object_parameters](https://www.hellotext.com/api#orders)       |
| **order.delivered**   | Order has been delivered to your customer.               | `object` or [object_parameters](https://www.hellotext.com/api#orders)       |
| **page.viewed**       | A page was viewed by a customer.                         | `url`                                                                     |
| **product.purchased** | A product has been purchased.                            | `object` or [object_parameters](https://www.hellotext.com/api#products) |
| **product.viewed**    | A product page has been viewed.                          | `object` or [object_parameters](https://www.hellotext.com/api#products) |
| **refund.requested**  | A customer requested a refund.                           | `object` or [object_parameters](https://www.hellotext.com/api#refunds)    |
| **refund.received**   | A refund was issued by you to your customer.             | `object` or [object_parameters](https://www.hellotext.com/api#refunds)    |

You can also create your **[own defined actions](https://www.hellotext.com/api#actions)**.
