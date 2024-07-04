## Forms

Create dynamic forms based on built-in subscriber attributes such as name, email, phone or other custom properties unique to your business. 
Then let Hellotext handle building the form, collecting, validating and authenticating the data users submit. 

For more information on how to create a form from the dashboard, view this [guide](https://help.hellotext.com/forms).

### Collection Phase

After initializing the `Hellotext` class, it attaches a `load` event listener and once the page is loaded, 
it looks for any HTML element that is on the page that has a `data-hello-form` attribute. 

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
Hellotext.on('forms:collected', (forms) => {
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
Hellotext.on('forms:collected', (forms) => {
  forms.getByIndex(0).mount()
})
```

Mounting a form creates the form and it's components that are associated to it, and attaches it to the DOM. 
Hellotext looks for a `form` element with the `data-hello-form` attribute and mounts the form inside it. 
If this condition is not met, Hellotext creates the form manually and appends it to the body of the document.
We recommend to make the criteria met to ensure the form is loaded into an expected place in your page.

### Validation

Hellotext automatically validates the form inputs based on how they were configured on the dashboard 
using browser's native [checkValidity()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/checkValidity). 
Once the user tries to submit the form and there are missing required fields, 
the submission is halted and we display default browser's error message using [HTMLObjectElement.validationMessage](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/validationMessage) property.

### Authentication

Hellotext protects you from bot submissions and protects your customers from identity theft and impersonation. 
When a subscriber fills the form, Hellotext sends a One Time Password (OTP) code to the subscriber. If they have an email,
an email is sent to them, otherwise an SMS is sent to their phone number. 
Until a valid OTP has been entered, data will not show up on the dashboard and will not contribute to attribution marketing.

### Form Completion

Once the user enters the OTP they received. The form is considered to be complete and will be sent to the Hellotext API to create(or update) a profile from the submission information. 
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
  <footer data-form-notice>
  </footer>

  <button data-form-button>
  </button>
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
