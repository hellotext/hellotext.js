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
    expect(emit).toHaveBeenCalledWith('form:completed', { id: 1 })
  })
})

describe('requiresAuthentication', () => {
  it('is true when the first step has an email input', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'email' }]
        }
      ]
    })

    expect(form.requiresAuthentication).toBe(true)
  })

  it('is true when the first step has a phone input', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'phone' }]
        }
      ]
    })

    expect(form.requiresAuthentication).toBe(true)
  })

  it('is true when the first step has both email and phone inputs', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'email' }, { kind: 'phone' }]
        }
      ]
    })

    expect(form.requiresAuthentication).toBe(true)
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

  it('is null when the first step has neither email nor phone inputs', () => {
    const form = new Form({
      steps: [
        {
          inputs: [{ kind: 'first_name' }]
        }
      ]
    })

    expect(form.localeAuthKey).toBe(null)
  })
})
