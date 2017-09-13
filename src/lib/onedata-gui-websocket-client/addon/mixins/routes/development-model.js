/**
 * Adds mocked model generation step on `beforeModel` hook
 *
 * Do not forget to implement virtual functions!
 *
 * @module mixins/routes/development-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @abstract
 */

import Ember from 'ember';

import config from 'ember-get-config';
import { isDevelopment, isModelMocked } from 'onedata-gui-websocket-client/utils/development-environment';
import { Promise } from 'rsvp';

export default Ember.Mixin.create({
  /**
   * @type {object} Ember Config (eg. ember-get-config)
   */
  envConfig: config,

  /**
   * @type {Function}
   */
  isDevelopment,

  /**
   * @type {Function}
   */
  isModelMocked,

  /**
   * @virtual
   * @returns {Promise<undefined, any>}
   */
  generateDevelopmentModel() {
    throw new Error(
      'route:<development-model-mixin>: generateDevelopmentModel not implemented'
    );
  },

  beforeModel() {
    this._super(...arguments);
    const {
      store,
      envConfig,
    } = this.getProperties('store', 'envConfig');
    if (this.isDevelopment(envConfig)) {
      return this.isModelMocked(store).then(isMocked => {
        if (isMocked) {
          console.debug(
            'route:application: development environment, model already mocked'
          );
          return Promise.resolve();
        } else {
          return this.generateDevelopmentModel(store);
        }
      });
    } else {
      return Promise.resolve();
    }
  },
});
