/**
 * Resolves first found online Oneprovider with embeddable GUI or first online Oneprovider
 * with old version if there are no new OPs.
 * 
 * @module utils/choose-default-oneprovider
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve, allSettled } from 'rsvp';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';

export default function chooseDefaultOneprovider(oneproviders) {
  if (!oneproviders) {
    return resolve(null);
  }
  const onlineOneproviders = oneproviders.filterBy('online');
  return allSettled(onlineOneproviders.mapBy('versionProxy'))
    .then(onlineVersionsResult => {
      const oneprovider = onlineOneproviders.objectAt(
        onlineVersionsResult.findIndex(({ state, value }) =>
          state === 'fulfilled' && !isStandaloneGuiOneprovider(value)
        )
      );
      if (oneprovider) {
        return oneprovider;
      } else {
        return onlineOneproviders[0];
      }
    });
}
