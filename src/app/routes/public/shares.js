/**
 * Shows file browser in preview mode for share (user can be unauthenticated)
 * 
 * @module routes/public/harvesters
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  shareManager: service(),
  navigationState: service(),

  model({ share_id: shareId }) {
    return this.get('shareManager').getShare(shareId, 'public');
  },

  afterModel(model) {
    // FIXME: this code can be used when the version of provider will be updated
    // if (get(model, 'chosenProviderVersion').startsWith('19.02')) {
    //   return new Promise(() => {
    //     window.location = getOneproviderPath(
    //       get(model, 'chosenProviderId'),
    //       `onedata/shares/${get(model, 'entityId')}`
    //     );
    //   });
    // } else {
    const navigationState = this.get('navigationState');
    setProperties(navigationState, {
      activeResourceType: 'shares',
      activeResourceId: get(model, 'entityId'),
      activeResource: model,
    });
  },
});
