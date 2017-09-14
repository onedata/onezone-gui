import Ember from 'ember';

import OnedataWebsocketBase from 'onedata-gui-websocket-client/services/mocks/onedata-websocket-base';

const {
  RSVP: { Promise },
} = Ember;

export default OnedataWebsocketBase.extend({
  handshakeData: {
    version: 1,
    sessionId: 'test-session-id',
    identity: { user: 'test-user-id' },
    attributes: {},
  },

  /**
   * Resolves immediately
   * @override
   */
  handleSendHandshake() {
    return Promise.resolve(this.get('handshakeData'));
  },
});
