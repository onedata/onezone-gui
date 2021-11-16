/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @module mixins/embedded-content-share-actions
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  _location: location,

  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').changeRouteAspectOptions({
        dirId,
      });
    },
  },
});
