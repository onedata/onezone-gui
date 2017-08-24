import Ember from 'ember';

const {
  Evented,
  RSVP: { Promise },
  computed: { readOnly },
  inject: { service },
} = Ember;

export default Ember.Service.extend(Evented, {
  cookies: service(),

  initPromise: null,
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
      this.send('handshake')
    );
  },

  _closeConnectionStart() {
    return this.set(
      'initPromise',
      Promise.resolve()
    );
  },

  send(subtype /*, message*/ ) {
    let isAuthenticated = this.get('cookies').read('is-authenticated') === 'true';
    switch (subtype) {
      case 'handshake':
        return new Promise((resolve) => {
          resolve({
            version: 1,
            sessionId: 'some-session-id',
            identity: isAuthenticated ? { user: 'some-user-id' } : 'nobody',
            attributes: {},
          });
        });
      case 'rpc':
        throw new Error('not implemented');
      case 'graph':
        throw new Error('not implemented');
      default:
        throw new Error('not implemented');
    }
  },
});
