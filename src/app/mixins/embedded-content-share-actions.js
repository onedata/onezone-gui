/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
  shareManager: service(),

  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').changeRouteAspectOptions({
        dirId,
      });
    },
    async reloadCurrentShareRecord() {
      if (!this.shareId) {
        return;
      }
      const share = await this.shareManager?.getShareById(this.shareId);
      await share?.reload();
    },
  },
});
