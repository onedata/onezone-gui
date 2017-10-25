/**
 * Override some methods of `ember-local-storage` adapter to be compatible
 * with Onedata backend
 *
 * @module adapters/local-storage
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LocalstorageAdapter from 'ember-local-storage/adapters/local';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default LocalstorageAdapter.extend({
  _storageKey() {
    return decodeURIComponent(this._super(...arguments));
  },

  /**
   * @override
   * @param {any} store 
   * @param {string} type 
   * @param {any} inputProperties 
   * @returns {string}
   */
  generateIdForRecord(store, type) {
    let aspect;
    let entityType;
    if (type.match(/.*-list/)) {
      entityType = 'unknown';
      aspect = type.match(/(.*)-list/)[1] + 's';
    } else {
      entityType = type;
      aspect = 'instance';
    }
    return gri(entityType, this._super(...arguments), aspect);
  },

  clearLocalStorage() {
    get(this, '_storage').clear();
  },
});
