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

import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),

  name: attr('string'),
  type: attr('string'),
  scope: attr('string'),
  directMembership: attr('boolean', { defaultValue: false }),
  canViewPrivileges: attr('boolean', { defaultValue: false }),

  membership: belongsTo('membership'),

  parentList: belongsTo('groupList'),
  childList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),
  spaceList: belongsTo('spaceList'),

  /**
   * Alias to make access to the group/user members compatible with the space model
   * @type {Ember.ComputedProperty<GroupList>}
   */
  groupList: alias('childList'),

  /**
   * True if user is an effective member of that group
   * @type {Ember.ComputedProperty<boolean>}
   */
  isEffectiveMember: computed('scope', function isEffectiveMember() {
    return ['private', 'protected'].includes(this.get('scope'));
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
