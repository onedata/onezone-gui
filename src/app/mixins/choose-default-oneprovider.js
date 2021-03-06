/**
 * Resolves selected default Oneprovider for some space or tries to deduct a first default
 * Oneprovider if not chosen yet.
 * 
 * @module mixins/choose-default-oneprovider
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { resolve, allSettled } from 'rsvp';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';

const storageOneproviderIdKey = 'chooseDefaultOneproviderMixin.oneproviderId';

export function getStorageOneproviderKey(spaceId) {
  return `${storageOneproviderIdKey}-${spaceId}`;
}

export default Mixin.create({
  /**
   * @type {Storage}
   */
  _localStorage: localStorage,

  getStorageOneproviderKey,

  getBrowserDefaultOneproviderId(spaceId) {
    return this.get('_localStorage').getItem(this.getStorageOneproviderKey(spaceId));
  },

  setBrowserDefaultOneproviderId(oneproviderId, spaceId = this.get('space.entityId')) {
    return this.get('_localStorage')
      .setItem(this.getStorageOneproviderKey(spaceId), oneproviderId);
  },

  /**
   * Find Oneprovider that should be currently chosen if saved default Oneprovider
   * is not available
   * @param {Array<Models.Provider>} onlineOneproviders 
   * @returns {Models.Provider}
   */
  findCurrentDefaultOneprovider(onlineOneproviders) {
    const sortedOnlineOneproviders = [...onlineOneproviders.toArray()].sort(
      createPropertyComparator('name')
    );
    return allSettled(sortedOnlineOneproviders.mapBy('versionProxy'))
      .then(onlineVersionsResult => {
        const oneprovider = sortedOnlineOneproviders.objectAt(
          onlineVersionsResult.findIndex(({ state, value }) =>
            state === 'fulfilled' && !isStandaloneGuiOneprovider(value)
          )
        );
        if (oneprovider) {
          return oneprovider;
        } else {
          return sortedOnlineOneproviders[0];
        }
      });
  },

  chooseDefaultOneprovider(
    oneproviders = this.get('providers'),
    spaceId = this.get('space.entityId')
  ) {
    if (!oneproviders) {
      return resolve(null);
    }
    const defaultId = this.getBrowserDefaultOneproviderId(spaceId);
    const onlineOneproviders = oneproviders.filterBy('online');
    const savedDefaultOneprovider = (
      defaultId && onlineOneproviders.findBy('entityId', defaultId)
    );
    return savedDefaultOneprovider && resolve(savedDefaultOneprovider) ||
      this.findCurrentDefaultOneprovider(onlineOneproviders);
  },
});
