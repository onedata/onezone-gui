/**
 * A set of functions helping with using app in development or production mode 
 *
 * @module utils/development-environment
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import userGri from 'onedata-gui-websocket-client/utils/user-gri';

const MOCK_USER_ID = 'stub_user_id';

/**
 * Checks if we are in environment that needs to create development model
 * 
 * @export
 * @param {object} config Ember application config, get it with: `ember-get-config`
 * @returns {boolean}
 */
export function isDevelopment(config) {
  let {
    APP: {
      MOCK_BACKEND,
    },
  } = config;
  return MOCK_BACKEND === true;
}

function getSingletonUser(store) {
  return store.findRecord('user', userGri(MOCK_USER_ID));
}

/**
 * Returns true if mode seems to be already mocked
 * 
 * @export
 * @param {EmberData.Store} store
 * @returns {Promise<boolean, any>}
 */
export function isModelMocked(store) {
  return getSingletonUser(store)
    .then(() => true)
    // TODO: only if not found
    .catch(() => false);
}

/**
 * Return one of two symbols based on MOCK_BACKEND flag from environment object
 * 
 * @export
 * @param {any} config an Ember environment object (get it with ember-get-config)
 * @param {any} productionSymbol 
 * @param {any} developmentSymbol 
 * @returns {any}
 */
export function environmentExport(config, productionSymbol, developmentSymbol) {
  return isDevelopment(config) ? developmentSymbol : productionSymbol;
}
