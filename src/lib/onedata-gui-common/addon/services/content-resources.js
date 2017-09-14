/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Service.extend({
  /**
   * @param {string} type
   * @returns {Promise}
   */
  getModelFor( /* type, id */ ) {
    throw new Error('service:content-resources: not implemented')
  },
});