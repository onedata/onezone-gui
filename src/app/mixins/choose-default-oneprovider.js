/**
 * Resolves selected default Oneprovider for some space or tries to deduct a first default
 * Oneprovider if not chosen yet.
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';
import { assert } from '@ember/debug';
import globals from 'onedata-gui-common/utils/globals';
import Version from 'onedata-gui-common/utils/version';

const storageOneproviderIdKey = 'chooseDefaultOneproviderMixin.oneproviderId';

export function getStorageOneproviderKey(spaceId) {
  return `${storageOneproviderIdKey}-${spaceId}`;
}

export default Mixin.create({
  getStorageOneproviderKey,

  getBrowserDefaultOneproviderId(spaceId) {
    return globals.localStorage.getItem(this.getStorageOneproviderKey(spaceId));
  },

  setBrowserDefaultOneproviderId(oneproviderId, spaceId = this.get('space.entityId')) {
    return globals.localStorage
      .setItem(this.getStorageOneproviderKey(spaceId), oneproviderId);
  },

  /**
   * Find Oneprovider that should be currently chosen if saved default Oneprovider
   * is not available
   * @param {Array<Models.Provider>} oneproviders
   * @returns {Models.Provider}
   */
  findCurrentDefaultOneprovider(oneproviders) {
    assert(
      'findCurrentDefaultOneprovider: oneproviders should be not null/undefined',
      oneproviders
    );
    const sortedApplicableOneproviders = [...oneproviders.toArray()].sort(
      createPropertyComparator('name')
    );
    if (!sortedApplicableOneproviders.length) {
      return null;
    }
    // prefer embeddable (20.02+) providers as default
    const oneprovider = sortedApplicableOneproviders.find(provider => {
      const version = get(provider, 'version');
      return !isStandaloneGuiOneprovider(version);
    });
    if (oneprovider) {
      return oneprovider;
    } else {
      return sortedApplicableOneproviders[0];
    }
  },

  async chooseDefaultOneprovider({
    providers = (this.providers ?? []),
    spaceId = this.get('space.entityId'),
    requiredVersion,
  } = {}) {
    if (!providers) {
      return null;
    }
    const defaultId = this.getBrowserDefaultOneproviderId(spaceId);
    let applicableProviders = providers.filter(provider => get(provider, 'online'));
    if (requiredVersion) {
      applicableProviders = providers.filter(provider => {
        try {
          const providerVersion = get(provider, 'version');
          return Version.isRequiredVersion(providerVersion, requiredVersion);
        } catch {
          return false;
        }
      });
    }
    const savedDefaultOneprovider = (
      defaultId && applicableProviders.findBy('entityId', defaultId)
    );
    // FIXME: debug
    console.log('savedDefaultOneprovider', savedDefaultOneprovider);
    console.log('applicable', applicableProviders);
    return savedDefaultOneprovider ||
      this.findCurrentDefaultOneprovider(applicableProviders);
  },
});
