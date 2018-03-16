/**
 * @module models/group
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// for features, that will be moved from OP GUI to OZ GUI
// import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  name: attr('string'),
  type: attr('string'),

  // for features, that will be moved from OP GUI to OZ GUI
  // spaceList: belongsTo('spaceList'),

  // // members of this group
  // sharedUserList: belongsTo('sharedUserList'),
  // sharedGroupList: belongsTo('sharedGroupList'),
});
