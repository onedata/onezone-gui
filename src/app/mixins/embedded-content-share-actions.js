/**
 * Common Onezone-side actions for embedded Oneprovider share views
 * 
 * @module mixins/embedded-content-share-actions
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default Mixin.create({
  _location: location,

  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').setAspectOptions({
        dirId,
      });
    },
    getDataUrl({ spaceId, dirId, providerId }) {
      const {
        _location,
        router,
        navigationState,
      } = this.getProperties('_location', 'router', 'navigationState');
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'data', {
          queryParams: {
            options: serializeAspectOptions(
              navigationState.mergedAspectOptions({ dirId, providerId })
            ),
          },
        }
      );
    },
  },
});
