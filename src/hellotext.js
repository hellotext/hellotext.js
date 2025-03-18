import { Event, Configuration } from './core'

import API, { Response } from './api'
import { Business, Query, FormCollection, Session, Webchat } from './models'

import { NotInitializedError } from './errors'


class Hellotext {
  static #session
  static #query

  static eventEmitter = new Event()
  static forms
  static business
  static webchat

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config) {
    this.business = new Business(business)

    Configuration.assign(config)
    Session.initialize()

    this.#query = new Query()
    this.forms = new FormCollection()

    if (Configuration.webchat.id) {
      this.webchat = await Webchat.load(Configuration.webchat.id)
    }
  }

  /**
   * Tracks an action that has happened on the page
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise<Response>}
   */
  static async track(action, params = {}) {
    if (this.notInitialized) {
      throw new NotInitializedError()
    }

    const headers = {
      ...(params && params.headers) || {},
      ...this.headers,
    }

    const body = {
      session: this.session,
      action,
      ...params,
      url: (params && params.url) || window.location.href,
    }

    delete body.headers

    return await API.events.create({
      headers,
      body,
    })
  }

  /**
   * Registers an event listener
   * @param event the name of the event to listen to
   * @param callback the callback. This method will be called with the payload
   */
  static on(event, callback) {
    this.eventEmitter.addSubscriber(event, callback)
  }

  /**
   * Removes an event listener
   * @param event the name of the event to remove
   * @param callback the callback to remove
   */
  static removeEventListener(event, callback) {
    this.eventEmitter.removeSubscriber(event, callback)
  }

  /**
   *
   * @returns {String}
   */
  static get session() {
    return Session.session
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return Session.session !== undefined
  }

  // private

  static get notInitialized() {
    return this.business.id === undefined
  }

  static get headers() {
    if (this.notInitialized) {
      throw new NotInitializedError()
    }

    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
}

export default Hellotext
