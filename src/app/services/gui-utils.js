/**
 * Provides data specific for onezone gui.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';

export default GuiUtils.extend({
  onedataConnection: inject(),

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
   * @param {object|string} model
   * @returns {string}
   */
  getRoutableIdFor(model) {
    return modelRoutableId(model);
  },
});
