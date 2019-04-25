/**
 * Shows gui plugin of public harvester.
 * 
 * @module routes/onezone/public-harvester
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Route.extend({
  harvesterManager: service(),
  navigationState: service(),

  model({ harvester_id: harvesterId }) {
    return this.get('harvesterManager').getRecord(
      gri({
        entityType: 'harvester',
        entityId: harvesterId,
        aspect: 'instance',
        scope: 'auto',
      })
    );
  },

  afterModel(model) {
    const navigationState = this.get('navigationState');
    setProperties(navigationState, {
      activeResourceType: 'harvesters',
      activeResourceId: get(model, 'entityId'),
      activeResource: model,
    });
  },
});
