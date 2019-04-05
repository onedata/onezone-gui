/**
 * @module models/user
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { inject } from '@ember/service';
import { camelize } from '@ember/string';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Model.extend(GraphSingleModelMixin, {
  onedataGraph: inject(),
  onedataGraphUtils: inject(),

  isCollection: true,

  name: attr('string'),
  alias: attr('string'),

  /**
   * Entity ID of default space ID for user.
   * To change it, use `setDefaultSpaceId` method - record updates will not work.
   * @type {DS.attr}
   */
  defaultSpaceId: attr('string'),

  defaultProviderId: attr('string'),

  spaceList: belongsTo('spaceList'),
  groupList: belongsTo('groupList'),
  providerList: belongsTo('providerList'),
  clientTokenList: belongsTo('clientTokenList'),
  linkedAccountList: belongsTo('linkedAccountList'),
  clusterList: belongsTo('clusterList'),
  harvesterList: belongsTo('harvesterList'),

  //#region Non-store User operations

  getDefaultRelation(type) {
    const {
      store,
      entityId,
    } = this.getProperties('store', 'entityId');
    const defaultRelationId = this.get(camelize(`default-${type}-id`));
    return store.findRecord('space', gri({
      entityType: 'space',
      entityId: defaultRelationId,
      aspect: 'instance',
      authHint: ['asUser', entityId],
    }));
  },

  getDefaultSpace() {
    return this.getDefaultRelation('space');
  },

  getDefaultProvider() {
    return this.getDefaultRelation('provider');
  },

  setDefaultRelation(type, relationId) {
    const operation = relationId ? 'create' : 'delete';
    const entityId = this.get('entityId');
    return this.get('onedataGraph')
      .request({
        gri: gri({
          entityType: 'user',
          entityId,
          aspect: `default_${type}`,
        }),
        operation,
        data: {
          [camelize(`${type}-id`)]: relationId,
        },
        subscribe: false,
      })
      .then(() => {
        return this.reload(true);
      });
  },

  setDefaultSpaceId(spaceId) {
    this.setDefaultRelation('space', spaceId);
  },

  setDefaultProviderId(providerId) {
    this.setDefaultRelation('provider', providerId);
  },

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
   * 
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
});
