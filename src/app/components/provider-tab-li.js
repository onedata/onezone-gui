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
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TabBarLi.extend(I18n, {
  layout,

  providerManager: service(),

  i18nPrefix: 'components.providerTabLi',

  /**
   * @type {ComputedProperty<Promise<Models.Provider>>}
   */
  provider: computed('item.id', function provider() {
    const itemId = this.get('item.id');
    const providerManager = this.get('providerManager');
    return providerManager.getRecordById(itemId);
  }),
});
