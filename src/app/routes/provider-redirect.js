import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import gri from 'onedata-gui-websocket-client/utils/gri';

export default Route.extend(AuthenticatedRouteMixin, {
  providerManager: service(),

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
