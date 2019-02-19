/**
 * Defines resources that could be used by external harvester application.
 * 
 * @module services/data-discovery-resources
 * @author Michal Borzecki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties, computed } from '@ember/object';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';

export default Service.extend({
  navigationState: service(),
  harvesterManager: service(),

  /**
   * Actual harvester ID, that should be used as a context for all data discovery
   * related requests
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  harvesterId: computed(
    'navigationState.{activeResourceType,activeResourceId}',
    function harvesterId() {
      const {
        activeResourceType,
        activeResourceId,
      } = getProperties(
        this.get('navigationState'),
        'activeResourceType',
        'activeResourceId'
      );
      if (activeResourceType === 'harvesters' && activeResourceId) {
        return activeResourceId;
      }
    }
  ),

  /**
   * @returns {Promise<any>} resolves to request result
   */
  esRequest() {
    const {
      harvesterId,
      harvesterManager,
    } = this.getProperties('harvesterId', 'harvesterManager');

    if (!harvesterId) {
      return reject('Harvester ID is not specified.');
    } else {
      return harvesterManager.esRequest(harvesterId, ...arguments);
    }
  },

  /**
   * @returns {Promise<Object>} resolves to harvester configuration object
   */
  configRequest() {
    const {
      harvesterId,
      harvesterManager,
    } = this.getProperties('harvesterId', 'harvesterManager');

    if (!harvesterId) {
      return reject('Harvester ID is not specified.');
    } else {
      return harvesterManager.getConfig(harvesterId)
        .then(config => get(config, 'configuration.guiPluginConfig'));
    }
  },
});
