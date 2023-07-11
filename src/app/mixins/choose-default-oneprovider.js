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

  async chooseDefaultOneprovider({
    providers = (this.providers ?? []),
    spaceId = this.get('space.entityId'),
    requiredVersion,
  } = {}) {
    if (!providers) {
      return null;
    }
    const defaultId = this.getBrowserDefaultOneproviderId(spaceId);
    /** @type Array<Models.Provider> */
    let applicableProviders = providers.filter(provider => get(provider, 'online'));
    if (requiredVersion) {
      applicableProviders = applicableProviders.filter(provider => {
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
    return savedDefaultOneprovider ||
      findCurrentDefaultOneprovider(applicableProviders);
  },
});

/**
 * Find Oneprovider that should be currently chosen if saved default Oneprovider
 * is not available.
 * @param {Array<Models.Provider>} applicableOneproviders
 * @returns {Models.Provider}
 */
export function findCurrentDefaultOneprovider(applicableOneproviders) {
  assert(
    'findCurrentDefaultOneprovider: applicableOneproviders should be not null/undefined',
    applicableOneproviders
  );
  // sort providers from newest version to oldest and by name when versions are the same
  const nameComparator = createPropertyComparator('name');
  const sortedApplicableOneproviders = [...applicableOneproviders.toArray()]
    .sort((providerA, providerB) => {
      const versionCompareResult = -Version.compareVersions(
        get(providerA, 'version'),
        get(providerB, 'version')
      );
      if (versionCompareResult === 0) {
        return nameComparator(providerA, providerB);
      } else {
        return versionCompareResult;
      }
    });
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
}
