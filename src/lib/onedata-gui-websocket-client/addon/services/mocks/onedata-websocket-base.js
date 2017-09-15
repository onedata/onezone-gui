/**
 * Onedata Websocket Sync API - base of mocked low-level Websocket operation service
 *
 *  This mock will not work if send handlers are not implemented, see:
 * `service:mocks/onedata-websocket` for ready-to-use mock when developing
 *
 * For real service, see `onedata-websocket`
 *
 * @module services/onedata-websocket-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Service,
  RSVP: { Promise },
  computed: { readOnly },
  String: { camelize },
} = Ember;

export default Service.extend({
  initPromise: null,
  closePromise: null,

  webSocketIsOpened: readOnly('webSocketInitializedProxy.isFulfilled'),

  initConnection(options) {
    return this._initNewConnection(options);
  },

  closeConnection() {
    return this._closeConnectionStart();
  },

  _initNewConnection() {
    return this.set(
      'initPromise',
      this.sendMessage('handshake')
    );
  },

  _closeConnectionStart() {
    return this.set(
      'closePromise',
      Promise.resolve()
    );
  },

  /**
   * @abstract
   * @throws {Error} not implemented
   * @returns {undefined}
   */
  handleSendRpc() {
    throw new Error('service:onedata-websocket-mock: handleSendRpc not implemented');
  },

  /**
   * Mocking send message
   * Please implement or override send handlers:
   * - `handleSendHandshake`
   * - `handleSendRpc`
   * - `handleSendGraph`
   * @param {String} subtype one of: handshake, rpc, graph
   * @param {object} message
   * @returns {Promise<object>} resolves with message response
   */
  sendMessage(subtype, message) {
    let handlerFun = this[camelize(`handle-send-${subtype}`)];
    if (handlerFun) {
      return handlerFun.bind(this)(message);
    } else {
      throw new Error(
        `service:onedata-websocket-mock: sendMessage not implemented for type ${subtype}`
      );
    }
  },
});
