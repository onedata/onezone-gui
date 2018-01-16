import Component from '@ember/component';
import { inject } from '@ember/service';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(UserProxyMixin, {
  currentUser: inject(),

  space: undefined,

  supportTokenProxy: undefined,

  init() {
    this._super(...arguments);
    if (!this.get('supportTokenProxy')) {
      this._updateSupportToken();
    }
    this.set('', this._getNewSupportToken());
  },

  _getNewSupportToken() {
    return this.get('space')
      .getInvitationToken('provider')
      .then(({ data }) => data);
  },

  _updateSupportToken() {
    this.set(
      'supportTokenProxy',
      PromiseObject.create({
        promise: this._getNewSupportToken(),
      })
    );
  },

  actions: {
    getNewSupportToken() {
      return this._getNewSupportToken();
    },
  },
});
