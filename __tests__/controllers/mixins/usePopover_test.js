/**
 * @jest-environment jsdom
 */

import { autoUpdate, computePosition } from '@floating-ui/dom'
import { Configuration } from '../../../src/core'
import { usePopover } from '../../../src/controllers/mixins/usePopover'

jest.mock('@floating-ui/dom', () => ({
  autoUpdate: jest.fn(),
  computePosition: jest.fn()
}))

describe('usePopover', () => {
  let controller
  let trigger
  let popover
  let cleanup

  beforeEach(() => {
    controller = {
      placementValue: 'bottom-end',
      middlewares: ['middleware']
    }
    trigger = document.createElement('button')
    popover = document.createElement('div')
    cleanup = jest.fn()

    autoUpdate.mockImplementation((_trigger, _popover, update) => {
      update()
      return cleanup
    })
    computePosition.mockResolvedValue({ x: 12, y: 24, strategy: 'absolute' })
  })

  afterEach(() => {
    jest.clearAllMocks()
    Configuration.webchat.strategy = null
    Configuration.webchat.container = 'body'
  })

  it('uses the supplied positioning strategy when one is provided', () => {
    Configuration.webchat.strategy = 'fixed'

    usePopover(controller)
    controller.setupFloatingUI({ trigger, popover, strategy: 'absolute' })

    expect(computePosition).toHaveBeenCalledWith(trigger, popover, {
      placement: 'bottom-end',
      middleware: ['middleware'],
      strategy: 'absolute'
    })
    expect(controller.floatingUICleanup).toBe(cleanup)
  })

  it('falls back to the configured webchat strategy when none is provided', () => {
    Configuration.webchat.strategy = 'fixed'

    usePopover(controller)
    controller.setupFloatingUI({ trigger, popover })

    expect(computePosition).toHaveBeenCalledWith(trigger, popover, {
      placement: 'bottom-end',
      middleware: ['middleware'],
      strategy: 'fixed'
    })
  })

  it('cancels a pending behaviour open before showing the popover', () => {
    controller.cancelBehaviourOpen = jest.fn()

    usePopover(controller)
    controller.show()

    expect(controller.cancelBehaviourOpen).toHaveBeenCalledTimes(1)
    expect(controller.openValue).toBe(true)
  })

  it('cancels a pending behaviour open before toggling the popover', () => {
    controller.openValue = false
    controller.cancelBehaviourOpen = jest.fn()

    usePopover(controller)
    controller.toggle()

    expect(controller.cancelBehaviourOpen).toHaveBeenCalledTimes(1)
    expect(controller.openValue).toBe(true)
  })
})
