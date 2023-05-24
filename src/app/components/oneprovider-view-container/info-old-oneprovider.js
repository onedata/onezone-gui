/**
 * Information about no supporting Oneproviders in required versions for the space
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['info-old-oneprovider'],

  i18n: service(),
  router: service(),

  i18nPrefix: 'components.oneproviderViewContainer.infoOldOneprovider',

  /**
   * @virtual
   * @type {string}
   */
  requiredVersion: undefined,

  /**
   * @virtual
   * @type {'allOld'|'allNewOffline'|'selectedOld'}
   */
  infoType: undefined,

  /**
   * For `selectedOld` info type, selected Oneprovider version to show.
   * @virtual optional
   * @type {string}
   */
  selectedProviderVersion: undefined,
});
