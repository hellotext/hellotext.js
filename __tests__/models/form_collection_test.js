/**
 * @jest-environment jsdom
 */

import { Business, FormCollection } from '../../src/models'
import Hellotext from '../../src/hellotext'

beforeEach(() => {
  Business.prototype.fetchPublicData = jest.fn().mockResolvedValue({ whitelist: 'disabled' })

  Hellotext.initialize('M01az53K', {
    autogenerateSession: false,
    autoMountForms: false
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
  const forms = new FormCollection()
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

describe('getting elements', () => {
  const forms = new FormCollection()
  forms.add({ id: 1, name: 'Form 1' })
  forms.add({ id: 2, name: 'Form 1' })

  describe('getById', () => {
    it('returns the form with the given id', () => {
      expect(forms.getById(1).id).toEqual(1)
    })
  })

  describe('getByIndex', () => {
    it('returns the form at the given index', () => {
      expect(forms.getByIndex(1).id).toEqual(2)
    })
  })
})

describe('includes', () => {
  const forms = new FormCollection()
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
  const forms = new FormCollection()
  const form = { id: 1, name: 'Form 1' }

  it('is true when the form is not in the forms array', () => {
    expect(forms.excludes(2)).toEqual(true)
  })

  it('is false when the form is in the forms array', () => {
    forms.add(form)
    expect(forms.excludes(1)).toEqual(false)
  })
})
