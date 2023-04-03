/**
 * Shows gui plugin of public harvester.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { reject } from 'rsvp';

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
      )
      .then(harvester => {
        const publicModel = this.modelFor('public');
        const isUserSignedIn = get(publicModel, 'isUserSignedIn');
        const isPublic = harvester.get('public');
        // Public may by true, false or undefined. True and false are obvious.
        // Undefined is when user is not a member of harvester, but it is public,
        // so can be fetched by everyone.
        if (isUserSignedIn && isPublic === false) {
          return reject({ id: 'forbidden' });
        } else {
          return harvester;
        }
      });
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
