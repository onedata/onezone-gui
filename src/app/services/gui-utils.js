/**
 * Provides data and implementation of utils specific for onezone-gui
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { computed, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

export default GuiUtils.extend(UserProxyMixin, {
  onedataConnection: service(),

  currentUser: service(),

  /**
   * @override
   */
  guiType: computed(function () {
    return this.t('onezone');
  }),

  /**
   * @override
   */
  guiName: computed(function () {
    return this.get('onedataConnection.zoneName') || this.t('unnamedZone');
  }),

  /**
   * @override
   */
  softwareVersionDetails: computed(
    'onedataConnection.{serviceVersion,serviceBuildVersion}',
    function softwareVersionDetails() {
      const onedataConnection = this.get('onedataConnection');
      return getProperties(
        onedataConnection,
        'serviceVersion',
        'serviceBuildVersion'
      );
    },
  ),

  /**
   * @override
   */
  guiIcon: 'assets/images/onezone-logo.svg',

  /**
   * @override
   * @param {object|string} record
   * @returns {string}
   */
  getRoutableIdFor(record) {
    return modelRoutableId(record);
  },
});
