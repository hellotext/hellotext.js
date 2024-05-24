/**
 * @jest-environment jsdom
 */

import { InputBuilder} from '../../src/builders/inputBuilder'

describe('when the input is first_name', () => {
  const data = {
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
    kind: 'first_name',
  }

  it('builds an article element that contains a label and input elements', () => {
    const article = InputBuilder.build(data)
    const label = article.querySelector('label')
    const input = article.querySelector('input')

    expect(label.innerText).toEqual('First Name')
    expect(label.getAttribute('for')).toEqual('first_name')

    expect(input.type).toEqual('text')
    expect(input.required).toEqual(true)
    expect(input.placeholder).toEqual('Enter your first name')
    expect(input.name).toEqual('first_name')
  })
})

describe('when the input is last_name', () => {
  const data = {
    label: 'Last Name',
    type: 'text',
    required: false,
    placeholder: 'Enter your last name',
    kind: 'last_name',
  }

  it('builds an article element that contains a label and input elements', () => {
    const article = InputBuilder.build(data)
    const label = article.querySelector('label')
    const input = article.querySelector('input')

    expect(label.innerText).toEqual('Last Name')
    expect(label.getAttribute('for')).toEqual('last_name')

    expect(input.type).toEqual('text')
    expect(input.required).toEqual(false)
    expect(input.placeholder).toEqual('Enter your last name')
    expect(input.name).toEqual('last_name')
  })
})

describe('when the input belongs to a property', () => {
  const data = {
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
    kind: 'email',
    property: 'xybz',
  }

  it('builds an article element that contains a label and input elements', () => {
    const article = InputBuilder.build(data)
    const label = article.querySelector('label')
    const input = article.querySelector('input')

    expect(label.innerText).toEqual('Email')
    expect(label.getAttribute('for')).toEqual('property_by_id[xybz]')

    expect(input.type).toEqual('email')
    expect(input.required).toEqual(true)
    expect(input.placeholder).toEqual('Enter your email')
    expect(input.name).toEqual('property_by_id[xybz]')
  })
})
