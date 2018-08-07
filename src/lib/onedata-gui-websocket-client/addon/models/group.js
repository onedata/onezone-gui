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
import { computed } from '@ember/object';
import { alias, equal } from '@ember/object/computed';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),

  name: attr('string'),
  type: attr('string'),
  scope: attr('string'),
  directMembership: attr('boolean'),
  canViewPrivileges: attr('boolean'),

  // for features, that will be moved from OP GUI to OZ GUI
  // spaceList: belongsTo('spaceList'),

  parentList: belongsTo('groupList'),
  childList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),

  /**
   * Alias to make access to the group/user members compatible with the space model
   * @type {Ember.ComputedProperty<GroupList>}
   */
  groupList: alias('childList'),

  /**
   * True if user is an effective member of that group
   * @type {Ember.ComputedProperty<boolean>}
   */
  membership: computed('scope', function membership() {
    return ['private', 'protected'].indexOf(this.get('scope')) !== -1;
  }),

  /**
   * True, if user has a "View group" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: equal('scope', 'private'),

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
