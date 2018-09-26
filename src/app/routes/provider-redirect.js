/**
 * Redirect to some provider (URL got from backend).
 * 
 * @module routes/onezone/provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import RedirectRoute from 'onedata-gui-common/mixins/routes/redirect';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Route.extend(AuthenticatedRouteMixin, RedirectRoute, {
  providerManager: service(),

  /** 
   * @override
   */
  checkComeFromOtherRoute(currentHash) {
    return !/\/provider-redirect/.test(currentHash);
  },

  beforeModel() {
    return this._super(...arguments);
  },

  model({ provider_id: providerId }) {
    return this.get('providerManager').getRecord(
      gri({
        entityType: 'provider',
        entityId: providerId,
        aspect: 'instance',
        scope: 'protected',
      })
    );
  },
});
