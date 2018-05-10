/**
 * @module models/user
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { inject } from '@ember/service';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import gri from 'onedata-gui-websocket-client/utils/gri';

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

  spaceList: belongsTo('spaceList'),
  groupList: belongsTo('groupList'),
  providerList: belongsTo('providerList'),
  clientTokenList: belongsTo('clientTokenList'),
  linkedAccountList: belongsTo('linkedAccountList'),

  //#region Non-store User operations

  getDefaultSpace() {
    const {
      store,
      defaultSpaceId,
    } = this.getProperties('store', 'defaultSpaceId', 'entityId');
    return store.findRecord('space', gri({
      entityType: 'space',
      entityId: defaultSpaceId,
      aspect: 'instance',
    }));
  },

  setDefaultSpaceId(spaceId) {
    const operation = spaceId ? 'create' : 'delete';
    const entityId = this.get('entityId');
    return this.get('onedataGraph')
      .request({
        gri: gri({
          entityType: 'user',
          entityId,
          aspect: 'default_space',
        }),
        operation,
        data: {
          spaceId,
        },
      })
      .then(() => {
        return this.reload(true);
      });
  },

  leaveSpace(spaceId) {
    return this._leaveRelation('space', spaceId);
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
    return this.get('onedataGraph').request({
        gri: gri({
          entityType,
          aspect: 'join',
          scope: 'private',
        }),
        operation: 'create',
        data: {
          token,
        },
        authHint: ['asUser', this.get('entityId')],
      })
      .then(({ gri }) => {
        return this._reloadList(entityType)
          .then(() => this.get('store').findRecord(entityType, gri));
      });
  },

  _reloadList(entityType) {
    return this.belongsTo(`${entityType}List`).reload();
  },

  //#endregion
});
