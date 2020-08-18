/**
 * @module models/harvester
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';

import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onezone-gui/mixins/models/inviting-model';

export const entityType = 'harvester';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  name: attr('string'),
  scope: attr('string'),
  canViewPrivileges: attr('boolean', { defaultValue: false }),
  directMembership: attr('boolean', { defaultValue: false }),

  /**
   * @type {string}
   */
  harvestingBackendType: attr('string'),

  /**
   * @type {string}
   */
  harvestingBackendEndpoint: attr('string'),

  /**
   * @type {boolean}
   */
  public: attr('boolean'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiPluginPath: computed('entityId', function guiPluginPath() {
    const entityId = this.get('entityId');
    return `/hrv/${entityId}`;
  }),

  /**
   * Information about harvester. Available fields:
   * creationTime
   * @type {Object}
   */
  info: attr('object'),

  membership: belongsTo('membership'),

  // members of this harvester
  groupList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),
  effGroupList: belongsTo('groupList'),
  effUserList: belongsTo('sharedUserList'),
  spaceList: belongsTo('spaceList'),
  effProviderList: belongsTo('providerList'),
  indexList: belongsTo('indexList'),

  /**
   * True, if user has a "View space" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: equal('scope', 'private'),

  /**
   * True if user is an effective member of that harvester
   * @type {Ember.ComputedProperty<boolean>}
   */
  isEffectiveMember: computed('scope', function isEffectiveMember() {
    return ['private', 'protected'].includes(this.get('scope'));
  }),
}).reopenClass(StaticGraphModelMixin);
