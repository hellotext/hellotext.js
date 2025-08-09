/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { FormCollection } from '../../src/models'

beforeEach(() => {
  Hellotext.initialize('M01az53K', {
    autoGenerateSession: false,
    forms: {
      autoMount: false,
    }
  })

  Hellotext.business.data = {
    whitelist: 'enabled',
    features: {},
    subscription: 'basic',
    country: 'US',
    locale: 'en'
  }

  Hellotext.business.setData = jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
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
  const form = {
    id: 1,
    name: 'Form 1',
    business: {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }
  }

  it('adds a form to the forms array', () => {
    const forms = new FormCollection()
    forms.add(form)
    expect(forms.length).toEqual(1)
  })

  it('does not add a form that is already in the forms array', () => {
    const forms = new FormCollection()
    forms.add(form)
    forms.add(form)

    expect(forms.length).toEqual(1)
  })
})

describe('getting elements', () => {
  const mockBusiness = {
    whitelist: 'enabled',
    features: {},
    subscription: 'basic',
    country: 'US',
    locale: 'en'
  }

  describe('getById', () => {
    it('returns the form with the given id', () => {
      const forms = new FormCollection()
      forms.add({ id: 1, name: 'Form 1', business: mockBusiness })
      forms.add({ id: 2, name: 'Form 2', business: mockBusiness })
      expect(forms.getById(1).id).toEqual(1)
    })
  })

  describe('getByIndex', () => {
    it('returns the form at the given index', () => {
      const forms = new FormCollection()
      forms.add({ id: 1, name: 'Form 1', business: mockBusiness })
      forms.add({ id: 2, name: 'Form 2', business: mockBusiness })
      expect(forms.getByIndex(1).id).toEqual(2)
    })
  })
})

describe('includes', () => {
  const form = {
    id: 1,
    name: 'Form 1',
    business: {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }
  }

  it('is true when the form is in the forms array', () => {
    const forms = new FormCollection()
    forms.add(form)
    expect(forms.includes(1)).toEqual(true)
  })

  it('is false when the form is not in the forms array', () => {
    const forms = new FormCollection()
    expect(forms.includes(2)).toEqual(false)
  })
})

describe('excludes', () => {
  const form = {
    id: 1,
    name: 'Form 1',
    business: {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }
  }

  it('is true when the form is not in the forms array', () => {
    const forms = new FormCollection()
    expect(forms.excludes(2)).toEqual(true)
  })

  it('is false when the form is in the forms array', () => {
    const forms = new FormCollection()
    forms.add(form)
    expect(forms.excludes(1)).toEqual(false)
  })
})
