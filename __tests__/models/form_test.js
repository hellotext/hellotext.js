/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { Form } from '../../src/models'

describe('id', () => {
  it('is the form id', () => {
    const form = new Form({ id: 1 })
    expect(form.id).toEqual(1)
  })
})

describe('mount', () => {
  const data = {
    id: 1,
    steps: [
      {
        header: { content: 'Header' },
        inputs: [],
        button: { content: 'Button' },
        footer: { content: 'Footer' },
      },
    ]
  }

  const form = new Form(data)

  beforeEach(() => {
    Hellotext.business = {
      locale: {
        white_label: {
          powered_by: 'Powered by Hellotext',
        }
      },
      features: {
        white_label: false,
      }
    }

    document.body.innerHTML = ''
  })

  it('mounts the form', () => {
    form.mount()
    expect(document.body.querySelector('form')).not.toBeNull()
  })

  it('sanitizes rich text in the header and footer', () => {
    const richTextForm = new Form({
      id: 2,
      steps: [
        {
          header: {
            content:
              '<p><strong>Header</strong><img src="invalid" onerror="alert(1)"><script>alert(1)</script></p>',
          },
          inputs: [],
          button: { content: 'Button' },
          footer: {
            content: '<p><em>Footer</em><a href="javascript:alert(1)">Unsafe link</a></p>',
          },
        },
      ],
    })

    richTextForm.mount()

    const header = document.querySelector('[data-form-header]')
    const footer = document.querySelector('[data-form-footer]')

    expect(header.querySelector('strong').textContent).toBe('Header')
    expect(header.querySelector('img').hasAttribute('onerror')).toBe(false)
    expect(header.querySelector('script')).toBeNull()
    expect(footer.querySelector('em').textContent).toBe('Footer')
    expect(footer.querySelector('a').hasAttribute('href')).toBe(false)
  })

  describe('when form has been completed', () => {
    beforeEach(() => {
      localStorage.setItem('hello-form-1', 'true')
    })

    it('does not mount the form automatically', () => {
      form.mount()
      expect(document.body.querySelector('form')).toBeNull()
    })

    it('mounts the form when ifCompleted is false', () => {
      form.mount({ ifCompleted: false })
      expect(document.body.querySelector('form')).not.toBeNull()
    })
  })
})

describe('markAsCompleted', () => {
  it('saves the form as completed in localStorage', () => {
    const form = new Form({ id: 1 })
    form.markAsCompleted()
    expect(localStorage.getItem('hello-form-1')).not.toBeNull()
  })

  it('emits a form:completed event', () => {
    const form = new Form({ id: 1 })
    const emit = jest.spyOn(Hellotext.eventEmitter, 'dispatch')

    form.markAsCompleted()
    expect(emit).toHaveBeenCalled()
  })
})

describe('localeAuthKey', () => {
  it('is email when the first step has an email input', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'email' }]
        }
      ]
    })

    expect(form.localeAuthKey).toBe('email')
  })

  it('is phone when the first step has a phone input', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'phone' }]
        }
      ]
    })

    expect(form.localeAuthKey).toBe('phone')
  })

  it('is phone_and_email when the first step has both email and phone inputs', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'email' }, { kind: 'phone' }]
        }
      ]
    })

    expect(form.localeAuthKey).toBe('phone_and_email')
  })

  it('is none when the first step has neither email nor phone inputs', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'first_name' }]
        }
      ]
    })

    expect(form.localeAuthKey).toBe('none')
  })
})
