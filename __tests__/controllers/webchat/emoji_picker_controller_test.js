/**
 * @jest-environment jsdom
 */

import EmojiPickerController from '../../../src/controllers/webchat/emoji_picker_controller'
import { usePopover } from '../../../src/controllers/mixins/usePopover'

jest.mock('../../../src/controllers/mixins/usePopover')

describe('EmojiPickerController', () => {
  let controller
  let button
  let popover
  let picker

  beforeEach(() => {
    controller = new EmojiPickerController()
    button = document.createElement('button')
    popover = document.createElement('div')
    picker = document.createElement('div')

    controller.buttonTarget = button
    controller.popoverTarget = popover

    Object.defineProperty(controller, 'pickerObject', {
      get: () => picker,
      configurable: true
    })

    usePopover.mockImplementation(controller => {
      controller.setupFloatingUI = jest.fn()
    })
  })

  afterEach(() => {
    usePopover.mockReset()
  })

  it('positions the picker absolutely against its button', () => {
    controller.connect()

    expect(controller.setupFloatingUI).toHaveBeenCalledWith({
      trigger: button,
      popover: popover,
      strategy: 'absolute'
    })
    expect(popover.contains(picker)).toBe(true)
  })
})
