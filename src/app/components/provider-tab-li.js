/**
 * Single tab for provider used in one-tab-bar (it's parent component should be 
 * `one-tab-bar/tab-bar-ul`).
 * 
 * @module components/provider-tab-li
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/provider-tab-li';
import TabBarLi from 'onedata-gui-common/components/one-tab-bar/tab-bar-li';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default TabBarLi.extend({
  layout,

  providerManager: service(),

  /**
   * @type {ComputedProperty<Promise<Models.Provider>>}
   */
  provider: computed('item.id', function provider() {
    const itemId = this.get('item.id');
    const providerManager = this.get('providerManager');
    return providerManager.getRecordById(itemId);
  }),
});
