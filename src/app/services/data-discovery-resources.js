/**
 * Defines resources that could be used by external harvester application.
 * 
 * @module services/data-discovery-resources
 * @author Michal Borzecki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { reject, resolve } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

export default Service.extend({
  navigationState: service(),
  harvesterManager: service(),

  /**
   * Actual harvester, that should be used as a context for all data discovery
   * related requests
   * @type {Ember.ComputedProperty<models.Harvester|undefined>}
   */
  harvester: computed(
    'navigationState.{activeResourceType,activeResource}',
    function harvester() {
      const {
        activeResourceType,
        activeResource,
      } = getProperties(
        this.get('navigationState'),
        'activeResourceType',
        'activeResource'
      );
      if (activeResourceType === 'harvesters' && activeResource) {
        return activeResource;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  harvesterId: reads('harvester.entityId'),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Index>>}
   */
  harvesterIndices: computed('harvester', function harvesterIndices() {
    const harvester = this.get('harvester');
    let promise;
    if (!harvester) {
      promise = resolve([]);
    } else {
      promise = get(harvester, 'indexList')
        .then(indexList => get(indexList, 'list'));
    }
    return PromiseArray.create({
      promise,
    });
  }),

  /**
   * @param {Object} requestOptions
   * @param {string} requestOptions.indexName
   * @returns {Promise<any>} resolves to request result
   */
  esRequest(requestOptions) {
    const {
      harvesterId,
      harvesterManager,
      harvesterIndices,
    } = this.getProperties(
      'harvesterId',
      'harvesterManager',
      'harvesterIndices'
    );

    if (!harvesterId) {
      return reject('Harvester is not specified.');
    } else {
      const indexName = get(requestOptions, 'indexName');
      return harvesterIndices.then(indices => {
        const index = indices.findBy('guiPluginName', indexName);
        if (!index) {
          throw new Error(`Cannot find index "${indexName}".`);
        } else {
          const indexId = get(index, 'aspectId');
          requestOptions = _.assign({ harvesterId, indexId }, requestOptions);
          return harvesterManager.esRequest(requestOptions);
        }
      });
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
        .then(config => _.cloneDeep(get(config, 'guiPluginConfig')));
    }
  },
});
