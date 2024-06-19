/**
 * @jest-environment jsdom
 */

import { Form } from '../../src/models'

describe('id', () => {
  it('is the form id', () => {
    const form = new Form({ id: 1 })
    expect(form.id).toEqual(1)
  })
})

describe('submissionUrl', () => {
  it('is the submission url for the form', () => {
    const form = new Form({ id: 1 })
    expect(form.submissionUrl.endsWith('/public/forms/1/submissions')).toEqual(true)
  })
})
