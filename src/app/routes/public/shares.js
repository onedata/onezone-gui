/**
 * Shows file browser in preview mode for share (user can be unauthenticated)
 * 
 * @module routes/public/harvesters
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { getOneproviderPath } from 'onedata-gui-common/utils/onedata-urls';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';

export default Route.extend({
  shareManager: service(),
  navigationState: service(),

  model({ share_id: shareId }) {
    return this.get('shareManager').getShareById(shareId, 'public');
  },

  afterModel(model) {
    if (isStandaloneGuiOneprovider(get(model, 'chosenProviderVersion'))) {
      return new Promise(() => {
        window.location = getOneproviderPath(
          get(model, 'chosenProviderId'),
          `public/shares/${get(model, 'entityId')}`
        );
      });
    } else {
      const navigationState = this.get('navigationState');
      setProperties(navigationState, {
        activeResourceType: 'shares',
        activeResourceId: get(model, 'entityId'),
        activeResource: model,
      });
    }
  },
});
