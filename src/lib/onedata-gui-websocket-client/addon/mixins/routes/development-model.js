/**
 * Adds mocked model generation step on `beforeModel` hook
 *
 * Do not forget to implement virtual functions!
 * 
 * May be parametrized using developmentModelConfig property, which format is:
 * {
 *   clearOnReload {boolean} if true, model will be recreated on each page reload
 * }
 *
 * @module mixins/routes/development-model
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @abstract
 */

import Ember from 'ember';
import _ from 'lodash';
import config from 'ember-get-config';
import { isDevelopment, isModelMocked } from 'onedata-gui-websocket-client/utils/development-environment';
import { Promise } from 'rsvp';

// Default developmentModelConfig
const DEFAULT_CONFIG = {
  clearOnReload: true,
};

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
   * Configuration object for model.
   * @virtual
   * @type {object}
   */
  developmentModelConfig: {},

  /**
   * @virtual
   * @returns {Promise<undefined, any>}
   */
  generateDevelopmentModel() {
    throw new Error(
      'route:<development-model-mixin>: generateDevelopmentModel not implemented'
    );
  },

  /**
   * @virtual
   * @returns {Promise<undefined, any>}
   */
  clearDevelopmentModel() {
    return Promise.reject({
      message: 'route:<development-model-mixin>: clearDevelopmentModel not implemented',
    });
  },

  beforeModel() {
    this._super(...arguments);
    const {
      store,
      envConfig,
      developmentModelConfig,
    } = this.getProperties('store', 'envConfig', 'developmentModelConfig');
    if (this.isDevelopment(envConfig)) {
      const config = this._getDevelopmentModelConfig();
      const clearPromise = config.clearOnReload ?
        this.clearDevelopmentModel(store) : Promise.resolve();
      return clearPromise.then(() =>
        this.isModelMocked(store).then(isMocked => {
          if (isMocked) {
            console.debug(
              'route:application: development environment, model already mocked'
            );
            return Promise.resolve();
          } else {
            return this.generateDevelopmentModel(store, developmentModelConfig);
          }
        })
      );
    } else {
      return Promise.resolve();
    }
  },

  /**
   * Fills in developmentModelConfig with default data (if it is empty or
   * partially filled) and returns valid config.
   * @returns {Object}
   */
  _getDevelopmentModelConfig() {
    const config = _.assign({}, this.get('developmentModelConfig') || {});
    Object.keys(DEFAULT_CONFIG).forEach((key) => {
      if (config[key] === undefined) {
        config[key] = DEFAULT_CONFIG[key];
      }
    });
    return config;
  },
});
