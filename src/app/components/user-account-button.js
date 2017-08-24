import Ember from 'ember';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';
import layout from 'onedata-gui-common/templates/components/user-account-button';

const {
  inject: { service },
  computed: { readOnly },
} = Ember;

export default UserAccountButton.extend({
  layout,

  session: service(),
  globalNotify: service(),

  /**
   * @override
   */
  username: readOnly('session.data.authenticated.identity.user'),

  actions: {
    /**
     * @override
     */
    manageAccount() {
      this.get('globalNotify').error('Account settings not implemented yet');
    },
  },
});
