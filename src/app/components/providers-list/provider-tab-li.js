/**
 * Single tab for provider used in one-tab-bar (it's parent component should be 
 * `one-tab-bar/tab-bar-ul`).
 * 
 * @module components/providers-list/provider-tab-li
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../../templates/components/providers-list/provider-tab-li';
import TabBarLi from 'onedata-gui-common/components/one-tab-bar/tab-bar-li';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default TabBarLi.extend({
  layout,

  providerManager: service(),

  /**
   * @virtual
   * @type {string}
   */
  id: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Model.Provider>>}
   */
  provider: computed('id', function provider() {
    const { id, providerManager } = this.getProperties('id', 'providerManager');
    console.log(id);
    return providerManager.getRecordById(id);
  }),
});
