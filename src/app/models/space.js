/**
 * @module models/space
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import _ from 'lodash';

import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  name: attr('string'),
  scope: attr('string'),
  canViewPrivileges: attr('boolean', { defaultValue: false }),
  directMembership: attr('boolean', { defaultValue: false }),

  /**
   * Maps: provider name => capacity in bytes provided for this space
   * @type {Object}
   */
  supportSizes: attr('object'),

  /**
   * Information about space. Available fields:
   * creatorType, creatorName, creationTime, sharedDirectories
   * @type {Object}
   */
  info: attr('object'),

  membership: belongsTo('membership'),

  providerList: belongsTo('providerList'),

  // members of this space
  groupList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),
  effGroupList: belongsTo('groupList'),
  effUserList: belongsTo('sharedUserList'),

  /**
   * True, if user has a "View space" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: equal('scope', 'private'),

  //#region utils

  totalSize: computed('supportSizes', function getTotalSize() {
    return _.sum(_.values(this.get('supportSizes')));
  }),

  //#endregion
});