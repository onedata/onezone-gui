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

import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  name: attr('string'),
  scope: attr('string'),
  canViewPrivileges: attr('boolean', { defaultValue: false }),
  directMembership: attr('boolean', { defaultValue: false }),

  /**
   * Harvester configuration
   * @type {Object}
   */
  config: attr('object'),

  /**
   * Elasticsearch endpoint
   * @type {string}
   */
  endpoint: attr('string'),

  /**
   * @type {string}
   */
  plugin: attr('string'),

  /**
   * Harvester GUI plugin path
   * @type {Object}
   */
  // guiPluginPath: attr('string'),
  guiPluginPath: '/harvester_gui/index.html',

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

  /**
   * True, if user has a "View space" privilege
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: equal('scope', 'private'),
});
