/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { InputBuilder } from '../../src/builders/inputBuilder'

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

    expect(input.id).toEqual('first_name')
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

    expect(input.id).toEqual('last_name')
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
    expect(label.getAttribute('for')).toEqual('email')

    expect(input.id).toEqual('email')
    expect(input.type).toEqual('email')
    expect(input.required).toEqual(true)
    expect(input.placeholder).toEqual('Enter your email')
    expect(input.name).toEqual('email')
  })
})

describe('when the input is a phone number', () => {
  const data = {
    label: 'Phone',
    type: 'tel',
    required: true,
    placeholder: 'Enter your phone number',
    kind: 'phone',
  }

  beforeEach(() => {
    Hellotext.business = {
      country: {
        prefix: '598',
        code: 'UY',
      }
    }
  })

  it('builds an article element that contains a label and input elements', () => {
    const article = InputBuilder.build(data)
    const label = article.querySelector('label')
    const input = article.querySelector('input')

    expect(label.innerText).toEqual('Phone')
    expect(label.getAttribute('for')).toEqual('phone')

    expect(input.id).toEqual('phone')
    expect(input.type).toEqual('tel')
    expect(input.required).toEqual(true)
    expect(input.placeholder).toEqual('Enter your phone number')
    expect(input.name).toEqual('phone')
    expect(input.value).toEqual('+598')
  })
})
