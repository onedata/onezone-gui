/**
 * Adds handshake support for `onedata-websocket` service mock
 *
 * When using this mixin, also `authenticator:mocks/onedata-websocket`
 * should be used as an authenticator
 *
 * @module mixins/services/onedata-websocket-cookies-handshake
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Mixin,
  RSVP: { Promise },
  inject: { service },
} = Ember;

export default Mixin.create({
  cookies: service(),

  /**
   * Default user ID after mocked authentication
   * @type {String}
   */
  defaultUserId: 'some-user-id',

  /**
   * Default implementation of mocked handshake that uses cookies to check
   * if user is authenticated
   * @override
   * @returns {Promise.<HandshakeData>}
   */
  handleSendHandshake() {
    let isAuthenticated = this.get('cookies').read('is-authenticated') === 'true';
    let user = this.get('defaultUserId');
    return Promise.resolve({
      version: 1,
      sessionId: 'some-session-id',
      identity: isAuthenticated ? { user } : 'nobody',
      attributes: {},
    });
  },
});
