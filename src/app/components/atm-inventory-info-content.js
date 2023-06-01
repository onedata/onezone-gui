/**
 * Content of popup with information about atm inventory
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AtmInventoryInfoContent from 'onedata-gui-common/components/atm-inventory-info-content';

export default AtmInventoryInfoContent.extend({
  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  linkToAtmInventory: computed('record', function linkToAtmInventory() {
    try {
      return this.router.urlFor(
        'onedata.sidebar.content.aspect',
        'atm-inventories',
        this.guiUtils.getRoutableIdFor(this.record),
        'workflows'
      );
    } catch (error) {
      return null;
    }
  }),
});
