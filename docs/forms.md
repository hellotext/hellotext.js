## Forms

Create dynamic forms based on built-in subscriber attributes such as name, email, phone or other custom properties unique to your business.
Then let Hellotext handle building the form, collecting, validating and authenticating the data users submit.

For more information on how to create a form from the dashboard, view this [guide](https://help.hellotext.com/forms).

### Configuration 

Hellotext forms have a default configuration that can be overridden by passing an object when initializing the library. It has the following attributes by default:

- `autoMount`: Automatically mount forms to the DOM when a `form` element with the `data-hello-form` attribute is found. Default is `true`.
- `successMessage`: Display a contextual success message when a form is submitted successfully. Default is `true`.
You can turn this off by setting it to `false`, or provide your custom success message by setting it to a string.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID', {
  forms: {
    autoMount: true,
    successMessage: 'Thank you for submitting the form'
  }
})
```

### Collection Phase

Hellotext uses the `MutationObserver` API to listen for changes in the DOM, specifically new form elements being added that have the `data-hello-form` attribute.

You can access the forms object to also trigger the form collection phase manually.
This is useful if you have a Single Page Application(SPA) and cannot hardcode the `data-hello-form` element on the rendered page.

To manually collect forms, do the following.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID')
Hellotext.forms.collect()
```

Once loaded, you can access the `FormCollection` object by calling `Hellotext.forms`.

Make sure you have initialized with `Hellotext.initialize` otherwise an error is reported.

Form collection finishes once Hellotext has fetched the data for the form elements present on the page from the Hellotext API.
Afterwards, it dispatches a `forms:collected` event that you can subscribe to.

```javascript
Hellotext.on('forms:collected', forms => {
  console.log(forms) // Instance of FormCollection
})
```

The `FormCollection` class is a wrapper around the forms, which providers other useful methods.

- `getById(id: string): Form` - Get a form by it's id
- `getByIndex(index: number): Form` - Get a form by it's index
- `includes(id: string): boolean` - Check if a form is included in the collection
- `excludes(id: string): boolean` - Check if a form is not included in the collection
- `length` - Get the number of forms in the collection
- `forEach`, `map` are also supported.

### Mounting forms

Hellotext.js by default automatically mounts forms collected to the DOM. You can disable this behaviour by passing the `autoMountForms` option as `false` when initializing the library.

```javascript
Hellotext.initialize('HELLOTEXT_BUSINESS_ID', { autoMountForms: false })
```

If form mounting is disabled, Hellotext does not automatically mount form elements,
you will have total control on when and where to mount the form elements. To mount a form object, you call the `mount` method on the form object.

```javascript
Hellotext.on('forms:collected', forms => {
  forms.getByIndex(0).mount()
})
```

Mounting a form creates the form and it's components that are associated to it, and attaches it to the DOM.
Hellotext looks for a `form` element with the `data-hello-form` attribute and mounts the form inside it.
If this condition is not met, Hellotext creates the form manually and appends it to the body of the document.
We recommend to make the criteria met to ensure the form is loaded into an expected place in your page.

Hellotext provides seamless integration with your website, once forms are completed, they are stored in the `localStorage`,
this ensures that the form is not displayed again to the user if they have already completed it. Of course, sometimes it may be desired to 
show the form to a user regardless if they have completed the form or not, in these cases, you can adjust the way you call `Form.mount()`,

```javascript
Hellotext.on('forms:collected', forms => {
  forms.getByIndex(0).mount({ ifCompleted: false })
})
```

This will mount the form regardless if the user has completed the form or not.

### Validation

Hellotext automatically validates the form inputs based on how they were configured on the dashboard
using browser's native [checkValidity()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/checkValidity).

Once the user tries to submit the form and there are missing required fields,
the submission is halted and we display default browser's error message using [HTMLObjectElement.validationMessage](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage) property.

If the form contains a unique property and the client enters a value that is already taken,
the submission will not be complete. Instead, an error will be reported to the client and the form will not be submitted.

Uniqueness errors use the browser's native [setCustomValidity()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity)
method which are reported as normal form validation errors, they can be styled with the `input:invalid` selector.

### Understanding Verification

Hellotext protects you from bot submissions and protects your customers from identity theft and impersonation.

When a subscriber fills the form with an email and/or phone number, Hellotext sends a verification link to the value the submission had at the time of creation. 
When the customer clicks the link in their email and/or the SMS they receive, the attribute is verified. 
Once the email/phone number were verified, the data is considered to be _verified_.

Once verification of a submission is complete, Hellotext performs an automatic merge (if needed) of all profiles 
that have the same email and/or phone number. After automatic merging, if a property has multiple values, 
it will be visible in the Audience page and the user can see the values that were merged and they can decide which one 
to ignore and which one to accept.

### Form Completion

Once the form is considered to be complete, it will be sent to the Hellotext API to create(or update) a profile from the submission information.
The library also dispatches a `form:completed` event that you can subscribe to. In addition, a Session object is set and stored on the browser's cookies.
Additionally, the `Hellotext.session` is also set if no session was present already, you can listen for the session events by subscribing to `session-set` event.

```javascript
Hellotext.on('form:completed', (form) => {
  console.log(form) // An object from FormData
})

{
  id: "xxxxx", // Id of the form that has been completed
  first_name: "Billy",
  last_name: "Butcher",
  email: "theboys@hellotext.com",
  phone: "+1234567890",
  property_by_id[xxxxx]: "value"
}
```

The data in the from will differ based on the inputs you have configured on the dashboard.

### Understanding form's layout

Hellotext assumes a fixed layout for forms, which are in order of Header, Inputs, Button and Notice.

But you can override this layout if you want. Overriding a form's layout can be achieved
by moving the placement of the form's components. For example, if you want to display the Button component after the Footer, here's how you can do that

```html
<form data-hello-form=":id">
  <footer data-form-notice></footer>

  <button data-form-button></button>
</form>
```

Hellotext would simply load the contents inside the respective elements without creating the default layout.
If these elements were not defined, Hellotext would render the button then the notice component.

### Customizing the Form's styles

Generated form elements have minimum styles to make them display correctly. No colors, borders or padding are applied.
You can style the form elements to match your brand guidelines. Hellotext.js ships with a few lines of CSS to apply layout on the components.
See `styles/index.css` for the default styles applied to the form elements.

### White Labels

As a subscriber to Hellotext, if your package does not support white labels, a `powered by Hellotext` logo is displayed at the bottom-right of the form.
You are free to move the position of this element if you want, but it should be visible to your subscribers.
