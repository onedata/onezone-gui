/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';
import Service from '@ember/service';
import RSVP from 'rsvp';

export default Service.extend({
  providerManager: inject(),
  clientTokenManager: inject(),

  /**
   * @param {string} type plural type of tab, eg. providers
   * @param {string} id record ID
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getRecord(id);
      case 'tokens':
        return this.get('clientTokenManager').getRecord(id);
      default:
        return new RSVP.Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
