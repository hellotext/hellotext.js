import { Configuration } from '../core'

import API from '../api'
import { Navigation } from './navigation'
import { Query } from './query'

// Public popup ids are path segments of the popups endpoint; anything else in
// `hello_popup` could point the request at another endpoint.
const POPUP_ID = /^[A-Za-z0-9_-]{1,64}$/

class Popup {
  /**
   * The popup a Hellotext short link asked to open, from `hello_popup`.
   *
   * It counts only when the visitor followed the link: a reload or a back
   * navigation that restores the address does not open it again, nor does
   * another page of the store whose links kept the query (pagination,
   * filters). A link opened from inside the store, such as the webchat, still
   * opens it, because the page the visitor came from did not ask for it.
   *
   * @returns {String|null}
   */
  static get linkedId() {
    const id = new Query().popup
    if (!id || !POPUP_ID.test(id)) return null

    if (Navigation.restored && Popup.idIn(Navigation.documentSearch) === id) return null

    const referrer = Navigation.sameSiteReferrer
    if (referrer && Popup.idIn(referrer.search) === id) return null

    return id
  }

  static idIn(search) {
    return new URLSearchParams(search || '').get('hello_popup')
  }

  static async load(id, options = {}) {
    const popup = new Popup(
      {
        id,
        html: await API.popups.get(id),
      },
      options,
    )

    popup.rendered = popup.render()

    return popup
  }

  /**
   * @param {Object} data - The popup id and its server-rendered root.
   * @param {Object} [options]
   * @param {String} [options.container] - Selector of the element to append the popup to.
   * @param {Boolean} [options.linked] - Opened from a short link: the dialog opens
   * immediately on any device instead of following the bubble and device settings.
   * @param {() => Boolean} [options.shouldMount] - Whether this popup still belongs to
   * the current initialization.
   */
  constructor(
    data,
    { container = Configuration.popup.container, linked = false, shouldMount = () => true } = {},
  ) {
    this.data = data
    this.container = container
    this.linked = linked
    this.mounted = false
    this.rendered = Promise.resolve(false)
    this.shouldMount = shouldMount
  }

  async render() {
    if (!this.data.html || !this.shouldMount()) return false

    const container = this.containerToAppendTo
    if (!container) {
      console.warn(
        `Hellotext popup was not mounted because the container ${this.container} was not found.`,
      )
      return false
    }

    if (!this.shouldMount()) return false

    if (this.linked) this.data.html.setAttribute('data-hellotext--popup-linked-value', 'true')

    container.appendChild(this.data.html)
    this.mounted = true

    if (!this.shouldMount()) this.unmount()

    return this.mounted
  }

  /**
   * Remove this popup's server-rendered surface when a later initialization
   * replaces or disables it. Removing the root also disconnects Stimulus.
   *
   * @returns {void}
   */
  unmount() {
    this.data.html?.remove()
    this.mounted = false
  }

  get containerToAppendTo() {
    try {
      return document.querySelector(this.container)
    } catch (_) {
      return null
    }
  }
}

export { Popup }
