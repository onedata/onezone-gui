import Ember from 'ember';

import OnedataWebsocket from 'onedata-gui-websocket-client/authenticators/onedata-websocket';

const {
  inject: { service },
  RSVP: { Promise },
} = Ember;

export default OnedataWebsocket.extend({
  onedataWebsocket: service('onedata-websocket-mock'),
  cookies: service(),

  // TODO validate username/password
  authenticate() {
    this.get('cookies').write('is-authenticated', 'true');
    return this._super(...arguments);
  },

  /**
   * @override
   */
  remoteInvalidate() {
    return new Promise(resolve => {
      this.get('cookies').write('is-authenticated', 'false');
      resolve();
    });
  },
});
