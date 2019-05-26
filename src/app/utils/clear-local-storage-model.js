import { Promise } from 'rsvp';

/**
 * Clears out localStorage model
 *
 * @module utils/clear-local-storage-model
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function clearLocalStorageModel(store) {
  store.adapterFor('user').clearLocalStorage();
  return Promise.resolve();
}
