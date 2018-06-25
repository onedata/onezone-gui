/**
 * @module models/user
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { inject } from '@ember/service';
import { camelize } from '@ember/string';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import gri from 'onedata-gui-websocket-client/utils/gri';
import joinRelation from 'onedata-gui-websocket-client/utils/join-relation';

export default Model.extend(GraphModelMixin, {
  onedataGraph: inject(),

  isCollection: true,

  name: attr('string'),
  login: attr('string'),

  /**
   * Entity ID of default space ID for user.
   * To change it, use `setDefaultSpaceId` method - model updates will not work.
   * @type {DS.attr}
   */
  defaultSpaceId: attr('string'),

  defaultProviderId: attr('string'),

  spaceList: belongsTo('spaceList'),
  groupList: belongsTo('groupList'),
  providerList: belongsTo('providerList'),
  clientTokenList: belongsTo('clientTokenList'),
  linkedAccountList: belongsTo('linkedAccountList'),

  //#region Non-store User operations

  getDetaultRelation(type) {
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

  joinSpace(token) {
    return this._joinRelation('space', token);
  },

  joinGroup(token) {
    return this._joinRelation('group', token);
  },

  _leaveRelation(aspect, relationId) {
    const entityId = this.get('entityId');
    return this.get('onedataGraph').request({
        gri: gri({
          entityType: 'user',
          entityId,
          aspect,
          aspectId: relationId,
        }),
        operation: 'delete',
      })
      .then(() => this._reloadList(aspect));
  },

  /**
   * 
   * @param {*} entityType 
   * @param {*} token 
   * @returns {Object} joined record
   */
  _joinRelation(entityType, token) {
    return joinRelation(
      this.get('onedataGraph'),
      entityType,
      token,
      ['asUser', this.get('entityId')]
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
