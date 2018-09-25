/**
 * Provides data and implementation of utils specific for onezone-gui
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

export default GuiUtils.extend(UserProxyMixin, {
  onedataConnection: service(),

  currentUser: service(),

  /**
   * @override
   */
  defaultProviderId: computed('userProxy.content.defaultProviderId', function () {
    return this.get('userProxy.content.defaultProviderId');
  }),

  /**
   * @override 
   * @param {string} providerEntityId 
   */
  setDefaultProviderId(providerEntityId) {
    return this.get('userProxy')
      .then(user => user.setDefaultProviderId(providerEntityId));
  },

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
  guiVersion: reads('onedataConnection.serviceVersion'),

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
