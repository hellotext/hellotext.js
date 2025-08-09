/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { Form, FormCollection } from '../../src/models'

beforeEach(() => {
  jest.spyOn(Form.prototype, 'mount').mockImplementation(() => Promise.resolve())

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

  it('throws NotInitializedError when Hellotext is not initialized', async () => {
    const originalBusiness = Hellotext.business

    Hellotext.business = { id: undefined }
    const forms = new FormCollection()

    await expect(forms.collect()).rejects.toThrow('You need to initialize before tracking events')

    Hellotext.business = originalBusiness
  })

  it('returns early if already fetching', async () => {
    const forms = new FormCollection()
    const fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue({ id: 1 }) })
    global.fetch = fetch

    document.body.innerHTML = `<form data-hello-form="1"></form>`

    forms.fetching = true
    await forms.collect()

    expect(fetch).not.toHaveBeenCalled()
  })

  it('emits forms:collected event after successful collection', async () => {
    const eventSpy = jest.spyOn(Hellotext.eventEmitter, 'dispatch')

    const mockFormData = {
      id: 1,
      name: 'Test Form',
      steps: [
        {
          header: { content: 'Test Header' },
          inputs: [],
          button: { text: 'Submit' },
          footer: { content: 'Test Footer' }
        }
      ],
      business: {
        whitelist: 'enabled',
        features: {},
        subscription: 'basic',
        country: 'US',
        locale: 'en'
      }
    }

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockFormData)
    })

    document.body.innerHTML = `<form data-hello-form="1"></form>`
    await Hellotext.forms.collect()

    expect(eventSpy).toHaveBeenCalledWith('forms:collected', Hellotext.forms)
  })

  it('mounts forms when autoMount is enabled', async () => {
    Hellotext.initialize('M01az53K', {
      autoGenerateSession: false,
      forms: {
        autoMount: true,
      }
    })

    const mockFormData = {
      id: 1,
      name: 'Test Form',
      steps: [
        {
          header: { content: 'Test Header' },
          inputs: [],
          button: { text: 'Submit' },
          footer: { content: 'Test Footer' }
        }
      ],
      business: {
        whitelist: 'enabled',
        features: {},
        subscription: 'basic',
        country: 'US',
        locale: 'en'
      }
    }


    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockFormData)
    })

    document.body.innerHTML = `<form data-hello-form="1"></form>`

    await Hellotext.forms.collect()

    expect(Hellotext.forms.length).toEqual(1)
    expect(Form.prototype.mount).toHaveBeenCalled()
  })
})

describe('add', () => {
  const form = {
    id: 1,
    name: 'Form 1',
    steps: [
      {
        header: { content: 'Test Header' },
        inputs: [],
        button: { text: 'Submit' },
        footer: { content: 'Test Footer' }
      }
    ],
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
      forms.add({
        id: 1,
        name: 'Form 1',
        business: mockBusiness,
        steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
      })
      forms.add({
        id: 2,
        name: 'Form 2',
        business: mockBusiness,
        steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
      })
      expect(forms.getById(1).id).toEqual(1)
    })
  })

  describe('getByIndex', () => {
    it('returns the form at the given index', () => {
      const forms = new FormCollection()
      forms.add({
        id: 1,
        name: 'Form 1',
        business: mockBusiness,
        steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
      })
      forms.add({
        id: 2,
        name: 'Form 2',
        business: mockBusiness,
        steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
      })
      expect(forms.getByIndex(1).id).toEqual(2)
    })
  })
})

describe('includes', () => {
  const form = {
    id: 1,
    name: 'Form 1',
    steps: [
      {
        header: { content: 'Test Header' },
        inputs: [],
        button: { text: 'Submit' },
        footer: { content: 'Test Footer' }
      }
    ],
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
    steps: [
      {
        header: { content: 'Test Header' },
        inputs: [],
        button: { text: 'Submit' },
        footer: { content: 'Test Footer' }
      }
    ],
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

describe('forEach', () => {
  it('iterates over all forms in the collection', () => {
    const forms = new FormCollection()
    const mockBusiness = {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }

    forms.add({
      id: 1,
      name: 'Form 1',
      business: mockBusiness,
      steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
    })
    forms.add({
      id: 2,
      name: 'Form 2',
      business: mockBusiness,
      steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
    })

    const callback = jest.fn()
    forms.forEach(callback)

    expect(callback).toHaveBeenCalledTimes(2)
    // Check that callback was called with Form objects containing the right data
    const calls = callback.mock.calls
    const firstForm = calls[0][0]
    const secondForm = calls[1][0]

    expect(firstForm.data.id).toBe(1)
    expect(secondForm.data.id).toBe(2)
  })
})

describe('map', () => {
  it('transforms all forms in the collection', () => {
    const forms = new FormCollection()
    const mockBusiness = {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }

    forms.add({
      id: 1,
      name: 'Form 1',
      business: mockBusiness,
      steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
    })
    forms.add({
      id: 2,
      name: 'Form 2',
      business: mockBusiness,
      steps: [{ header: { content: 'Test' }, inputs: [], button: { text: 'Submit' }, footer: { content: 'Test' } }]
    })

    const result = forms.map(form => form.id)

    expect(result).toEqual([1, 2])
  })
})

describe('length getter', () => {
  it('returns the number of forms in the collection', () => {
    const forms = new FormCollection()
    const mockBusiness = {
      whitelist: 'enabled',
      features: {},
      subscription: 'basic',
      country: 'US',
      locale: 'en'
    }

    expect(forms.length).toEqual(0)

    forms.add({ id: 1, name: 'Form 1', business: mockBusiness })
    expect(forms.length).toEqual(1)

    forms.add({ id: 2, name: 'Form 2', business: mockBusiness })
    expect(forms.length).toEqual(2)
  })
})

describe('getById edge cases', () => {
  it('returns undefined when form with given id does not exist', () => {
    const forms = new FormCollection()
    expect(forms.getById(999)).toBeUndefined()
  })
})

describe('getByIndex edge cases', () => {
  it('returns undefined when index is out of bounds', () => {
    const forms = new FormCollection()
    expect(forms.getByIndex(0)).toBeUndefined()
    expect(forms.getByIndex(-1)).toBeUndefined()
  })
})

describe('add with business data', () => {
    it('sets business data when Hellotext.business.data is null', () => {
    const forms = new FormCollection()

    // Reset business data to null and mock enabledWhitelist getter
    Hellotext.business.data = null
    Object.defineProperty(Hellotext.business, 'enabledWhitelist', {
      get: jest.fn(() => false),
      configurable: true
    })

    const form = {
      id: 1,
      name: 'Form 1',
      steps: [
        {
          header: { content: 'Test Header' },
          inputs: [],
          button: { text: 'Submit' },
          footer: { content: 'Test Footer' }
        }
      ],
      business: {
        whitelist: 'enabled',
        features: {},
        subscription: 'basic',
        country: 'US',
        locale: 'en'
      }
    }

    forms.add(form)

    expect(Hellotext.business.setData).toHaveBeenCalledWith(form.business)
  })

  it('does not set business data when Hellotext.business.data already exists', () => {
    const forms = new FormCollection()

    // Ensure business data exists
    Hellotext.business.data = { existing: 'data' }

    const form = {
      id: 1,
      name: 'Form 1',
      steps: [
        {
          header: { content: 'Test Header' },
          inputs: [],
          button: { text: 'Submit' },
          footer: { content: 'Test Footer' }
        }
      ],
      business: {
        whitelist: 'enabled',
        features: {},
        subscription: 'basic',
        country: 'US',
        locale: 'en'
      }
    }

    forms.add(form)

    expect(Hellotext.business.setData).not.toHaveBeenCalled()
  })
})

describe('MutationObserver functionality', () => {
  beforeEach(() => {
    // Ensure autoMount is enabled for these tests
    Hellotext.initialize('M01az53K', {
      autoGenerateSession: false,
      forms: {
        autoMount: true,
      }
    })
  })

  it('sets up MutationObserver when MutationObserver is available', () => {
    const forms = new FormCollection()
    expect(forms.mutationObserver).toBeDefined()
    expect(forms.mutationObserver).toBeInstanceOf(MutationObserver)
  })

  it('calls collect when new forms are added to DOM and autoMount is enabled', () => {
    const forms = new FormCollection()
    const collectSpy = jest.spyOn(forms, 'collect').mockImplementation(() => Promise.resolve())

    // Simulate a mutation where a form was added
    const mockMutation = {
      type: 'childList',
      addedNodes: [document.createElement('form')]
    }

    // Add a form to the DOM
    document.body.innerHTML = '<form data-hello-form="1"></form>'

    // Manually trigger the mutation observer callback
    forms.formMutationObserver([mockMutation])

    expect(collectSpy).toHaveBeenCalled()
  })

  it('does not call collect when no childList mutations occur', () => {
    const forms = new FormCollection()
    const collectSpy = jest.spyOn(forms, 'collect').mockImplementation(() => Promise.resolve())

    // Simulate a mutation that is not childList
    const mockMutation = {
      type: 'attributes',
      addedNodes: []
    }

    forms.formMutationObserver([mockMutation])

    expect(collectSpy).not.toHaveBeenCalled()
  })

  it('does not call collect when mutations have no added nodes', () => {
    const forms = new FormCollection()
    const collectSpy = jest.spyOn(forms, 'collect').mockImplementation(() => Promise.resolve())

    // Simulate a mutation with no added nodes
    const mockMutation = {
      type: 'childList',
      addedNodes: []
    }

    forms.formMutationObserver([mockMutation])

    expect(collectSpy).not.toHaveBeenCalled()
  })
})
