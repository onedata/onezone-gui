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
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import cdmiObjectIdToGuid from 'onedata-gui-common/utils/cdmi-object-id-to-guid';
import { getSpaceIdFromFileId } from 'onedata-gui-common/utils/file-id-parsers';

export default Service.extend({
  navigationState: service(),
  harvesterManager: service(),
  currentUser: service(),
  router: service(),

  /**
   * @type {Location}
   */
  _location: window.location,

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
        .then(indexList => indexList ?
          get(indexList, 'list') : reject({ id: 'forbidden' })
        );
    }
    return PromiseArray.create({
      promise,
    });
  }),

  /**
   * @returns {Object}
   */
  createAppProxyObject() {
    return {
      dataRequest: (...args) => this.dataRequest(...args),
      configRequest: (...args) => this.configRequest(...args),
      viewModeRequest: () => this.viewModeRequest(),
      userRequest: () => this.getCurrentUser(),
      onezoneUrlRequest: () => this.getOnezoneUrl(),
      fileBrowserUrlRequest: (...args) => this.getFileBrowserUrl(...args),
    };
  },

  /**
   * @param {Object} requestOptions
   * @param {string} requestOptions.indexName
   * @returns {Promise<any>} resolves to request result
   */
  dataRequest(requestOptions) {
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
      return reject('Harvester ID is not specified.');
    } else {
      const indexName = get(requestOptions, 'indexName');
      return harvesterIndices.then(indices => {
        const index = indices.findBy('guiPluginName', indexName);
        if (!index) {
          throw new Error(`Cannot find index "${indexName}".`);
        } else {
          const indexId = get(index, 'aspectId');
          requestOptions = _.assign({ harvesterId, indexId }, requestOptions);
          return harvesterManager.dataRequest(requestOptions);
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
      return harvesterManager.getGuiPluginConfig(harvesterId)
        .then(config => _.cloneDeep(get(config, 'guiPluginConfig')));
    }
  },

  /**
   * @returns {Promise<string>} resolves to gui plugin mode. One of:
   *  - `public` (public access outside Onezone layout)
   *  - `internal` (access via harvester page inside Onezone layout)
   */
  viewModeRequest() {
    const router = this.get('router');
    const mode = router.isActive('public.harvesters') ? 'public' : 'internal';
    return resolve(mode);
  },

  /**
   * Returns object containing info about current user. If there is no active
   * session, promise will resolve to null.
   * @returns {Promise<Object>}
   */
  getCurrentUser() {
    const currentUser = this.get('currentUser');
    return currentUser.getCurrentUserRecord().then(
      user => {
        const {
          entityId,
          fullName,
          username,
        } = getProperties(user, 'entityId', 'fullName', 'username');
        // Info about user should be restricted to few field to protect private,
        // internal data of Onedata
        return {
          id: entityId,
          fullName,
          username,
        };
      },
      () => null,
    );
  },

  /**
   * Returns url to Onezone
   * @returns {Promise<String>}
   */
  getOnezoneUrl() {
    const _location = this.get('_location');
    const {
      origin,
      pathname,
    } = getProperties(_location, 'origin', 'pathname');

    const url = origin + pathname;
    return resolve(url);
  },

  /**
   * Returns url, which opens file browser at specified file
   * @param {String} cdmiObjectId
   * @returns {Promise<String>}
   */
  getFileBrowserUrl(cdmiObjectId) {
    let fileId;
    let spaceId;
    try {
      fileId = cdmiObjectIdToGuid(cdmiObjectId);
      spaceId = getSpaceIdFromFileId(fileId);
    } catch (error) {
      console.error(error);
      return resolve('');
    }

    return this.getOnezoneUrl().then(onezoneUrl => {
      const onezoneRouteUrl = this.get('router').urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'data', {
          queryParams: {
            options: serializeAspectOptions({ dir: fileId, selected: fileId }),
          },
        });
      return onezoneRouteUrl ? `${onezoneUrl}${onezoneRouteUrl}` : '';
    });
  },
});
