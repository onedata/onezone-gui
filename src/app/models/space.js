/**
 * @module models/space
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onezone-gui/mixins/models/inviting-model';
import spacePrivilegesFlags from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import computedCurrentUserPrivileges from 'onedata-gui-common/utils/computed-current-user-privileges';

/**
 * @typedef {Object} SpaceSupportParameters
 * @property {boolean} accountingEnabled
 * @property {boolean} dirStatsServiceEnabled
 * @property {DirStatsServiceStatus} dirStatsServiceStatus
 */

/**
 * @typedef {'initializing'|'enabled'|'stopping'|'disabled'} DirStatsServiceStatus
 */

export const entityType = 'space';
export const aspects = {
  supportParameters: 'support_parameters',
};

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),
  currentUser: service(),
  privilegeManager: service(),

  name: attr('string'),
  scope: attr('string'),
  currentUserEffPrivileges: attr('array', { defaultValue: () => [] }),
  currentUserIsOwner: attr('boolean'),
  directMembership: attr('boolean', { defaultValue: false }),
  // FIXME: prototype fields for marketplace
  advertisedInMarketplace: attr('boolean', { defaultValue: false }),
  organizationName: attr('string'),
  description: attr('string'),
  tags: attr('array', { defaultValue: () => [] }),
  contactEmail: attr('string'),

  /**
   * Maps: provider name => capacity in bytes provided for this space
   * @type {Object}
   */
  supportSizes: attr('object'),

  /**
   * Maps: Oneprovider ID -> parameters of specific Oneprovider space support
   * @type {ComputedProperty<Object<string, SpaceSupportParameters>>}
   */
  supportParametersRegistry: attr('object'),

  /**
   * Information about space. Available fields:
   * creatorType, creatorName, creationTime, sharesCount
   * @type {Object}
   */
  info: attr('object'),

  membership: belongsTo('membership'),

  providerList: belongsTo('providerList'),

  // members of this space
  shareList: belongsTo('shareList'),
  groupList: belongsTo('groupList'),
  userList: belongsTo('userList'),
  effGroupList: belongsTo('groupList'),
  effUserList: belongsTo('userList'),
  ownerList: belongsTo('userList'),
  harvesterList: belongsTo('harvesterList'),

  //#region utils

  /**
   * True, if user has a "View space" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: reads('privileges.view'),

  canViewPrivileges: reads('privileges.viewPrivileges'),

  totalSize: computed('supportSizes', function getTotalSize() {
    return _.sum(_.values(this.get('supportSizes')));
  }),

  privileges: computedCurrentUserPrivileges({ allFlags: spacePrivilegesFlags }),

  //#endregion

  /**
   * @param {string} token
   * @returns {Promise<Model.Harvester>}
   */
  joinHarvester(token) {
    return this.joinRelation('harvester', token);
  },

  joinRelation(entityType, token) {
    return this.get('onedataGraphUtils').joinRelation(
      entityType,
      token, ['asSpace', this.get('entityId')]
    ).then(({ gri }) =>
      this.get('store').findRecord(entityType, gri)
    );
  },
}).reopenClass(StaticGraphModelMixin);
