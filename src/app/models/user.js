/**
 * @module models/user
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export const entityType = 'user';

export default Model.extend(GraphSingleModelMixin, {
  onedataGraph: inject(),
  onedataGraphUtils: inject(),

  fullName: attr('string'),
  username: attr('string'),
  basicAuthEnabled: attr('boolean'),
  hasPassword: attr('boolean'),

  spaceList: belongsTo('spaceList'),
  groupList: belongsTo('groupList'),
  providerList: belongsTo('providerList'),
  tokenList: belongsTo('tokenList'),
  linkedAccountList: belongsTo('linkedAccountList'),
  clusterList: belongsTo('clusterList'),
  harvesterList: belongsTo('harvesterList'),

  name: alias('fullName'),

  //#region Non-store User operations

  leaveSpace(spaceId) {
    return this._leaveRelation('space', spaceId)
      .then(() => this.get('providerList'))
      .then(providerList => providerList.hasMany('list').reload());
  },

  leaveGroup(groupId) {
    return this._leaveRelation('group', groupId);
  },

  leaveHarvester(harvesterId) {
    return this._leaveRelation('harvester', harvesterId);
  },

  leaveCluster(clusterId) {
    return this._leaveRelation('cluster', clusterId);
  },

  joinSpace(token) {
    return this._joinRelation('space', token);
  },

  joinGroup(token) {
    return this._joinRelation('group', token);
  },

  joinHarvester(token) {
    return this._joinRelation('harvester', token);
  },

  joinCluster(token) {
    return this._joinRelation('cluster', token);
  },

  _leaveRelation(aspect, relationId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'user',
      this.get('entityId'),
      aspect,
      relationId,
    ).then(() => this._reloadList(aspect));
  },

  /**
   * @param {*} entityType 
   * @param {*} token 
   * @returns {Object} joined record
   */
  _joinRelation(entityType, token) {
    return this.get('onedataGraphUtils').joinRelation(
      entityType,
      token, ['asUser', this.get('entityId')]
    ).then(({ gri }) => {
      return this._reloadList(entityType)
        .then(() => this.get('store').findRecord(entityType, gri));
    });
  },

  _reloadList(entityType) {
    return this.belongsTo(`${entityType}List`).reload();
  },

  //#endregion
}).reopenClass(StaticGraphModelMixin);
