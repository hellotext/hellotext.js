import BusinessesAPI from './businesses'
import EventsAPI from './events'
import FormsAPI from './forms'
import IdentificationsAPI from './identifications'
import WebchatsAPI from './webchats'
import WhatsAppWidgetsAPI from './whatsapp_widgets'
import AcksAPI from './acks'

// Browsers keep `fetch(..., { keepalive: true })` requests alive during page
// unload/navigation, which is exactly the failure mode for analytics events
// fired from checkout redirects, form submissions, tab closes, and pixel
// lifecycles. The platform also caps keepalive request bodies around 64KB, and
// browsers can reject or drop oversized requests instead of making delivery
// more reliable. Keep the limit below that ceiling so the SDK only opts in when
// the payload is small enough for the keepalive transport contract.
const KEEPALIVE_BODY_LIMIT = 60000

function keepaliveFor(body) {
  const serializedBody = JSON.stringify(body)

  // Use byte size when the runtime exposes Blob because non-ASCII JSON can be
  // larger on the wire than its JavaScript string length. The string-length
  // fallback keeps older/non-browser runtimes conservative without pulling in
  // another encoder just for this transport hint.
  if (typeof Blob === 'undefined') {
    return serializedBody.length < KEEPALIVE_BODY_LIMIT
  }

  return new Blob([serializedBody]).size < KEEPALIVE_BODY_LIMIT
}

export default class API {
  static get businesses() {
    return BusinessesAPI
  }

  static get events() {
    return EventsAPI
  }

  static get forms() {
    return FormsAPI
  }

  static get webchats() {
    return WebchatsAPI
  }

  static get whatsappWidgets() {
    return WhatsAppWidgetsAPI
  }

  static get identifications() {
    return IdentificationsAPI
  }

  static get acks() {
    return AcksAPI
  }
}

export { Response } from './response'
export { keepaliveFor }
