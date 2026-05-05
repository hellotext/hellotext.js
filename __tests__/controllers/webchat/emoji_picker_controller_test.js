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

    usePopover.mockImplementation(controller => {
      controller.setupFloatingUI = jest.fn()
    })
  })

  afterEach(() => {
    usePopover.mockReset()
  })

  it('positions the picker absolutely against its button without loading emoji assets immediately', () => {
    controller.loadPickerDependencies = jest.fn()

    controller.connect()

    expect(controller.setupFloatingUI).toHaveBeenCalledWith({
      trigger: button,
      popover: popover,
      strategy: 'absolute'
    })
    expect(controller.loadPickerDependencies).not.toHaveBeenCalled()
    expect(popover.contains(picker)).toBe(false)
  })

  it('loads and appends the picker when the popover opens', async () => {
    const Picker = jest.fn(() => picker)

    controller.loadPickerDependencies = jest.fn().mockResolvedValue({
      Picker,
      i18n: { search: 'Search' },
    })

    controller.connect()
    await controller.onPopoverOpened()

    expect(controller.loadPickerDependencies).toHaveBeenCalledTimes(1)
    expect(Picker).toHaveBeenCalledWith(expect.objectContaining({
      onEmojiSelect: controller.onEmojiSelect,
      i18n: { search: 'Search' },
    }))
    expect(popover.contains(picker)).toBe(true)
  })

  it('loads the picker only once', async () => {
    const Picker = jest.fn(() => picker)

    controller.loadPickerDependencies = jest.fn().mockResolvedValue({
      Picker,
      i18n: { search: 'Search' },
    })

    controller.connect()
    await controller.onPopoverOpened()
    await controller.onPopoverOpened()

    expect(controller.loadPickerDependencies).toHaveBeenCalledTimes(1)
    expect(Picker).toHaveBeenCalledTimes(1)
  })
})
