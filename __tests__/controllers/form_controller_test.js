import { Application } from '@hotwired/stimulus'
import FormController from '../../src/controllers/form_controller'
import Hellotext from '../../src/hellotext'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Form start tracking', () => {
  let application
  let element

  const input = () => element.querySelector('input')
  const type = () => input().dispatchEvent(new Event('input', { bubbles: true }))

  beforeEach(async () => {
    localStorage.clear()
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-id')
    jest.spyOn(Hellotext, 'track').mockResolvedValue({ succeeded: true })
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'nextTick', 'setImmediate', 'queueMicrotask'] })
    jest.setSystemTime(new Date(2026, 10, 6, 12))

    document.body.innerHTML = `
      <form data-controller="hellotext--form" data-hellotext--form-data-value='{"id":"form-id","steps":[]}'>
        <input data-hellotext--form-target="input" name="email">
      </form>
    `
    element = document.querySelector('form')

    application = Application.start()
    application.register('hellotext--form', FormController)
    await flush()
  })

  afterEach(() => {
    application.stop()
    jest.useRealTimers()
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('reports the first input, not the focus the form gives its first field', async () => {
    expect(Hellotext.track).not.toHaveBeenCalled()

    type()
    await flush()

    expect(Hellotext.track).toHaveBeenCalledWith('form.started', { form_id: 'form-id', tracked_at: expect.any(String) })
  })

  it('reports once per session, form and day', async () => {
    type()
    type()
    await flush()
    type()
    await flush()

    expect(Hellotext.track).toHaveBeenCalledTimes(1)

    jest.setSystemTime(new Date(2026, 10, 7, 12))
    type()
    await flush()

    expect(Hellotext.track).toHaveBeenCalledTimes(2)
  })

  it('reports again on the next input after a failed report', async () => {
    Hellotext.track.mockResolvedValueOnce({ succeeded: false })

    type()
    await flush()
    type()
    await flush()

    expect(Hellotext.track).toHaveBeenCalledTimes(2)
  })

  it('keeps the form working when reporting throws', async () => {
    Hellotext.track.mockRejectedValueOnce(new Error('Offline'))

    expect(() => type()).not.toThrow()
    await flush()
  })
})
