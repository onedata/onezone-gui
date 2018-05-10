/**
 * @module models/group
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  name: attr('string'),
  type: attr('string'),

  userPermissionList: belongsTo('group-user-permission-list'),
  groupPermissionList: belongsTo('group-group-permission-list'),

  // for features, that will be moved from OP GUI to OZ GUI
  // spaceList: belongsTo('spaceList'),

  // // members of this group
  // sharedUserList: belongsTo('sharedUserList'),
  // sharedGroupList: belongsTo('sharedGroupList'),
});
