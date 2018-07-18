/**
 * @module models/group
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),

  name: attr('string'),
  type: attr('string'),

  // for features, that will be moved from OP GUI to OZ GUI
  // spaceList: belongsTo('spaceList'),

  parentList: belongsTo('groupList'),
  childList: belongsTo('sharedGroupList'),
  userList: belongsTo('sharedUserList'),

  sharedUserList: alias('userList'),
  sharedGroupList: alias('childList'),

  joinSpace(token) {
    return this._joinRelation('space', token);
  },

  joinGroup(token) {
    return this._joinRelation('group', token);
  },

  _joinRelation(entityType, token) {
    return this.get('onedataGraphUtils').joinRelation(
      entityType,
      token, ['asGroup', this.get('entityId')]
    ).then(({ gri }) =>
      this.get('store').findRecord(entityType, gri)
    );
  },
});
