/**
 * Defines resources that could be used by external harvester application.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { reject, resolve } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import globals from 'onedata-gui-common/utils/globals';
import GoToFileUrlActionHandler from 'onezone-gui/utils/url-action-handlers/go-to-file';

export default Service.extend({
  navigationState: service(),
  harvesterManager: service(),
  currentUser: service(),
  router: service(),

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
      dataCurlCommandRequest: (...args) => this.dataCurlCommandRequest(...args),
      configRequest: (...args) => this.configRequest(...args),
      viewModeRequest: () => this.viewModeRequest(),
      userRequest: () => this.getCurrentUser(),
      onezoneUrlRequest: () => this.getOnezoneUrl(),
      fileBrowserUrlRequest: (...args) => this.getFileBrowserUrl(...args),
      spacesRequest: () => this.getSpaces(),
    };
  },

  async getIndexRelatedRequestOptions(requestOptions = {}) {
    const {
      harvesterId,
      harvesterIndices,
    } = this.getProperties(
      'harvesterId',
      'harvesterIndices'
    );

    const completedRequestOptions = { ...requestOptions };
    completedRequestOptions.viewMode = await this.viewModeRequest();
    if (!harvesterId) {
      return reject('Harvester ID is not specified.');
    } else {
      completedRequestOptions.harvesterId = harvesterId;

      const indexName = get(requestOptions, 'indexName');
      const availableIndices = await harvesterIndices;
      const index = availableIndices.findBy('guiPluginName', indexName);
      if (!index) {
        throw new Error(`Cannot find index "${indexName}".`);
      } else {
        completedRequestOptions.indexId = get(index, 'aspectId');
      }
    }
    return completedRequestOptions;
  },

  /**
   * @param {Object} requestOptions
   * @param {String} requestOptions.indexName
   * @returns {Promise<any>} resolves to request result
   */
  dataRequest(requestOptions) {
    return this.getIndexRelatedRequestOptions(requestOptions).then(options =>
      this.get('harvesterManager').dataRequest(options)
    );
  },

  /**
   * @param {Object} requestOptions
   * @param {String} requestOptions.indexName
   * @returns {Promise<any>} resolves to curl request command
   */
  dataCurlCommandRequest(requestOptions) {
    return this.getIndexRelatedRequestOptions(requestOptions).then(options =>
      this.get('harvesterManager').dataCurlRequest(options)
    );
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
   *  - `private` (access via harvester page inside Onezone layout)
   */
  viewModeRequest() {
    const router = this.get('router');
    const mode = router.isActive('public.harvesters') ? 'public' : 'private';
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
    const url = globals.location.origin + globals.location.pathname;
    return resolve(url);
  },

  /**
   * Returns url, which opens file browser at specified file
   * @param {String} cdmiObjectId
   * @returns {Promise<String>}
   */
  getFileBrowserUrl(cdmiObjectId) {
    return GoToFileUrlActionHandler.create({ ownerSource: this })
      .generatePrettyUrl({ fileId: cdmiObjectId, fileAction: 'show' });
  },

  /**
   * @returns {Promise<Array<{ id: String, name: String }>>}
   */
  getSpaces() {
    const harvester = this.get('harvester');

    if (!harvester || !get(harvester, 'hasViewPrivilege')) {
      return resolve([]);
    }

    return harvester.getRelation('spaceList')
      .then(spaceList => get(spaceList, 'list'))
      .then(list => list.map(space => ({
        id: get(space, 'entityId'),
        name: get(space, 'name'),
      })))
      // errors are a normal situation, espacially forbidden errors in public view
      .catch(() => []);
  },
});
