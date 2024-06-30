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

describe('markAsCompleted', () => {
  it('saves the form as completed in localStorage', () => {
    const form = new Form({ id: 1 })
    form.markAsCompleted()
    expect(localStorage.getItem('hello-form-1')).toEqual('completed')
  })

  it('emits a form:completed event', () => {
    const form = new Form({ id: 1 })
    const emit = jest.spyOn(Hellotext.eventEmitter, 'dispatch')

    form.markAsCompleted()
    expect(emit).toHaveBeenCalledWith('form:completed', { id: 1 })
  })
})
