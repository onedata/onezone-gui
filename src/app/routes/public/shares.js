/**
 * Shows file browser in preview mode for share (user can be unauthenticated)
 *
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
import globals from 'onedata-gui-common/utils/globals';

export default Route.extend({
  shareManager: service(),
  navigationState: service(),

  model({ share_id: shareId }) {
    return this.get('shareManager').getShareById(shareId, 'public').catch(error => {
      if (error.id === 'notFound') {
        throw { isOnedataCustomError: true, type: 'share-not-found' };
      } else {
        throw { isOnedataCustomError: true, type: 'open-share-failed', reason: error };
      }

    });

  },

  afterModel(model) {
    const chosenProviderVersion = get(model, 'chosenProviderVersion');
    if (!chosenProviderVersion) {
      throw { isOnedataCustomError: true, type: 'offline-providers' };
    } else if (isStandaloneGuiOneprovider(chosenProviderVersion)) {
      return new Promise(() => {
        globals.window.location = getOneproviderPath(
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
