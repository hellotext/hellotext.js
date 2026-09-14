/**
 * @jest-environment jsdom
 */

import { Application } from '@hotwired/stimulus'

import API from '../../src/api'
import PopupController from '../../src/controllers/popup_controller'
import { Configuration } from '../../src/core'
import { Popup } from '../../src/models'

describe('server-rendered popup completion', () => {
  let application

  const popupRuntimeHTML = `
    <article class="hellotext--popup"
             data-controller="hellotext--popup"
             data-hellotext--popup-capture-value="{}"
             data-hellotext--popup-device-value="all"
             data-hellotext--popup-has-bubble-value="false"
             data-hellotext--popup-id-value="popup-id">
      <section class="hellotext--popup__dialog" data-hellotext--popup-target="dialog">
        <section data-hellotext--popup-target="step">
          <input type="email" value="customer@example.com"
                 data-hellotext--popup-target="input"
                 data-popup-field-kind="email"
                 data-popup-field-key="email"
                 data-popup-step-id="step-one">
        </section>

        <section hidden data-hellotext--popup-target="completed">
          <header class="hellotext--popup__completion-headline"
                  data-hellotext--popup-target="deliveryCopy"><h4><strong>Your code is on its way</strong></h4></header>
          <div class="hellotext--popup__completion-description"
               data-hellotext--popup-target="deliveryCopy">We sent it to {destination}.</div>
          <header hidden class="hellotext--popup__completion-headline"
                  data-hellotext--popup-target="noDeliveryCopy"><h4><strong>Thanks for signing up</strong></h4></header>
          <div hidden class="hellotext--popup__completion-description"
               data-hellotext--popup-target="noDeliveryCopy">Your details were saved.</div>
          <footer data-delivery-actions></footer>
        </section>
      </section>
    </article>
  `

  beforeEach(() => {
    document.body.innerHTML = '<main id="popup-container"></main>'
    Configuration.popup.container = '#popup-container'
    jest.spyOn(API.popups, 'get').mockResolvedValue(
      new DOMParser().parseFromString(popupRuntimeHTML, 'text/html').querySelector('article'),
    )

    application = Application.start()
    application.register('hellotext--popup', PopupController)
  })

  afterEach(() => {
    application.stop()
    jest.restoreAllMocks()
    document.body.innerHTML = ''
    Configuration.popup.container = 'body'
  })

  it('mounts Rails completion markup and reveals its thank-you targets without rebuilding HTML', async () => {
    await Popup.load('popup-id')
    await Promise.resolve()
    await Promise.resolve()

    const popup = document.querySelector('.hellotext--popup')
    const controller = application.getControllerForElementAndIdentifier(popup, 'hellotext--popup')
    const deliveryCopy = popup.querySelectorAll('[data-hellotext--popup-target="deliveryCopy"]')
    const noDeliveryCopy = popup.querySelectorAll('[data-hellotext--popup-target="noDeliveryCopy"]')

    expect(controller).toBeInstanceOf(PopupController)
    expect(deliveryCopy).toHaveLength(2)
    expect(noDeliveryCopy).toHaveLength(2)

    controller.submissionDeliveryStatus = 'not_required'
    controller.showCompleted()

    expect([...deliveryCopy].every(element => element.hidden)).toBe(true)
    expect([...noDeliveryCopy].every(element => !element.hidden)).toBe(true)
    expect(noDeliveryCopy[0].innerHTML).toBe('<h4><strong>Thanks for signing up</strong></h4>')
    expect(popup.querySelector('[data-delivery-actions]').hidden).toBe(true)
  })
})
