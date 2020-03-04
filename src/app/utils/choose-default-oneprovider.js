/**
 * Resolves first found online Oneprovider with embeddable GUI or first online Oneprovider
 * with old version if there is no new OPs.
 * 
 * @module utils/choose-default-provider
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve, all as allFulfilled } from 'rsvp';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';

export default function chooseDefaultOneprovider(providers) {
  if (!providers) {
    return resolve(null);
  }
  const onlineProviders = providers.filterBy('online');
  return allFulfilled(onlineProviders.mapBy('versionProxy'))
    .then(onlineVersions =>
      onlineProviders.objectAt(onlineVersions.findIndex(ver => !isStandaloneGuiOneprovider(ver)))
    )
    .then(provider => {
      if (provider) {
        return provider;
      } else {
        return onlineProviders[0];
      }
    });
}
