/**
 * @module models/space
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  name: attr('string'),

  groupList: belongsTo('groupList'),

  // members of this space
  sharedUserList: belongsTo('sharedUserList'),
  sharedGroupList: belongsTo('sharedGroupList'),
});
