/**
 * @module models/space
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { computed, get } from '@ember/object';
import { equal, reads } from '@ember/object/computed';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onezone-gui/mixins/models/inviting-model';
import { promise } from 'ember-awesome-macros';
import { flags as allSpacePrivilegeFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { currentUserSpacePrivileges } from 'onedata-gui-common/utils/computed-current-user-space-privileges';
import { all as allFulfilled } from 'rsvp';

export const entityType = 'space';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),
  currentUser: service(),
  privilegeManager: service(),

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
   * creatorType, creatorName, creationTime, sharesCount
   * @type {Object}
   */
  info: attr('object'),

  membership: belongsTo('membership'),

  providerList: belongsTo('providerList'),

  // members of this space
  shareList: belongsTo('shareList'),
  groupList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),
  effGroupList: belongsTo('groupList'),
  effUserList: belongsTo('sharedUserList'),
  ownerList: belongsTo('sharedUserList'),
  harvesterList: belongsTo('harvesterList'),

  /**
   * True, if user has a "View space" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: equal('scope', 'private'),

  //#region utils

  totalSize: computed('supportSizes', function getTotalSize() {
    return _.sum(_.values(this.get('supportSizes')));
  }),

  currentUserIsOwnerProxy: promise.object(computed('ownerList.list.@each.entityId',
    function currentUserIsOwnerProxy() {
      const currentUserId = this.get('currentUser.userId');
      return this.get('ownerList').then(ownerList => {
        const owners = get(ownerList, 'list').mapBy('entityId');
        return owners.includes(currentUserId);
      });
    }
  )),

  currentUserPrivilegesRecordProxy: promise.object(computed(
    'currentUser.userId',
    'entityId',
    function currentUserEffPrivileges() {
      const {
        currentUser,
        entityId,
        store,
        privilegeManager,
      } = this.getProperties('currentUser', 'entityId', 'store', 'privilegeManager');
      const userId = get(currentUser, 'userId');
      const privilegeGri =
        privilegeManager.generateGri('space', entityId, 'user', userId);
      return store.findRecord('privilege', privilegeGri);
    }
  )),

  privilegesProxy: promise.object(computed(
    'currentUserIsOwnerProxy',
    'currentUserPrivilegesRecordProxy.privileges.[]',
    function privilegesProxy() {
      const {
        currentUserIsOwnerProxy,
        currentUserPrivilegesRecordProxy,
      } = this.getProperties(
        'currentUserIsOwnerProxy',
        'currentUserPrivilegesRecordProxy'
      );
      return allFulfilled([currentUserIsOwnerProxy, currentUserPrivilegesRecordProxy])
        .then(([currentUserIsOwner, currentUserPrivilegesRecord]) => {
          return currentUserSpacePrivileges(
            allSpacePrivilegeFlags,
            get(currentUserPrivilegesRecord, 'privileges'),
            currentUserIsOwner
          );
        });
    },
  )),

  privileges: reads('privilegesProxy.content'),

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
