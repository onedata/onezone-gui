/**
 * Defines oprations related to harvester management.
 * 
 * @module services/harvester-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { Promise, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

export default Service.extend({
  onedataGraph: service(),
  onedataGraphUtils: service(),
  currentUser: service(),
  groupManager: service(),
  store: service(),

  /**
   * Fetches collection of all harvesters
   * @returns {Promise<DS.RecordArray<Harvester>>}
   */
  getHarvesters() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('harvesterList'))
      .then(harvesterList =>
        get(harvesterList, 'list').then(() => harvesterList)
      );
  },

  /**
   * Returns harvester with specified id
   * @param {string} id
   * @param {boolean} backgroundReload
   * @return {Promise<Harvester>}
   */
  getRecord(id, backgroundReload = true) {
    return this.get('store').findRecord('harvester', id, { backgroundReload });
  },

  /**
   * Creates new harvester
   * @param {Object} harvester
   * @returns {Promise<Harvester>}
   */
  createRecord(harvester) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord(
          'harvester',
          Object.assign({}, harvester, {
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          })
        ).save().then(harvester => this.reloadList().then(() => harvester));
      });
  },

  /**
   * Joins user to a harvester using given token
   * @param {string} token
   * @returns {Promise<Model.Harvester>}
   */
  joinHarvester(token) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.joinHarvester(token)
        .then(harvester => Promise.all([
          this.reloadList(),
          this.reloadUserList(get(harvester, 'entityId')).catch(ignoreForbiddenError),
          this.reloadEffUserList(get(harvester, 'entityId')).catch(ignoreForbiddenError),
        ]).then(() => harvester))
      );
  },

  /**
   * Removes user from a harvester
   * @param {string} harvesterEntityId
   * @returns {Promise}
   */
  leaveHarvester(harvesterEntityId) {
    const harvester = this.getLoadedHarvesterByEntityId(harvesterEntityId);
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveHarvester(harvesterEntityId))
      .then(destroyResult => {
        return Promise.all([
          this.reloadList(),
          harvester ? Promise.all([
            harvester.reload().catch(ignoreForbiddenError),
            this.reloadUserList(harvesterEntityId).catch(ignoreForbiddenError),
            this.reloadEffUserList(harvesterEntityId).catch(ignoreForbiddenError),
          ]) : resolve(),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Removes harvester
   * @param {string} id
   * @returns {Promise}
   */
  removeHarvester(id) {
    return this.getRecord(id, false)
      .then(record => record.destroyRecord())
      .then(destroyResult => this.reloadList().then(() => destroyResult));
  },

  /**
   * Reloads harvester list
   * @returns {Promise<HarvesterList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('harvesterList').reload(true));
  },

  /**
   * @param {string} harvesterEntityId 
   * @param {string} spaceEntityId
   * @returns {Promise}
   */
  removeSpaceFromHarvester(harvesterEntityId, spaceEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'harvester',
      harvesterEntityId,
      'space',
      spaceEntityId
    ).then(() =>
      this.reloadSpaceList(harvesterEntityId).catch(ignoreForbiddenError),
    );
  },

  /**
   * @param {string} harvesterEntityId 
   * @param {string} spaceEntityId
   * @returns {Promise}
   */
  addSpaceToHarvester(harvesterEntityId, spaceEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'harvester',
        entityId: harvesterEntityId,
        aspect: 'space',
        aspectId: spaceEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() =>
      this.reloadSpaceList(harvesterEntityId).catch(ignoreForbiddenError)
    );
  },

  /**
   * @param {string} harvesterEntityId 
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  removeGroupFromHarvester(harvesterEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'harvester',
      harvesterEntityId,
      'group',
      groupEntityId
    ).then(() =>
      Promise.all([
        this.reloadGroupList(harvesterEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(harvesterEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
      ])
    );
  },

  /**
   * @param {string} harvesterEntityId 
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeUserFromHarvester(harvesterEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    const harvester = this.getLoadedHarvesterByEntityId(harvesterEntityId);
    return this.get('onedataGraphUtils').leaveRelation(
      'harvester',
      harvesterEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(harvesterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(harvesterEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          this.reloadList(),
          harvester ? harvester.reload().catch(ignoreForbiddenError) : resolve(),
        ])),
      ])
    );
  },

  /**
   * Creates member group for specified harvester
   * @param {string} harvesterEntityId 
   * @param {Object} childGroupRepresentation
   * @return {Promise}
   */
  createMemberGroupForHarvester(harvesterEntityId, childGroupRepresentation) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => this.get('onedataGraph').request({
        gri: gri({
          entityType: 'harvester',
          entityId: harvesterEntityId,
          aspect: 'group',
          scope: 'auto',
        }),
        operation: 'create',
        data: childGroupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => {
        return Promise.all([
          this.reloadGroupList(harvesterEntityId).catch(ignoreForbiddenError),
          this.reloadEffGroupList(harvesterEntityId).catch(ignoreForbiddenError),
          this.get('groupManager').reloadList(),
        ]);
      }));
  },

  /**
   * Adds group to the members of a harvester
   * @param {string} harvesterEntityId 
   * @param {string} groupEntityId
   * @return {Promise}
   */
  addMemberGroupToHarvester(harvesterEntityId, groupEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'harvester',
        entityId: harvesterEntityId,
        aspect: 'group',
        aspectId: groupEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => Promise.all([
        this.reloadGroupList(harvesterEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(harvesterEntityId).catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * Joins user to a harvester without token
   * @param {string} harvesterEntityId
   * @returns {Promise}
   */
  joinHarvesterAsUser(harvesterEntityId) {
    const harvester = this.getLoadedHarvesterByEntityId(harvesterEntityId);
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties('currentUser', 'onedataGraph');
    return currentUser.getCurrentUserRecord()
      .then(user =>
        onedataGraph.request({
          gri: gri({
            entityType: 'harvester',
            entityId: harvesterEntityId,
            aspect: 'user',
            aspectId: get(user, 'entityId'),
            scope: 'private',
          }),
          operation: 'create',
          subscribe: false,
        })
      )
      .then(() => Promise.all([
        harvester ? harvester.reload() : resolve(),
        this.reloadUserList(harvesterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(harvesterEntityId).catch(ignoreForbiddenError),
      ]));
  },

  /**
   * Performs request to elasticsearch
   * @param {string} harvesterId
   * @param {string} method
   * @param {string} path
   * @param {any} body
   * @returns {Promise<any>} request result
   */
  esRequest(harvesterId, method, path, body) {
    const onedataGraph = this.get('onedataGraph');

    const requestData = {
      method,
      path,
      body,
    };
    return onedataGraph.request({
      gri: gri({
        entityType: 'harvester',
        entityId: harvesterId,
        aspect: 'query',
        scope: 'private',
      }),
      operation: 'create',
      data: requestData,
      subscribe: false,
    }).then(response => {
      const { code, body } = response;
      if (code >= 200 && code < 300) {
        let results = {};
        try {
          results = JSON.parse(body);
        } catch (e) {
          throw new Error('Malformed Elasticsearch response');
        }
        return results;
      } else {
        throw new Error('Request failure. Error details: ' + JSON.stringify(response));
      }
    });
    // return new Promise((resolve, reject) => {
    //   $.ajax({
    //     method,
    //     url: 'http://localhost:9200' + path,
    //     data: body,
    //     contentType: 'application/json; charset=UTF-8',
    //   }).then(resolve, reject);
    // });
  },

  /**
   * Gets harvester configuration
   * @param {string} harvesterId
   * @returns {Promise<HarvesterConfiguration>}
   */
  getConfig(harvesterId) {
    const store = this.get('store');
    return store.findRecord('harvesterConfiguration', gri({
      entityType: 'harvester',
      entityId: harvesterId,
      aspect: 'config',
      scope: 'private',
    }));
  },

  /**
   * Gets available harvester plugins list
   * @returns {PromiseArray<string>}
   */
  getPluginsList() {
    const onedataGraph = this.get('onedataGraph');
    return PromiseArray.create({
      promise: onedataGraph.request({
        gri: gri({
          entityType: 'harvester',
          aspect: 'all_plugins',
          scope: 'private',
        }),
        operation: 'get',
        subscribe: false,
      }).then(({ allPlugins }) => allPlugins),
    });
  },

  /**
   * Loads gui plugin manifest.json file
   * @param {string} harvesterEntityId
   * @returns {Promise<Object>} manifest file content
   */
  getGuiPluginManifest(harvesterEntityId) {
    this.getRecord(harvesterEntityId, false).then(harvester => {
      return new Promise((resolve, reject) => {
        $.ajax({
          dataSourceType: 'json',
          url: get(harvester, 'guiPluginHttpLocation') + '/manifest.json',
          success: resolve,
          error: (jqXHR, type, details) => reject({ type, details }),
        });
      });
    });
  },

  /**
   * Returns already loaded harvester by entityId (or undefined if not loaded)
   * @param {string} entityId harvester entityId
   * @returns {Model.Harvester|undefined}
   */
  getLoadedHarvesterByEntityId(entityId) {
    return this.get('store').peekAll('harvester').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from space identified by entityId.
   * @param {string} entityId space entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const harvester = this.getLoadedHarvesterByEntityId(entityId);
    return harvester ? harvester.reloadList(listName) : resolve();
  },

  /**
   * Reloads spaceList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadSpaceList(entityId) {
    return this.reloadModelList(entityId, 'spaceList');
  },

  /**
   * Reloads groupList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadGroupList(entityId) {
    return this.reloadModelList(entityId, 'groupList');
  },

  /**
   * Reloads effGroupList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadEffGroupList(entityId) {
    return this.reloadModelList(entityId, 'effGroupList');
  },

  /**
   * Reloads userList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },

  /**
   * Reloads effUserList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadEffUserList(entityId) {
    return this.reloadModelList(entityId, 'effUserList');
  },
});
