/**
 * Single tab for provider used in one-tab-bar (it's parent component should be
 * `one-tab-bar/tab-bar-ul`).
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/provider-tab-li';
import TabBarLi from 'onedata-gui-common/components/one-tab-bar/tab-bar-li';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import Version from 'onedata-gui-common/utils/version';

export default TabBarLi.extend(I18n, {
  layout,

  providerManager: service(),

  i18nPrefix: 'components.providerTabLi',

  /**
   * @virtual
   * @type {OneproviderTabItem}
   */
  item: undefined,

  /**
   * If specified, the tab will show warning if the provider is in version lower than
   * required version.
   * @virtual optional
   */
  requiredVersion: reads('item.context.requiredVersion'),

  /**
   * @type {ComputedProperty<PromiseObject<Models.Provider>>}
   */
  providerProxy: computed('item.id', function providerProxy() {
    const itemId = this.get('item.id');
    const providerManager = this.get('providerManager');
    return providerManager.getRecordById(itemId);
  }),

  provider: reads('providerProxy.content'),

  providerVersion: reads('provider.version'),

  isInRequiredVersion: computed(
    'requiredVersion',
    'provider.version',
    function isInRequiredVersion() {
      if (!this.providerVersion) {
        return false;
      }
      if (!this.requiredVersion) {
        return true;
      }
      return Version.isRequiredVersion(
        this.providerVersion,
        this.requiredVersion
      );
    },
  ),
});
