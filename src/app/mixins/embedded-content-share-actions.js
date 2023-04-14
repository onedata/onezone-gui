/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').changeRouteAspectOptions({
        dirId,
      });
    },
  },
});
