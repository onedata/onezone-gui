/**
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import atmInventoryPrivilegesFlags from 'onedata-gui-websocket-client/utils/atm-inventory-privileges-flags';
import computedCurrentUserPrivileges from 'onedata-gui-common/utils/computed-current-user-privileges';

export const entityType = 'atm_inventory';

export default Model.extend(GraphSingleModelMixin, {
  name: attr('string'),
  scope: attr('string'),
  currentUserEffPrivileges: attr('array', { defaultValue: () => [] }),
  directMembership: attr('boolean', { defaultValue: false }),
  areEffPrivilegesRecalculated: attr('boolean'),

  groupList: belongsTo('groupList'),
  userList: belongsTo('userList'),
  effGroupList: belongsTo('groupList'),
  effUserList: belongsTo('userList'),

  atmWorkflowSchemaList: belongsTo('atmWorkflowSchemaList'),
  atmLambdaList: belongsTo('atmLambdaList'),

  /**
   * @type {ComputedProperty<Object>}
   */
  privileges: computedCurrentUserPrivileges({
    allFlags: atmInventoryPrivilegesFlags,
    flagsPrefix: 'atm_inventory',
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasViewPrivilege: reads('privileges.view'),

  /**
   * True if user is an effective member of that automation inventory
   * @type {Ember.ComputedProperty<boolean>}
   */
  isEffectiveMember: computed('scope', function isEffectiveMember() {
    return ['private', 'protected'].includes(this.get('scope'));
  }),
}).reopenClass(StaticGraphModelMixin);
