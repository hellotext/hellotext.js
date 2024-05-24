/**
 * @jest-environment jsdom
 */

import { Business } from '../src/models'
import { Forms } from '../src/forms'
import Hellotext from '../src/hellotext'

beforeEach(() => {
  Business.prototype.fetchPublicData = jest.fn().mockResolvedValue({ whitelist: 'disabled' })

  Hellotext.initialize('M01az53K', {
    autogenerateSession: false
  })
})

describe('collect', () => {
  it('does not fetch forms when there are no forms to fetch', async () => {
    const fetch = jest.fn()
    global.fetch = fetch

    await Hellotext.forms.collect()

    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches forms when there are forms to fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue({ id: 1 }) })

    document.body.innerHTML = `
      <form data-hello-form="1"></form>
    `

    await Hellotext.forms.collect()

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('add', () => {
  const forms = new Forms()
  const form = { id: 1, name: 'Form 1' }

  it('adds a form to the forms array', () => {
    forms.add(form)
    expect(forms.length).toEqual(1)
  })

  it('does not add a form that is already in the forms array', () => {
    forms.add(form)
    forms.add(form)

    expect(forms.length).toEqual(1)
  })
})

describe('includes', () => {
  const forms = new Forms()
  const form = { id: 1, name: 'Form 1' }

  it('is true when the form is in the forms array', () => {
    forms.add(form)
    expect(forms.includes(1)).toEqual(true)
  })

  it('is false when the form is not in the forms array', () => {
    expect(forms.includes(2)).toEqual(false)
  })
})

describe('excludes', () => {
  const forms = new Forms()
  const form = { id: 1, name: 'Form 1' }

  it('is true when the form is not in the forms array', () => {
    expect(forms.excludes(2)).toEqual(true)
  })

  it('is false when the form is in the forms array', () => {
    forms.add(form)
    expect(forms.excludes(1)).toEqual(false)
  })
})
